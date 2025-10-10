import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  listByUser, 
  createCase, 
  getCase,
  CasesRepositoryError 
} from "@/lib/db/casesRepo";
import type { CreateCaseInput } from "@/lib/validation";

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

describe("CasesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listByUser", () => {
    it("should return empty array when no cases found", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await listByUser("user123");
      expect(result).toEqual([]);
    });

    it("should throw CasesRepositoryError on failure", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      await expect(listByUser("user123")).rejects.toThrow(CasesRepositoryError);
    });
  });

  describe("createCase", () => {
    it("should create a case successfully", async () => {
      const { addDoc, getDoc } = await import("firebase/firestore");
      const mockDocRef = { id: "case123" };
      const mockSnapshot = {
        exists: () => true,
        data: () => ({
          userId: "user123",
          caseType: "eviction",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const input: CreateCaseInput & { userId: string } = {
        userId: "user123",
        caseType: "eviction",
        jurisdiction: "marion_in",
      };

      const result = await createCase(input);
      expect(result.id).toBe("case123");
      expect(result.caseType).toBe("eviction");
      expect(result.jurisdiction).toBe("marion_in");
    });

    it("should throw CasesRepositoryError on failure", async () => {
      const { addDoc } = await import("firebase/firestore");
      vi.mocked(addDoc).mockRejectedValue(new Error("Firestore error"));

      const input: CreateCaseInput & { userId: string } = {
        userId: "user123",
        caseType: "eviction",
        jurisdiction: "marion_in",
      };

      await expect(createCase(input)).rejects.toThrow(CasesRepositoryError);
    });
  });

  describe("getCase", () => {
    it("should return null when case not found", async () => {
      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getCase("nonexistent");
      expect(result).toBeNull();
    });

    it("should return case when found", async () => {
      const { getDoc } = await import("firebase/firestore");
      const mockSnapshot = {
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "eviction",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const result = await getCase("case123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("case123");
    });
  });
});
