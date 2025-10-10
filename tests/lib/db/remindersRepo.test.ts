import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createReminder, 
  listByUser,
  listPendingReminders,
  getReminder,
  RemindersRepositoryError 
} from "@/lib/db/remindersRepo";
import type { CreateReminderInput } from "@/lib/validation";

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  getFirestoreDb: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn(),
  })),
}));

// Mock Firestore functions
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: class MockTimestamp {
    toDate() {
      return new Date();
    }
  },
}));

describe("RemindersRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReminder", () => {
    it("should create a reminder successfully", async () => {
      const { addDoc, getDoc } = await import("firebase/firestore");
      const mockDocRef = { id: "reminder123" };
      const mockSnapshot = {
        exists: () => true,
        data: () => ({
          userId: "user123",
          caseId: "case123",
          dueDate: new Date(),
          channel: "email",
          message: "Test reminder",
          sent: false,
          createdAt: new Date(),
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const input: CreateReminderInput & { userId: string } = {
        userId: "user123",
        caseId: "case123",
        dueDate: "2025-12-31T23:59:59.000Z",
        channel: "email",
        message: "Test reminder",
      };

      const result = await createReminder(input);
      expect(result.id).toBe("reminder123");
      expect(result.userId).toBe("user123");
      expect(result.caseId).toBe("case123");
      expect(result.channel).toBe("email");
    });

    it("should throw RemindersRepositoryError on failure", async () => {
      const { addDoc } = await import("firebase/firestore");
      vi.mocked(addDoc).mockRejectedValue(new Error("Firestore error"));

      const input: CreateReminderInput & { userId: string } = {
        userId: "user123",
        caseId: "case123",
        dueDate: "2025-12-31T23:59:59.000Z",
        channel: "email",
      };

      await expect(createReminder(input)).rejects.toThrow(RemindersRepositoryError);
    });
  });

  describe("listByUser", () => {
    it("should return empty array when no reminders found", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await listByUser("user123");
      expect(result).toEqual([]);
    });

    it("should throw RemindersRepositoryError on failure", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      await expect(listByUser("user123")).rejects.toThrow(RemindersRepositoryError);
    });
  });

  describe("listPendingReminders", () => {
    it("should return empty array when no pending reminders found", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await listPendingReminders();
      expect(result).toEqual([]);
    });

    it("should throw RemindersRepositoryError on failure", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      await expect(listPendingReminders()).rejects.toThrow(RemindersRepositoryError);
    });
  });

  describe("getReminder", () => {
    it("should return null when reminder not found", async () => {
      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getReminder("nonexistent");
      expect(result).toBeNull();
    });

    it("should return reminder when found", async () => {
      const { getDoc } = await import("firebase/firestore");
      const mockSnapshot = {
        exists: () => true,
        id: "reminder123",
        data: () => ({
          userId: "user123",
          caseId: "case123",
          dueDate: new Date(),
          channel: "email",
          message: "Test reminder",
          sent: false,
          createdAt: new Date(),
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const result = await getReminder("reminder123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("reminder123");
    });
  });
});
