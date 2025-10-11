import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  listByUser, 
  createCase, 
  getCase,
  calculateCaseProgress,
  CasesRepositoryError 
} from "@/lib/db/casesRepo";
import type { CreateCaseInput, CaseStep } from "@/lib/validation";

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
  updateDoc: vi.fn(),
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

// Mock stepsRepo
vi.mock("@/lib/db/stepsRepo", () => ({
  listByCase: vi.fn(),
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
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "eviction",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 0,
          totalSteps: 0,
          completedSteps: 0,
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

  describe("calculateCaseProgress", () => {
    it("should calculate 0% when no steps completed", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      // Mock 5 incomplete steps
      const mockSteps: CaseStep[] = [
        { id: "s1", caseId: "case123", name: "Step 1", order: 1, dueDate: null, isComplete: false, completedAt: null },
        { id: "s2", caseId: "case123", name: "Step 2", order: 2, dueDate: null, isComplete: false, completedAt: null },
        { id: "s3", caseId: "case123", name: "Step 3", order: 3, dueDate: null, isComplete: false, completedAt: null },
        { id: "s4", caseId: "case123", name: "Step 4", order: 4, dueDate: null, isComplete: false, completedAt: null },
        { id: "s5", caseId: "case123", name: "Step 5", order: 5, dueDate: null, isComplete: false, completedAt: null },
      ];

      vi.mocked(listByCase).mockResolvedValue(mockSteps);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "small-claims",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 0,
          totalSteps: 5,
          completedSteps: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      const result = await calculateCaseProgress("case123");
      
      expect(result.progressPct).toBe(0);
      expect(result.totalSteps).toBe(5);
      expect(result.completedSteps).toBe(0);
      expect(updateDoc).toHaveBeenCalled();
      
      // Verify updateDoc was called with progress values
      const updateCall = vi.mocked(updateDoc).mock.calls[0];
      expect(updateCall[1]).toMatchObject({
        progressPct: 0,
        totalSteps: 5,
        completedSteps: 0,
      });
    });

    it("should calculate correct percentage for partial completion", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      // Mock 3 of 5 steps completed (60%)
      const mockSteps: CaseStep[] = [
        { id: "s1", caseId: "case123", name: "Step 1", order: 1, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s2", caseId: "case123", name: "Step 2", order: 2, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s3", caseId: "case123", name: "Step 3", order: 3, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s4", caseId: "case123", name: "Step 4", order: 4, dueDate: null, isComplete: false, completedAt: null },
        { id: "s5", caseId: "case123", name: "Step 5", order: 5, dueDate: null, isComplete: false, completedAt: null },
      ];

      vi.mocked(listByCase).mockResolvedValue(mockSteps);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "small-claims",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 60,
          totalSteps: 5,
          completedSteps: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      const result = await calculateCaseProgress("case123");
      
      expect(result.progressPct).toBe(60);
      expect(result.totalSteps).toBe(5);
      expect(result.completedSteps).toBe(3);
    });

    it("should calculate 100% when all steps completed", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      // Mock all 5 steps completed (100%)
      const mockSteps: CaseStep[] = [
        { id: "s1", caseId: "case123", name: "Step 1", order: 1, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s2", caseId: "case123", name: "Step 2", order: 2, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s3", caseId: "case123", name: "Step 3", order: 3, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s4", caseId: "case123", name: "Step 4", order: 4, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s5", caseId: "case123", name: "Step 5", order: 5, dueDate: null, isComplete: true, completedAt: new Date() },
      ];

      vi.mocked(listByCase).mockResolvedValue(mockSteps);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "small-claims",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 100,
          totalSteps: 5,
          completedSteps: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      const result = await calculateCaseProgress("case123");
      
      expect(result.progressPct).toBe(100);
      expect(result.totalSteps).toBe(5);
      expect(result.completedSteps).toBe(5);
    });

    it("should handle case with no steps (0%)", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      // Mock empty steps array
      vi.mocked(listByCase).mockResolvedValue([]);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "small-claims",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 0,
          totalSteps: 0,
          completedSteps: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      const result = await calculateCaseProgress("case123");
      
      expect(result.progressPct).toBe(0);
      expect(result.totalSteps).toBe(0);
      expect(result.completedSteps).toBe(0);
    });

    it("should round percentage correctly (3 of 7 = 43%)", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      // Mock 3 of 7 steps completed (42.857...% → 43%)
      const mockSteps: CaseStep[] = [
        { id: "s1", caseId: "case123", name: "Step 1", order: 1, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s2", caseId: "case123", name: "Step 2", order: 2, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s3", caseId: "case123", name: "Step 3", order: 3, dueDate: null, isComplete: true, completedAt: new Date() },
        { id: "s4", caseId: "case123", name: "Step 4", order: 4, dueDate: null, isComplete: false, completedAt: null },
        { id: "s5", caseId: "case123", name: "Step 5", order: 5, dueDate: null, isComplete: false, completedAt: null },
        { id: "s6", caseId: "case123", name: "Step 6", order: 6, dueDate: null, isComplete: false, completedAt: null },
        { id: "s7", caseId: "case123", name: "Step 7", order: 7, dueDate: null, isComplete: false, completedAt: null },
      ];

      vi.mocked(listByCase).mockResolvedValue(mockSteps);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "case123",
        data: () => ({
          userId: "user123",
          caseType: "small-claims",
          jurisdiction: "marion_in",
          status: "active",
          progressPct: 43,
          totalSteps: 7,
          completedSteps: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as any);

      const result = await calculateCaseProgress("case123");
      
      expect(result.progressPct).toBe(43);
      expect(result.totalSteps).toBe(7);
      expect(result.completedSteps).toBe(3);
    });

    it("should throw CasesRepositoryError when case not found after update", async () => {
      const { listByCase } = await import("@/lib/db/stepsRepo");
      const { updateDoc, getDoc } = await import("firebase/firestore");

      vi.mocked(listByCase).mockResolvedValue([]);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      await expect(calculateCaseProgress("case123")).rejects.toThrow(CasesRepositoryError);
    });
  });
});
