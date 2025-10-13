import type { CaseType, CaseStep } from "@/lib/validation";
import { getTemplate, hasTemplate } from "./templates";
import { createStep } from "@/lib/db/stepsRepo";

/**
 * Error thrown when journey generation fails
 */
export class JourneyGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "JourneyGenerationError";
  }
}

/**
 * Generate case journey steps from template
 * @param caseId - The case ID to generate steps for
 * @param caseType - The case type to use template from
 * @returns Array of created case steps
 * @throws JourneyGenerationError if template not found or generation fails
 */
export async function generateCaseJourney(
  caseId: string,
  caseType: CaseType
): Promise<CaseStep[]> {
  try {
    // Validate case type has template
    if (!hasTemplate(caseType)) {
      throw new JourneyGenerationError(
        `No template found for case type: ${caseType}`,
        { cause: { caseType } }
      );
    }

    // Get template for case type
    const template = getTemplate(caseType);

    // Generate steps from template
    const steps: CaseStep[] = [];

    for (let index = 0; index < template.length; index++) {
      const stepTemplate = template[index];

      // Create step from template
      const step = await createStep({
        caseId,
        name: stepTemplate.title,
        order: index + 1, // 1-indexed
        dueDate: null, // No due date by default
      });

      steps.push(step);
    }

    return steps;
  } catch (error) {
    if (error instanceof JourneyGenerationError) {
      throw error;
    }

    console.error("Failed to generate case journey", { caseId, caseType, error });
    throw new JourneyGenerationError("Unable to generate case journey", {
      cause: error,
    });
  }
}

/**
 * Get step count for a case type template
 * @param caseType - The case type to check
 * @returns Number of steps in template, or 0 if no template
 */
export function getTemplateStepCount(caseType: CaseType): number {
  const template = getTemplate(caseType);
  return template.length;
}

/**
 * Get template step details without creating steps
 * @param caseType - The case type to get details for
 * @returns Array of step information from template
 */
export function getTemplateStepDetails(caseType: CaseType) {
  const template = getTemplate(caseType);

  return template.map((stepTemplate, index) => ({
    order: index + 1,
    title: stepTemplate.title,
    description: stepTemplate.description,
    stepType: stepTemplate.stepType,
    estimatedTime: stepTemplate.estimatedTime,
    instructions: stepTemplate.instructions,
    disclaimer: stepTemplate.disclaimer,
  }));
}
