import { describe, it, expect } from "vitest";
import {
  toStepStatus,
  getCurrentStepOrder,
  mapStepsWithStatus,
  type StepStatus,
} from "@/lib/adapters/steps";
import type { CaseStep } from "@/lib/validation";

describe("Steps Adapter", () => {
  describe("toStepStatus", () => {
    it("should return 'completed' when step is complete", () => {
      const step = { order: 1, isComplete: true };
      const result = toStepStatus(step, 2);
      expect(result).toBe("completed");
    });

    it("should return 'in_progress' when step order matches currentOrder", () => {
      const step = { order: 2, isComplete: false };
      const result = toStepStatus(step, 2);
      expect(result).toBe("in_progress");
    });

    it("should return 'pending' when step is incomplete and not current", () => {
      const step = { order: 3, isComplete: false };
      const result = toStepStatus(step, 2);
      expect(result).toBe("pending");
    });

    it("should prioritize completed status over current order", () => {
      const step = { order: 1, isComplete: true };
      const result = toStepStatus(step, 1);
      expect(result).toBe("completed");
    });
  });

  describe("getCurrentStepOrder", () => {
    it("should return lowest incomplete step order", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "3",
          caseId: "case-1",
          name: "Step 3",
          order: 3,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const result = getCurrentStepOrder(steps);
      expect(result).toBe(2);
    });

    it("should return totalSteps + 1 when all steps are complete", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
      ];

      const result = getCurrentStepOrder(steps);
      expect(result).toBe(3);
    });

    it("should return 1 when there are no steps", () => {
      const steps: CaseStep[] = [];
      const result = getCurrentStepOrder(steps);
      expect(result).toBe(1);
    });

    it("should return 1 when first step is incomplete", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const result = getCurrentStepOrder(steps);
      expect(result).toBe(1);
    });

    it("should handle non-sequential order numbers", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 10,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 20,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "3",
          caseId: "case-1",
          name: "Step 3",
          order: 30,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const result = getCurrentStepOrder(steps);
      expect(result).toBe(20);
    });
  });

  describe("mapStepsWithStatus", () => {
    it("should map all steps with correct status", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "3",
          caseId: "case-1",
          name: "Step 3",
          order: 3,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const result = mapStepsWithStatus(steps);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe("completed");
      expect(result[1].status).toBe("in_progress");
      expect(result[2].status).toBe("pending");
    });

    it("should handle empty steps array", () => {
      const steps: CaseStep[] = [];
      const result = mapStepsWithStatus(steps);
      expect(result).toHaveLength(0);
    });

    it("should mark all steps as completed when all are complete", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
      ];

      const result = mapStepsWithStatus(steps);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("completed");
      expect(result[1].status).toBe("completed");
    });

    it("should handle mixed completion states", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "3",
          caseId: "case-1",
          name: "Step 3",
          order: 3,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "4",
          caseId: "case-1",
          name: "Step 4",
          order: 4,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "5",
          caseId: "case-1",
          name: "Step 5",
          order: 5,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const result = mapStepsWithStatus(steps);

      expect(result).toHaveLength(5);
      expect(result[0].status).toBe("completed");
      expect(result[1].status).toBe("completed");
      expect(result[2].status).toBe("in_progress");
      expect(result[3].status).toBe("pending");
      expect(result[4].status).toBe("pending");
    });

    it("should preserve original step properties", () => {
      const steps: CaseStep[] = [
        {
          id: "step-123",
          caseId: "case-456",
          name: "Important Step",
          order: 1,
          isComplete: false,
          dueDate: new Date("2025-12-31"),
          completedAt: null,
        },
      ];

      const result = mapStepsWithStatus(steps);

      expect(result[0].id).toBe("step-123");
      expect(result[0].caseId).toBe("case-456");
      expect(result[0].name).toBe("Important Step");
      expect(result[0].order).toBe(1);
      expect(result[0].isComplete).toBe(false);
      expect(result[0].dueDate).toEqual(new Date("2025-12-31"));
      expect(result[0].completedAt).toBeNull();
      expect(result[0].status).toBe("in_progress");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single incomplete step", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const currentOrder = getCurrentStepOrder(steps);
      expect(currentOrder).toBe(1);

      const status = toStepStatus(steps[0], currentOrder);
      expect(status).toBe("in_progress");
    });

    it("should handle single completed step", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
      ];

      const currentOrder = getCurrentStepOrder(steps);
      expect(currentOrder).toBe(2);

      const status = toStepStatus(steps[0], currentOrder);
      expect(status).toBe("completed");
    });

    it("should handle out-of-order completion", () => {
      const steps: CaseStep[] = [
        {
          id: "1",
          caseId: "case-1",
          name: "Step 1",
          order: 1,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
        {
          id: "2",
          caseId: "case-1",
          name: "Step 2",
          order: 2,
          isComplete: true,
          dueDate: null,
          completedAt: new Date(),
        },
        {
          id: "3",
          caseId: "case-1",
          name: "Step 3",
          order: 3,
          isComplete: false,
          dueDate: null,
          completedAt: null,
        },
      ];

      const currentOrder = getCurrentStepOrder(steps);
      expect(currentOrder).toBe(1); // Lowest incomplete

      const result = mapStepsWithStatus(steps);
      expect(result[0].status).toBe("in_progress"); // order 1, incomplete
      expect(result[1].status).toBe("completed"); // order 2, complete
      expect(result[2].status).toBe("pending"); // order 3, incomplete
    });
  });
});
