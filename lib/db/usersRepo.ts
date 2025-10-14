import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  FieldValue,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { User } from "@/lib/validation";

/**
 * Custom error class for Users repository operations
 */
export class UsersRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UsersRepositoryError";
  }
}

// Collection constants
const COLLECTION_NAME = "users";

/**
 * Get a user by ID
 *
 * @param userId - User ID to retrieve
 * @returns User or null if not found
 * @throws UsersRepositoryError if retrieval fails
 */
export async function getById(userId: string): Promise<User | null> {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION_NAME).doc(userId).get();

    if (!snapshot.exists) {
      return null;
    }

    return mapUserDocument(snapshot);
  } catch (error) {
    console.error("Failed to get user", { userId, error });
    throw new UsersRepositoryError("Unable to get user", { cause: error });
  }
}

/**
 * Create a new user
 *
 * @param userData - User data to create
 * @returns Created user
 * @throws UsersRepositoryError if creation fails
 */
export async function create(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  try {
    const db = getDb();
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...userData,
      createdAt: FieldValue.serverTimestamp(),
    });

    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      // Fallback for eventual consistency
      return {
        id: docRef.id,
        ...userData,
        createdAt: new Date(),
      };
    }

    return mapUserDocument(snapshot);
  } catch (error) {
    console.error("Failed to create user", { userData, error });
    throw new UsersRepositoryError("Unable to create user", { cause: error });
  }
}

/**
 * Update a user
 *
 * @param userId - User ID to update
 * @param updates - Partial user data to update
 * @throws UsersRepositoryError if update fails
 */
export async function update(userId: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<void> {
  try {
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(userId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to update user", { userId, updates, error });
    throw new UsersRepositoryError("Unable to update user", { cause: error });
  }
}

/**
 * Get database instance
 */
function getDb(): Firestore {
  return getAdminFirestore();
}

/**
 * Map Firestore user document to User type
 *
 * @param snapshot - Firestore document snapshot
 * @returns Typed user
 */
function mapUserDocument(snapshot: DocumentSnapshot<DocumentData>): User {
  const data = snapshot.data();
  if (!data) {
    throw new UsersRepositoryError("User document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    email: String(data.email ?? ""),
    displayName: data.displayName ? String(data.displayName) : null,
    createdAt: resolveTimestamp(data.createdAt),
    role: "user" as const,
  };
}

/**
 * Resolve timestamp from various formats
 */
function resolveTimestamp(value: unknown): Date {
  // Admin SDK Timestamp has toDate() method
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  // Admin SDK Timestamp also has _seconds property
  if (value && typeof value === "object" && "_seconds" in value) {
    return new Date((value as { _seconds: number })._seconds * 1000);
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return new Date();
}
