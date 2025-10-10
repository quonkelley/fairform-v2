import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  listByCase, 
  createStep, 
  updateStepCompletion,
  getStep,
  StepsRepositoryError 
} from "@/lib/db/stepsRepo";
import type { CreateCaseStepInput, UpdateStepCompletionInput } from "@/lib/validation";

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

describe("StepsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listByCase", () => {
    it("should return empty array when no steps found", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockResolvedValue({
        docs: [],
      } as any);

      const result = await listByCase("case123");
      expect(result).toEqual([]);
    });

    it("should throw StepsRepositoryError on failure", async () => {
      const { getDocs } = await import("firebase/firestore");
      vi.mocked(getDocs).mockRejectedValue(new Error("Firestore error"));

      await expect(listByCase("case123")).rejects.toThrow(StepsRepositoryError);
    });
  });

  describe("createStep", () => {
    it("should create a step successfully", async () => {
      const { addDoc, getDoc } = await import("firebase/firestore");
      const mockDocRef = { id: "step123" };
      const mockSnapshot = {
        exists: () => true,
        data: () => ({
          caseId: "case123",
          name: "File appearance",
          order: 1,
          dueDate: new Date(),
          isComplete: false,
          completedAt: null,
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const input: CreateCaseStepInput = {
        caseId: "case123",
        name: "File appearance",
        order: 1,
        dueDate: new Date(),
      };

      const result = await createStep(input);
      expect(result.id).toBe("step123");
      expect(result.name).toBe("File appearance");
      expect(result.order).toBe(1);
    });

    it("should throw StepsRepositoryError on failure", async () => {
      const { addDoc } = await import("firebase/firestore");
      vi.mocked(addDoc).mockRejectedValue(new Error("Firestore error"));

      const input: CreateCaseStepInput = {
        caseId: "case123",
        name: "File appearance",
        order: 1,
      };

      await expect(createStep(input)).rejects.toThrow(StepsRepositoryError);
    });
  });

  describe("updateStepCompletion", () => {
    it("should update step completion successfully", async () => {
      const { updateDoc, getDoc } = await import("firebase/firestore");
      const mockSnapshot = {
        exists: () => true,
        id: "step123",
        data: () => ({
          caseId: "case123",
          name: "File appearance",
          order: 1,
          dueDate: new Date(),
          isComplete: true,
          completedAt: new Date(),
        }),
      };

      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const input: UpdateStepCompletionInput = {
        isComplete: true,
      };

      const result = await updateStepCompletion("step123", input);
      expect(result.id).toBe("step123");
      expect(result.isComplete).toBe(true);
    });

    it("should throw StepsRepositoryError on failure", async () => {
      const { updateDoc } = await import("firebase/firestore");
      vi.mocked(updateDoc).mockRejectedValue(new Error("Firestore error"));

      const input: UpdateStepCompletionInput = {
        isComplete: true,
      };

      await expect(updateStepCompletion("step123", input)).rejects.toThrow(StepsRepositoryError);
    });
  });

  describe("getStep", () => {
    it("should return null when step not found", async () => {
      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      const result = await getStep("nonexistent");
      expect(result).toBeNull();
    });

    it("should return step when found", async () => {
      const { getDoc } = await import("firebase/firestore");
      const mockSnapshot = {
        exists: () => true,
        id: "step123",
        data: () => ({
          caseId: "case123",
          name: "File appearance",
          order: 1,
          dueDate: new Date(),
          isComplete: false,
          completedAt: null,
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockSnapshot as any);

      const result = await getStep("step123");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("step123");
    });
  });
});
