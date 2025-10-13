import { describe, it, expect } from "vitest";
import {
  templates,
  getTemplate,
  hasTemplate,
  getAvailableCaseTypes,
  type JourneyTemplate,
  type StepType,
} from "@/lib/journeys/templates";
import type { CaseType } from "@/lib/validation";

describe("Journey Templates", () => {
  describe("Template Structure", () => {
    it("should have templates defined", () => {
      expect(templates).toBeDefined();
      expect(typeof templates).toBe("object");
    });

    it("should have small_claims template with 5 steps", () => {
      expect(templates.small_claims).toBeDefined();
      expect(templates.small_claims).toHaveLength(5);
    });

    it("should have all required case type keys", () => {
      const requiredTypes: CaseType[] = [
        "small_claims",
        "employment",
        "housing",
        "consumer",
        "contract",
        "discrimination",
        "other",
      ];

      requiredTypes.forEach((caseType) => {
        expect(templates[caseType]).toBeDefined();
      });
    });
  });

  describe("Small Claims Template", () => {
    const smallClaimsSteps = templates.small_claims;

    it("should have correct step titles", () => {
      expect(smallClaimsSteps[0].title).toBe("File Your Claim");
      expect(smallClaimsSteps[1].title).toBe("Serve the Defendant");
      expect(smallClaimsSteps[2].title).toBe("Prepare for Hearing");
      expect(smallClaimsSteps[3].title).toBe("Attend Court Hearing");
      expect(smallClaimsSteps[4].title).toBe("Collect Judgment");
    });

    it("should have descriptions for all steps", () => {
      smallClaimsSteps.forEach((step) => {
        expect(step.description).toBeDefined();
        expect(step.description.length).toBeGreaterThan(0);
      });
    });

    it("should have valid step types", () => {
      const validStepTypes: StepType[] = [
        "form",
        "document",
        "review",
        "submit",
        "wait",
        "meeting",
        "communication",
      ];

      smallClaimsSteps.forEach((step) => {
        expect(validStepTypes).toContain(step.stepType);
      });
    });

    it("should have instructions arrays", () => {
      smallClaimsSteps.forEach((step) => {
        expect(Array.isArray(step.instructions)).toBe(true);
        expect(step.instructions.length).toBeGreaterThan(0);
      });
    });

    it("should have estimated times", () => {
      smallClaimsSteps.forEach((step) => {
        expect(step.estimatedTime).toBeDefined();
        expect(typeof step.estimatedTime).toBe("number");
        expect(step.estimatedTime).toBeGreaterThan(0);
      });
    });

    it("should have disclaimers", () => {
      smallClaimsSteps.forEach((step) => {
        expect(step.disclaimer).toBeDefined();
        expect(typeof step.disclaimer).toBe("string");
        expect(step.disclaimer?.length).toBeGreaterThan(0);
      });
    });

    it("should not contain absolute legal statements", () => {
      smallClaimsSteps.forEach((step) => {
        const allInstructions = step.instructions.join(" ");

        // Should not contain absolute statements that could be construed as legal advice
        expect(allInstructions).not.toMatch(/\byou must\b/i);
        expect(allInstructions).not.toMatch(/\byou are required\b/i);
      });
    });

    it("should have 'not legal advice' disclaimers", () => {
      smallClaimsSteps.forEach((step) => {
        expect(step.disclaimer?.toLowerCase()).toContain("not legal advice");
      });
    });
  });

  describe("getTemplate", () => {
    it("should return small claims template", () => {
      const template = getTemplate("small_claims");
      expect(template).toHaveLength(5);
      expect(template[0].title).toBe("File Your Claim");
    });

    it("should return empty array for case types without templates", () => {
      const template = getTemplate("employment");
      expect(template).toEqual([]);
    });

    it("should return array for all case types", () => {
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
        const template = getTemplate(caseType);
        expect(Array.isArray(template)).toBe(true);
      });
    });
  });

  describe("hasTemplate", () => {
    it("should return true for small_claims", () => {
      expect(hasTemplate("small_claims")).toBe(true);
    });

    it("should return false for case types without templates", () => {
      expect(hasTemplate("employment")).toBe(false);
      expect(hasTemplate("housing")).toBe(false);
      expect(hasTemplate("consumer")).toBe(false);
      expect(hasTemplate("contract")).toBe(false);
      expect(hasTemplate("discrimination")).toBe(false);
      expect(hasTemplate("other")).toBe(false);
    });
  });

  describe("getAvailableCaseTypes", () => {
    it("should return array of case types with templates", () => {
      const available = getAvailableCaseTypes();
      expect(Array.isArray(available)).toBe(true);
      expect(available).toContain("small_claims");
    });

    it("should only include case types with steps", () => {
      const available = getAvailableCaseTypes();
      available.forEach((caseType) => {
        const template = getTemplate(caseType);
        expect(template.length).toBeGreaterThan(0);
      });
    });

    it("should not include case types without templates", () => {
      const available = getAvailableCaseTypes();
      expect(available).not.toContain("employment");
      expect(available).not.toContain("housing");
    });
  });

  describe("Template Validation", () => {
    it("should have valid JourneyTemplate structure", () => {
      const template: JourneyTemplate = {
        title: "Test Step",
        description: "Test description",
        stepType: "form",
        instructions: ["Instruction 1"],
        estimatedTime: 30,
        disclaimer: "Test disclaimer",
      };

      expect(template.title).toBe("Test Step");
      expect(template.stepType).toBe("form");
    });

    it("should support optional fields", () => {
      const template: JourneyTemplate = {
        title: "Test Step",
        description: "Test description",
        stepType: "form",
        instructions: ["Instruction 1"],
      };

      expect(template.estimatedTime).toBeUndefined();
      expect(template.disclaimer).toBeUndefined();
    });
  });

  describe("Step Type Coverage", () => {
    it("should use diverse step types in small claims template", () => {
      const stepTypes = templates.small_claims.map((step) => step.stepType);
      const uniqueTypes = new Set(stepTypes);

      // Should have at least 4 different step types
      expect(uniqueTypes.size).toBeGreaterThanOrEqual(4);
    });

    it("should have appropriate estimated times", () => {
      templates.small_claims.forEach((step) => {
        expect(step.estimatedTime).toBeDefined();
        // Estimated times should be reasonable (5 minutes to 3 hours)
        expect(step.estimatedTime!).toBeGreaterThanOrEqual(5);
        expect(step.estimatedTime!).toBeLessThanOrEqual(180);
      });
    });
  });
});
