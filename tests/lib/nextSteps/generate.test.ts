import { describe, it, expect } from "vitest";
import {
  generateNextSteps,
  hasNextSteps,
  getAvailableSteps,
  type NextStep,
  type NextStepPriority,
} from "@/lib/nextSteps/generate";
import type { CaseType } from "@/lib/validation";

describe("Next Steps Generation", () => {
  describe("generateNextSteps", () => {
    describe("Small Claims", () => {
      it("should generate 3 next steps for step 1 (File Claim)", () => {
        const steps = generateNextSteps("small_claims", 1);

        expect(steps).toHaveLength(3);
        expect(steps[0].title).toContain("Download");
        expect(steps[1].title).toContain("Gather");
        expect(steps[2].title).toContain("Review");
      });

      it("should generate 3 next steps for step 2 (Serve Defendant)", () => {
        const steps = generateNextSteps("small_claims", 2);

        expect(steps).toHaveLength(3);
        expect(steps[0].title).toContain("address");
        expect(steps[1].title).toContain("service method");
        expect(steps[2].title).toContain("proof of service");
      });

      it("should generate 3 next steps for step 3 (Prepare for Hearing)", () => {
        const steps = generateNextSteps("small_claims", 3);

        expect(steps).toHaveLength(3);
        expect(steps[0].title).toContain("Organize");
        expect(steps[1].title).toContain("Practice");
        expect(steps[2].title).toContain("copies");
      });

      it("should generate 3 next steps for step 4 (Attend Hearing)", () => {
        const steps = generateNextSteps("small_claims", 4);

        expect(steps).toHaveLength(3);
        expect(steps[0].title).toContain("Confirm");
        expect(steps[1].title).toContain("Prepare");
        expect(steps[2].title).toContain("outfit");
      });

      it("should generate 3 next steps for step 5 (Collect Judgment)", () => {
        const steps = generateNextSteps("small_claims", 5);

        expect(steps).toHaveLength(3);
        expect(steps[0].title).toContain("Wait");
        expect(steps[1].title).toContain("collection");
        expect(steps[2].title).toContain("records");
      });

      it("should have unique IDs for each step", () => {
        const steps = generateNextSteps("small_claims", 1);

        const ids = steps.map((s) => s.id);
        const uniqueIds = new Set(ids);

        expect(ids.length).toBe(uniqueIds.size);
      });

      it("should include all required NextStep fields", () => {
        const steps = generateNextSteps("small_claims", 1);

        steps.forEach((step) => {
          expect(step).toHaveProperty("id");
          expect(step).toHaveProperty("title");
          expect(step).toHaveProperty("description");
          expect(step).toHaveProperty("actionType");
          expect(step).toHaveProperty("priority");
        });
      });

      it("should have high priority steps first", () => {
        const steps = generateNextSteps("small_claims", 1);

        const highPrioritySteps = steps.filter((s) => s.priority === "high");
        expect(highPrioritySteps.length).toBeGreaterThan(0);

        // First two steps should be high priority
        expect(steps[0].priority).toBe("high");
        expect(steps[1].priority).toBe("high");
      });

      it("should include estimated times where applicable", () => {
        const steps = generateNextSteps("small_claims", 1);

        const stepsWithTime = steps.filter((s) => s.estimatedTime && s.estimatedTime > 0);
        expect(stepsWithTime.length).toBeGreaterThan(0);
      });

      it("should have descriptions for all steps", () => {
        const steps = generateNextSteps("small_claims", 1);

        steps.forEach((step) => {
          expect(step.description).toBeDefined();
          expect(step.description.length).toBeGreaterThan(0);
        });
      });
    });

    describe("Case Types Without Rules", () => {
      it("should return empty array for employment cases", () => {
        const steps = generateNextSteps("employment", 1);
        expect(steps).toEqual([]);
      });

      it("should return empty array for housing cases", () => {
        const steps = generateNextSteps("housing", 1);
        expect(steps).toEqual([]);
      });

      it("should return empty array for consumer cases", () => {
        const steps = generateNextSteps("consumer", 1);
        expect(steps).toEqual([]);
      });

      it("should return empty array for invalid step numbers", () => {
        const steps = generateNextSteps("small_claims", 99);
        expect(steps).toEqual([]);
      });

      it("should return empty array for step 0", () => {
        const steps = generateNextSteps("small_claims", 0);
        expect(steps).toEqual([]);
      });
    });
  });

  describe("hasNextSteps", () => {
    it("should return true for small_claims", () => {
      expect(hasNextSteps("small_claims")).toBe(true);
    });

    it("should return false for case types without rules", () => {
      expect(hasNextSteps("employment")).toBe(false);
      expect(hasNextSteps("housing")).toBe(false);
      expect(hasNextSteps("consumer")).toBe(false);
      expect(hasNextSteps("contract")).toBe(false);
      expect(hasNextSteps("discrimination")).toBe(false);
      expect(hasNextSteps("other")).toBe(false);
    });
  });

  describe("getAvailableSteps", () => {
    it("should return all 5 steps for small_claims", () => {
      const steps = getAvailableSteps("small_claims");

      expect(steps).toEqual([1, 2, 3, 4, 5]);
    });

    it("should return steps in order", () => {
      const steps = getAvailableSteps("small_claims");

      for (let i = 1; i < steps.length; i++) {
        expect(steps[i]).toBeGreaterThan(steps[i - 1]);
      }
    });

    it("should return empty array for case types without rules", () => {
      expect(getAvailableSteps("employment")).toEqual([]);
      expect(getAvailableSteps("housing")).toEqual([]);
    });
  });

  describe("NextStep Structure", () => {
    it("should validate NextStep type structure", () => {
      const step: NextStep = {
        id: "test-1",
        title: "Test Step",
        description: "Test description",
        actionType: "form",
        estimatedTime: 30,
        priority: "high",
      };

      expect(step.id).toBe("test-1");
      expect(step.priority).toBe("high");
    });

    it("should support optional estimatedTime", () => {
      const step: NextStep = {
        id: "test-1",
        title: "Test Step",
        description: "Test description",
        actionType: "form",
        priority: "high",
      };

      expect(step.estimatedTime).toBeUndefined();
    });

    it("should support all priority levels", () => {
      const priorities: NextStepPriority[] = ["high", "medium", "low"];

      priorities.forEach((priority) => {
        const step: NextStep = {
          id: "test",
          title: "Test",
          description: "Test",
          actionType: "form",
          priority,
        };

        expect(step.priority).toBe(priority);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative step numbers", () => {
      const steps = generateNextSteps("small_claims", -1);
      expect(steps).toEqual([]);
    });

    it("should handle very large step numbers", () => {
      const steps = generateNextSteps("small_claims", 1000);
      expect(steps).toEqual([]);
    });

    it("should consistently return same steps for same inputs", () => {
      const steps1 = generateNextSteps("small_claims", 1);
      const steps2 = generateNextSteps("small_claims", 1);

      expect(steps1).toEqual(steps2);
    });
  });

  describe("Performance", () => {
    it("should generate steps quickly (< 100ms)", () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        generateNextSteps("small_claims", 1);
      }

      const end = performance.now();
      const avgTime = (end - start) / 100;

      expect(avgTime).toBeLessThan(100);
    });
  });
});
