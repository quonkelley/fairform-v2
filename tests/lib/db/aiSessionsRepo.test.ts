/**
 * Unit tests for AI Sessions Repository
 *
 * @see lib/db/aiSessionsRepo.ts
 * @see docs/stories/13.1.ai-sessions-repository.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { CreateSessionInput, AppendMessageInput } from "@/lib/ai/types";

// Mock Firebase Admin - must be hoisted before imports
vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: vi.fn(),
}));

import * as repo from "@/lib/db/aiSessionsRepo";

describe("aiSessionsRepo", () => {
  let mockDb: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockBatch: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock Firestore
    mockBatch = {
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      commit: vi.fn().mockResolvedValue(undefined),
    };

    mockDoc = {
      get: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
      collection: vi.fn(),
    };

    mockCollection = {
      add: vi.fn(),
      doc: vi.fn().mockReturnValue(mockDoc),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn(),
    };

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
      batch: vi.fn().mockReturnValue(mockBatch),
    };

    const firebaseAdmin = await import("@/lib/firebase-admin");
    vi.mocked(firebaseAdmin.getAdminFirestore).mockReturnValue(mockDb);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createSession", () => {
    it("creates session with correct structure", async () => {
      const input: CreateSessionInput = {
        userId: "test-user-123",
        caseId: "test-case-456",
        title: "Test Session",
        demo: false,
      };

      const mockDocRef = {
        id: "session-789",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "session-789",
          data: () => ({
            userId: input.userId,
            caseId: input.caseId,
            title: input.title,
            status: "active",
            createdAt: 1704067200000,
            updatedAt: 1704067200000,
            lastMessageAt: 1704067200000,
            contextSnapshot: { hash: "", userPrefs: {} },
            demo: false,
          }),
        }),
      };

      mockCollection.add.mockResolvedValue(mockDocRef);

      const session = await repo.createSession(input);

      expect(session.userId).toBe(input.userId);
      expect(session.caseId).toBe(input.caseId);
      expect(session.title).toBe(input.title);
      expect(session.status).toBe("active");
      expect(session.demo).toBe(false);
      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          caseId: input.caseId,
          title: input.title,
          status: "active",
          demo: false,
        })
      );
    });

    it("creates session with default title when not provided", async () => {
      const input: CreateSessionInput = {
        userId: "test-user-123",
      };

      const mockDocRef = {
        id: "session-789",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "session-789",
          data: () => ({
            userId: input.userId,
            caseId: null,
            title: "New Conversation",
            status: "active",
            createdAt: 1704067200000,
            updatedAt: 1704067200000,
            lastMessageAt: 1704067200000,
            contextSnapshot: { hash: "", userPrefs: {} },
            demo: false,
          }),
        }),
      };

      mockCollection.add.mockResolvedValue(mockDocRef);

      const session = await repo.createSession(input);

      expect(session.title).toBe("New Conversation");
      expect(session.caseId).toBeNull();
    });

    it("handles demo sessions correctly", async () => {
      const input: CreateSessionInput = {
        userId: "demo-user",
        demo: true,
      };

      const mockDocRef = {
        id: "demo-session",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "demo-session",
          data: () => ({
            userId: input.userId,
            caseId: null,
            title: "New Conversation",
            status: "active",
            createdAt: 1704067200000,
            updatedAt: 1704067200000,
            lastMessageAt: 1704067200000,
            contextSnapshot: { hash: "", userPrefs: {} },
            demo: true,
          }),
        }),
      };

      mockCollection.add.mockResolvedValue(mockDocRef);

      const session = await repo.createSession(input);

      expect(session.demo).toBe(true);
    });

    it("throws error when creation fails", async () => {
      mockCollection.add.mockRejectedValue(new Error("Firestore error"));

      await expect(
        repo.createSession({ userId: "test-user" })
      ).rejects.toThrow("Unable to create AI session");
    });
  });

  describe("appendMessage", () => {
    it("adds message to subcollection", async () => {
      const sessionId = "session-123";
      const message: AppendMessageInput = {
        author: "user",
        content: "Hello, AI!",
      };

      const mockMessageRef = {
        id: "message-456",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "message-456",
          data: () => ({
            sessionId,
            author: message.author,
            content: message.content,
            meta: {},
            createdAt: 1704067200000,
          }),
        }),
      };

      const mockSubcollection = {
        add: vi.fn().mockResolvedValue(mockMessageRef),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      const result = await repo.appendMessage(sessionId, message);

      expect(result.sessionId).toBe(sessionId);
      expect(result.author).toBe(message.author);
      expect(result.content).toBe(message.content);
      expect(mockSubcollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId,
          author: message.author,
          content: message.content,
          meta: {},
        })
      );
    });

    it("updates parent session lastMessageAt", async () => {
      const sessionId = "session-123";
      const message: AppendMessageInput = {
        author: "assistant",
        content: "Hello, user!",
      };

      const mockMessageRef = {
        id: "message-456",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "message-456",
          data: () => ({
            sessionId,
            author: message.author,
            content: message.content,
            meta: {},
            createdAt: 1704067200000,
          }),
        }),
      };

      const mockSubcollection = {
        add: vi.fn().mockResolvedValue(mockMessageRef),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      await repo.appendMessage(sessionId, message);

      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          lastMessageAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
    });

    it("includes message meta when provided", async () => {
      const sessionId = "session-123";
      const message: AppendMessageInput = {
        author: "assistant",
        content: "Response",
        meta: {
          tokensIn: 50,
          tokensOut: 100,
          latencyMs: 1500,
          model: "gpt-4o-mini",
        },
      };

      const mockMessageRef = {
        id: "message-456",
        get: vi.fn().mockResolvedValue({
          exists: true,
          id: "message-456",
          data: () => ({
            sessionId,
            author: message.author,
            content: message.content,
            meta: message.meta,
            createdAt: 1704067200000,
          }),
        }),
      };

      const mockSubcollection = {
        add: vi.fn().mockResolvedValue(mockMessageRef),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      const result = await repo.appendMessage(sessionId, message);

      expect(result.meta).toEqual(message.meta);
    });

    it("throws error when append fails", async () => {
      const mockSubcollection = {
        add: vi.fn().mockRejectedValue(new Error("Firestore error")),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      await expect(
        repo.appendMessage("session-123", { author: "user", content: "Test" })
      ).rejects.toThrow("Unable to append message");
    });
  });

  describe("listMessages", () => {
    it("returns paginated messages", async () => {
      const sessionId = "session-123";
      const mockMessages = [
        { id: "msg-1", data: () => ({ sessionId, author: "user", content: "Hi", createdAt: 1704067300000 }) },
        { id: "msg-2", data: () => ({ sessionId, author: "assistant", content: "Hello", createdAt: 1704067200000 }) },
      ];

      const mockSubcollection = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
          docs: mockMessages,
        }),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      const result = await repo.listMessages(sessionId, { limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(mockSubcollection.orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockSubcollection.limit).toHaveBeenCalledWith(21); // limit + 1
    });

    it("detects when there are more messages", async () => {
      const sessionId = "session-123";
      const mockMessages = Array.from({ length: 21 }, (_, i) => ({
        id: `msg-${i}`,
        data: () => ({ sessionId, author: "user", content: `Message ${i}`, createdAt: 1704067200000 + i }),
      }));

      const mockSubcollection = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
          docs: mockMessages,
        }),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      const result = await repo.listMessages(sessionId, { limit: 20 });

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.nextAfter).toBeDefined();
    });

    it("applies after parameter for pagination", async () => {
      const sessionId = "session-123";
      const after = 1704067200000;

      const mockSubcollection = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({ docs: [] }),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      await repo.listMessages(sessionId, { after, limit: 10 });

      expect(mockSubcollection.where).toHaveBeenCalledWith("createdAt", "<", after);
    });

    it("uses default limit when not specified", async () => {
      const sessionId = "session-123";

      const mockSubcollection = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({ docs: [] }),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      await repo.listMessages(sessionId);

      expect(mockSubcollection.limit).toHaveBeenCalledWith(21); // default 20 + 1
    });

    it("throws error when listing fails", async () => {
      const mockSubcollection = {
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        get: vi.fn().mockRejectedValue(new Error("Firestore error")),
      };

      mockDoc.collection.mockReturnValue(mockSubcollection);

      await expect(repo.listMessages("session-123")).rejects.toThrow("Unable to list messages");
    });
  });

  describe("updateContextSnapshot", () => {
    it("updates context snapshot correctly", async () => {
      const sessionId = "session-123";
      const snapshot = {
        caseType: "small_claims" as const,
        jurisdiction: "CA",
        hash: "abc123",
      };

      await repo.updateContextSnapshot(sessionId, snapshot);

      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          contextSnapshot: snapshot,
          updatedAt: expect.any(Number),
        })
      );
    });

    it("throws error when update fails", async () => {
      mockDoc.update.mockRejectedValue(new Error("Firestore error"));

      await expect(
        repo.updateContextSnapshot("session-123", { hash: "test" })
      ).rejects.toThrow("Unable to update context snapshot");
    });
  });

  describe("getSession", () => {
    it("retrieves session by ID", async () => {
      const sessionId = "session-123";

      mockDoc.get.mockResolvedValue({
        exists: true,
        id: sessionId,
        data: () => ({
          userId: "user-123",
          caseId: null,
          title: "Test Session",
          status: "active",
          createdAt: 1704067200000,
          updatedAt: 1704067200000,
          lastMessageAt: 1704067200000,
          contextSnapshot: { hash: "", userPrefs: {} },
          demo: false,
        }),
      });

      const session = await repo.getSession(sessionId);

      expect(session).not.toBeNull();
      expect(session?.id).toBe(sessionId);
      expect(session?.userId).toBe("user-123");
    });

    it("returns null when session not found", async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const session = await repo.getSession("nonexistent");

      expect(session).toBeNull();
    });

    it("throws error when retrieval fails", async () => {
      mockDoc.get.mockRejectedValue(new Error("Firestore error"));

      await expect(repo.getSession("session-123")).rejects.toThrow("Unable to get session");
    });
  });

  describe("listUserSessions", () => {
    it("lists all sessions for a user", async () => {
      const userId = "user-123";
      const mockSessions = [
        { id: "session-1", data: () => ({ userId, title: "Session 1", status: "active", createdAt: 1704067200000, updatedAt: 1704067200000, lastMessageAt: 1704067200000, contextSnapshot: {}, demo: false }) },
        { id: "session-2", data: () => ({ userId, title: "Session 2", status: "active", createdAt: 1704067100000, updatedAt: 1704067100000, lastMessageAt: 1704067100000, contextSnapshot: {}, demo: false }) },
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockSessions,
      });

      const sessions = await repo.listUserSessions(userId);

      expect(sessions).toHaveLength(2);
      expect(mockCollection.where).toHaveBeenCalledWith("userId", "==", userId);
      expect(mockCollection.orderBy).toHaveBeenCalledWith("lastMessageAt", "desc");
    });

    it("throws error when listing fails", async () => {
      mockCollection.get.mockRejectedValue(new Error("Firestore error"));

      await expect(repo.listUserSessions("user-123")).rejects.toThrow("Unable to list user sessions");
    });
  });

  describe("archiveOldSessions", () => {
    it("archives sessions older than specified days", async () => {
      const days = 7;
      const mockOldSessions = [
        { id: "old-1", ref: { path: "aiSessions/old-1" } },
        { id: "old-2", ref: { path: "aiSessions/old-2" } },
      ];

      mockCollection.get.mockResolvedValue({
        empty: false,
        size: 2,
        docs: mockOldSessions,
      });

      const count = await repo.archiveOldSessions(days);

      expect(count).toBe(2);
      expect(mockCollection.where).toHaveBeenCalledWith("lastMessageAt", "<", expect.any(Number));
      expect(mockCollection.where).toHaveBeenCalledWith("status", "==", "active");
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("returns 0 when no sessions to archive", async () => {
      mockCollection.get.mockResolvedValue({
        empty: true,
        size: 0,
        docs: [],
      });

      const count = await repo.archiveOldSessions(7);

      expect(count).toBe(0);
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });

    it("throws error when archival fails", async () => {
      mockCollection.get.mockRejectedValue(new Error("Firestore error"));

      await expect(repo.archiveOldSessions(7)).rejects.toThrow("Unable to archive old sessions");
    });
  });

  describe("deleteOldSessions", () => {
    it("deletes archived sessions older than specified days", async () => {
      const days = 90;
      const mockOldSessions = [
        { id: "old-1", ref: { path: "aiSessions/old-1" } },
        { id: "old-2", ref: { path: "aiSessions/old-2" } },
      ];

      mockCollection.get.mockResolvedValue({
        empty: false,
        size: 2,
        docs: mockOldSessions,
      });

      const count = await repo.deleteOldSessions(days);

      expect(count).toBe(2);
      expect(mockCollection.where).toHaveBeenCalledWith("status", "==", "archived");
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("returns 0 when no sessions to delete", async () => {
      mockCollection.get.mockResolvedValue({
        empty: true,
        size: 0,
        docs: [],
      });

      const count = await repo.deleteOldSessions(90);

      expect(count).toBe(0);
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });

    it("throws error when deletion fails", async () => {
      mockCollection.get.mockRejectedValue(new Error("Firestore error"));

      await expect(repo.deleteOldSessions(90)).rejects.toThrow("Unable to delete old sessions");
    });
  });

  describe("error handling", () => {
    it("wraps all errors with AISessionsRepositoryError", async () => {
      mockCollection.add.mockRejectedValue(new Error("Network error"));

      await expect(
        repo.createSession({ userId: "test" })
      ).rejects.toThrow(repo.AISessionsRepositoryError);
    });

    it("preserves error cause in wrapped errors", async () => {
      const originalError = new Error("Original error");
      mockCollection.add.mockRejectedValue(originalError);

      try {
        await repo.createSession({ userId: "test" });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(repo.AISessionsRepositoryError);
        expect(error.cause).toBeDefined();
      }
    });
  });
});
