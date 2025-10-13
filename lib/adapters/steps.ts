import type { CaseStep } from "@/lib/validation";

/**
 * Step status enum for UI representation
 * Maps boolean isComplete field to semantic status
 */
export type StepStatus = "completed" | "in_progress" | "pending";

/**
 * Convert a step to its UI status based on completion state and current order
 * @param step - The step with order and completion status
 * @param currentOrder - The order of the current step (lowest incomplete)
 * @returns StepStatus enum value
 */
export function toStepStatus(
  step: { order: number; isComplete: boolean },
  currentOrder: number
): StepStatus {
  if (step.isComplete) {
    return "completed";
  }
  if (step.order === currentOrder) {
    return "in_progress";
  }
  return "pending";
}

/**
 * Get the current step order from a list of steps
 * Returns the lowest order among incomplete steps, or totalSteps + 1 if all complete
 * @param steps - Array of case steps
 * @returns The order number of the current step
 */
export function getCurrentStepOrder(steps: CaseStep[]): number {
  const incompleteSteps = steps.filter((step) => !step.isComplete);

  if (incompleteSteps.length === 0) {
    // All steps complete
    return steps.length > 0 ? steps.length + 1 : 1;
  }

  return Math.min(...incompleteSteps.map((s) => s.order));
}

/**
 * Map all steps to their UI status
 * @param steps - Array of case steps
 * @returns Array of steps with their status
 */
export function mapStepsWithStatus(
  steps: CaseStep[]
): Array<CaseStep & { status: StepStatus }> {
  const currentOrder = getCurrentStepOrder(steps);

  return steps.map((step) => ({
    ...step,
    status: toStepStatus(step, currentOrder),
  }));
}
