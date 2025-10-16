/**
 * AI Sessions Repository
 *
 * Repository for managing AI Copilot sessions and messages.
 * Uses subcollection pattern for messages to avoid hot-document contention.
 *
 * @see docs/epic-13-unified-architecture-specification.md
 * @see docs/stories/13.1.ai-sessions-repository.md
 */

import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type {
  AISession,
  AIMessage,
  CreateSessionInput,
  AppendMessageInput,
  ContextSnapshot,
} from "@/lib/ai/types";

// Re-export types for external use
export type { ListMessagesOptions, PaginatedMessages } from "@/lib/ai/types";

// Import the types for internal use
import type { ListMessagesOptions, PaginatedMessages } from "@/lib/ai/types";

/**
 * Custom error class for AI Sessions repository operations
 */
export class AISessionsRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AISessionsRepositoryError";
  }
}

// Collection constants
const SESSIONS_COLLECTION = "aiSessions";
const MESSAGES_SUBCOLLECTION = "messages";

/**
 * Create a new AI session
 *
 * @param input - Session creation parameters
 * @returns Created AI session
 * @throws AISessionsRepositoryError if creation fails
 */
export async function createSession(input: CreateSessionInput): Promise<AISession> {
  try {
    const db = getDb();
    const now = Date.now();

    const sessionData = {
      userId: input.userId,
      caseId: input.caseId || null,
      title: input.title || "New Conversation",
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      contextSnapshot: {
        hash: "",
        userPrefs: {},
      },
      demo: input.demo || false,
    };

    const docRef = await db.collection(SESSIONS_COLLECTION).add(sessionData);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      // Fallback for eventual consistency
      return {
        id: docRef.id,
        ...sessionData,
      };
    }

    return mapSessionDocument(snapshot);
  } catch (error) {
    console.error("Failed to create AI session", { input, error });
    throw new AISessionsRepositoryError("Unable to create AI session", { cause: error });
  }
}

/**
 * Append a message to a session's subcollection
 *
 * @param sessionId - Session ID to append message to
 * @param message - Message data
 * @returns Created message
 * @throws AISessionsRepositoryError if append fails
 */
export async function appendMessage(
  sessionId: string,
  message: AppendMessageInput
): Promise<AIMessage> {
  try {
    const db = getDb();
    const now = Date.now();

    // Add message to subcollection
    const messageData = {
      sessionId,
      author: message.author,
      content: message.content,
      meta: message.meta || {},
      createdAt: now,
    };

    const messageRef = await db
      .collection(SESSIONS_COLLECTION)
      .doc(sessionId)
      .collection(MESSAGES_SUBCOLLECTION)
      .add(messageData);

    // Update parent session's lastMessageAt and updatedAt
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      lastMessageAt: now,
      updatedAt: now,
    });

    const messageSnapshot = await messageRef.get();

    if (!messageSnapshot.exists) {
      // Fallback for eventual consistency
      return {
        id: messageRef.id,
        ...messageData,
      };
    }

    return mapMessageDocument(messageSnapshot);
  } catch (error) {
    console.error("Failed to append message", { sessionId, message, error });
    throw new AISessionsRepositoryError("Unable to append message", { cause: error });
  }
}

/**
 * Update the case association for an existing session
 *
 * @param sessionId - Session ID to update
 * @param caseId - Case identifier to associate (null to clear)
 * @throws AISessionsRepositoryError if update fails
 */
export async function updateSessionCase(
  sessionId: string,
  caseId: string | null | undefined
): Promise<void> {
  try {
    const db = getDb();
    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      caseId: caseId ?? null,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update AI session case", { sessionId, caseId, error });
    throw new AISessionsRepositoryError("Unable to update AI session case", { cause: error });
  }
}

/**
 * List messages for a session with pagination
 *
 * @param sessionId - Session ID to list messages for
 * @param options - Pagination options
 * @returns Paginated message list
 * @throws AISessionsRepositoryError if listing fails
 */
export async function listMessages(
  sessionId: string,
  options: ListMessagesOptions = {}
): Promise<PaginatedMessages> {
  try {
    const db = getDb();
    const limit = options.limit || 20;

    // Build query with pagination
    let query = db
      .collection(SESSIONS_COLLECTION)
      .doc(sessionId)
      .collection(MESSAGES_SUBCOLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit + 1); // Fetch one extra to check hasMore

    if (options.after) {
      query = query.where("createdAt", "<", options.after);
    }

    const snapshot = await query.get();

    // Check if there are more messages
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const items = docs.map(mapMessageDocument);
    const nextAfter = hasMore && items.length > 0
      ? items[items.length - 1].createdAt
      : undefined;

    return {
      items,
      hasMore,
      nextAfter,
    };
  } catch (error) {
    console.error("Failed to list messages", { sessionId, options, error });
    throw new AISessionsRepositoryError("Unable to list messages", { cause: error });
  }
}

/**
 * Update a session's context snapshot
 *
 * @param sessionId - Session ID to update
 * @param snapshot - Partial context snapshot to update
 * @throws AISessionsRepositoryError if update fails
 */
export async function updateContextSnapshot(
  sessionId: string,
  snapshot: Partial<ContextSnapshot>
): Promise<void> {
  try {
    const db = getDb();

    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      contextSnapshot: snapshot,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update context snapshot", { sessionId, snapshot, error });
    throw new AISessionsRepositoryError("Unable to update context snapshot", { cause: error });
  }
}

