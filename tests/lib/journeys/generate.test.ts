import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateCaseJourney,
  getTemplateStepCount,
  getTemplateStepDetails,
  JourneyGenerationError,
} from "@/lib/journeys/generate";
import type { CaseType } from "@/lib/validation";
import * as stepsRepo from "@/lib/db/stepsRepo";

// Mock the stepsRepo
vi.mock("@/lib/db/stepsRepo", () => ({
  createStep: vi.fn(),
}));

describe("Journey Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateCaseJourney", () => {
    it("should throw error for case type without template", async () => {
      await expect(
        generateCaseJourney("case-123", "employment")
      ).rejects.toThrow(JourneyGenerationError);

      await expect(
        generateCaseJourney("case-123", "employment")
      ).rejects.toThrow("No template found for case type: employment");
    });

    it("should generate steps for small_claims case type", async () => {
      const mockCreateStep = vi.mocked(stepsRepo.createStep);

      // Mock step creation responses
      mockCreateStep.mockResolvedValue({
        id: "step-1",
        caseId: "case-123",
        name: "File Your Claim",
        order: 1,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      });

      const steps = await generateCaseJourney("case-123", "small_claims");

      // Should call createStep 5 times for small claims
      expect(mockCreateStep).toHaveBeenCalledTimes(5);

      // Verify first call
      expect(mockCreateStep).toHaveBeenNthCalledWith(1, {
        caseId: "case-123",
        name: "File Your Claim",
        order: 1,
        dueDate: null,
      });

      expect(steps).toHaveLength(5);
    });

    it("should create steps with correct order (1-indexed)", async () => {
      const mockCreateStep = vi.mocked(stepsRepo.createStep);

      mockCreateStep.mockImplementation(async (input) => ({
        id: `step-${input.order}`,
        caseId: input.caseId,
        name: input.name,
        order: input.order,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      }));

      await generateCaseJourney("case-123", "small_claims");

      // Verify orders are 1, 2, 3, 4, 5
      expect(mockCreateStep).toHaveBeenNthCalledWith(1, expect.objectContaining({ order: 1 }));
      expect(mockCreateStep).toHaveBeenNthCalledWith(2, expect.objectContaining({ order: 2 }));
      expect(mockCreateStep).toHaveBeenNthCalledWith(3, expect.objectContaining({ order: 3 }));
      expect(mockCreateStep).toHaveBeenNthCalledWith(4, expect.objectContaining({ order: 4 }));
      expect(mockCreateStep).toHaveBeenNthCalledWith(5, expect.objectContaining({ order: 5 }));
    });

    it("should create steps with correct titles from template", async () => {
      const mockCreateStep = vi.mocked(stepsRepo.createStep);

      mockCreateStep.mockImplementation(async (input) => ({
        id: `step-${input.order}`,
        caseId: input.caseId,
        name: input.name,
        order: input.order,
        dueDate: null,
        isComplete: false,
        completedAt: null,
      }));

      await generateCaseJourney("case-123", "small_claims");

      expect(mockCreateStep).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ name: "File Your Claim" })
      );
      expect(mockCreateStep).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ name: "Serve the Defendant" })
      );
      expect(mockCreateStep).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ name: "Prepare for Hearing" })
      );
      expect(mockCreateStep).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({ name: "Attend Court Hearing" })
      );
      expect(mockCreateStep).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({ name: "Collect Judgment" })
      );
    });

    it("should handle errors from step creation", async () => {
      const mockCreateStep = vi.mocked(stepsRepo.createStep);

      mockCreateStep.mockRejectedValue(new Error("Database error"));

      await expect(
        generateCaseJourney("case-123", "small_claims")
      ).rejects.toThrow(JourneyGenerationError);

      await expect(
        generateCaseJourney("case-123", "small_claims")
      ).rejects.toThrow("Unable to generate case journey");
    });
  });

  describe("getTemplateStepCount", () => {
    it("should return 5 for small_claims", () => {
      expect(getTemplateStepCount("small_claims")).toBe(5);
    });

    it("should return 0 for case types without templates", () => {
      expect(getTemplateStepCount("employment")).toBe(0);
      expect(getTemplateStepCount("housing")).toBe(0);
      expect(getTemplateStepCount("consumer")).toBe(0);
      expect(getTemplateStepCount("contract")).toBe(0);
      expect(getTemplateStepCount("discrimination")).toBe(0);
      expect(getTemplateStepCount("other")).toBe(0);
    });

    it("should return correct counts for all case types", () => {
      const caseTypes: CaseType[] = [
        "small_claims",
        "employment",
        "housing",
        "consumer",
        "contract",
        "discrimination",
        "other",
      ];

      caseTypes.forEach((caseType) => {
        const count = getTemplateStepCount(caseType);
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("getTemplateStepDetails", () => {
    it("should return step details for small_claims", () => {
      const details = getTemplateStepDetails("small_claims");

      expect(details).toHaveLength(5);
      expect(details[0]).toMatchObject({
        order: 1,
        title: "File Your Claim",
        description: expect.any(String),
        stepType: "form",
        instructions: expect.any(Array),
      });
    });

    it("should include all template properties", () => {
      const details = getTemplateStepDetails("small_claims");

      details.forEach((step) => {
        expect(step).toHaveProperty("order");
        expect(step).toHaveProperty("title");
        expect(step).toHaveProperty("description");
        expect(step).toHaveProperty("stepType");
        expect(step).toHaveProperty("instructions");
        expect(step).toHaveProperty("estimatedTime");
        expect(step).toHaveProperty("disclaimer");
      });
    });

    it("should have sequential order starting at 1", () => {
      const details = getTemplateStepDetails("small_claims");

      details.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
      });
    });

    it("should return empty array for case types without templates", () => {
      expect(getTemplateStepDetails("employment")).toEqual([]);
      expect(getTemplateStepDetails("housing")).toEqual([]);
    });

    it("should include instructions array", () => {
      const details = getTemplateStepDetails("small_claims");

      details.forEach((step) => {
        expect(Array.isArray(step.instructions)).toBe(true);
        expect(step.instructions.length).toBeGreaterThan(0);
      });
    });

    it("should include estimated times", () => {
      const details = getTemplateStepDetails("small_claims");

      details.forEach((step) => {
        expect(step.estimatedTime).toBeDefined();
        expect(typeof step.estimatedTime).toBe("number");
        expect(step.estimatedTime).toBeGreaterThan(0);
      });
    });

    it("should include disclaimers", () => {
      const details = getTemplateStepDetails("small_claims");

      details.forEach((step) => {
        expect(step.disclaimer).toBeDefined();
        expect(typeof step.disclaimer).toBe("string");
      });
    });
  });

  describe("JourneyGenerationError", () => {
    it("should create error with message", () => {
      const error = new JourneyGenerationError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("JourneyGenerationError");
    });

    it("should create error with cause", () => {
      const cause = new Error("Original error");
      const error = new JourneyGenerationError("Wrapped error", { cause });
      expect(error.message).toBe("Wrapped error");
      expect(error.cause).toBe(cause);
    });

    it("should be instance of Error", () => {
      const error = new JourneyGenerationError("Test error");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