/**
 * Update a session's conversation summary
 *
 * @param sessionId - Session ID to update
 * @param summary - Conversation summary to store
 * @throws AISessionsRepositoryError if update fails
 */
export async function updateSessionSummary(
  sessionId: string,
  summary: import("@/lib/ai/types").ConversationSummary
): Promise<void> {
  try {
    const db = getDb();

    await db.collection(SESSIONS_COLLECTION).doc(sessionId).update({
      summary,
      lastSummarizedAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update session summary", { sessionId, error });
    throw new AISessionsRepositoryError("Unable to update session summary", { cause: error });
  }
}

/**
 * Get a single session by ID
 *
 * @param sessionId - Session ID to retrieve
 * @returns AI session or null if not found
 * @throws AISessionsRepositoryError if retrieval fails
 */
export async function getSession(sessionId: string): Promise<AISession | null> {
  try {
    const db = getDb();
    const snapshot = await db.collection(SESSIONS_COLLECTION).doc(sessionId).get();

    if (!snapshot.exists) {
      return null;
    }

    return mapSessionDocument(snapshot);
  } catch (error) {
    console.error("Failed to get session", { sessionId, error });
    throw new AISessionsRepositoryError("Unable to get session", { cause: error });
  }
}

/**
 * List sessions for a user
 *
 * @param userId - User ID to list sessions for
 * @returns Array of AI sessions
 * @throws AISessionsRepositoryError if listing fails
 */
export async function listUserSessions(userId: string): Promise<AISession[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(SESSIONS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("lastMessageAt", "desc")
      .get();

    return snapshot.docs.map(mapSessionDocument);
  } catch (error) {
    console.error("Failed to list user sessions", { userId, error });
    throw new AISessionsRepositoryError("Unable to list user sessions", { cause: error });
  }
}

/**
 * Archive old sessions based on inactivity
 *
 * @param days - Number of days of inactivity before archiving
 * @returns Number of sessions archived
 * @throws AISessionsRepositoryError if archival fails
 */
export async function archiveOldSessions(days: number): Promise<number> {
  try {
    const db = getDb();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection(SESSIONS_COLLECTION)
      .where("lastMessageAt", "<", cutoff)
      .where("status", "==", "active")
      .get();

    if (snapshot.empty) {
      return 0;
    }

    // Use batch update for efficiency
    const batch = db.batch();
    const now = Date.now();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "archived",
        updatedAt: now,
      });
    });

    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error("Failed to archive old sessions", { days, error });
    throw new AISessionsRepositoryError("Unable to archive old sessions", { cause: error });
  }
}

/**
 * Delete old sessions (for cleanup jobs)
 *
 * @param days - Number of days of inactivity before deletion
 * @returns Number of sessions deleted
 * @throws AISessionsRepositoryError if deletion fails
 */
export async function deleteOldSessions(days: number): Promise<number> {
  try {
    const db = getDb();
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection(SESSIONS_COLLECTION)
      .where("lastMessageAt", "<", cutoff)
      .where("status", "==", "archived")
      .get();

    if (snapshot.empty) {
      return 0;
    }

    // Use batch delete for efficiency
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error("Failed to delete old sessions", { days, error });
    throw new AISessionsRepositoryError("Unable to delete old sessions", { cause: error });
  }
}

/**
 * Get database instance
 */
function getDb(): Firestore {
  return getAdminFirestore();
}

/**
 * Map Firestore session document to AISession type
 *
 * @param snapshot - Firestore document snapshot
 * @returns Typed AI session
 */
function mapSessionDocument(snapshot: DocumentSnapshot<DocumentData>): AISession {
  const data = snapshot.data();
  if (!data) {
    throw new AISessionsRepositoryError("Session document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    userId: String(data.userId ?? ""),
    caseId: data.caseId ? String(data.caseId) : null,
    title: String(data.title ?? "New Conversation"),
    status: (data.status ?? "active") as AISession["status"],
    createdAt: Number.isFinite(data.createdAt) ? data.createdAt : Date.now(),
    updatedAt: Number.isFinite(data.updatedAt) ? data.updatedAt : Date.now(),
    lastMessageAt: Number.isFinite(data.lastMessageAt) ? data.lastMessageAt : Date.now(),
    contextSnapshot: data.contextSnapshot || { hash: "", userPrefs: {} },
    demo: Boolean(data.demo),
    summary: data.summary || undefined,
    lastSummarizedAt: Number.isFinite(data.lastSummarizedAt) ? data.lastSummarizedAt : undefined,
  };
}

/**
 * Map Firestore message document to AIMessage type
 *
 * @param snapshot - Firestore document snapshot
 * @returns Typed AI message
 */
function mapMessageDocument(snapshot: DocumentSnapshot<DocumentData>): AIMessage {
  const data = snapshot.data();
  if (!data) {
    throw new AISessionsRepositoryError("Message document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    sessionId: String(data.sessionId ?? ""),
    author: (data.author ?? "user") as AIMessage["author"],
    content: String(data.content ?? ""),
    meta: data.meta || {},
    createdAt: Number.isFinite(data.createdAt) ? data.createdAt : Date.now(),
  };
}
