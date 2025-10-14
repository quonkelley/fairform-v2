import type { CaseType } from "@/lib/validation";
import type { StepType } from "@/lib/journeys/templates";

/**
 * Priority level for next steps
 */
export type NextStepPriority = "high" | "medium" | "low";

/**
 * Next step suggestion structure
 */
export interface NextStep {
  id: string;
  title: string;
  description: string;
  actionType: StepType;
  estimatedTime?: number; // in minutes
  priority: NextStepPriority;
}

/**
 * Next steps rule definition for case types
 */
interface NextStepsRule {
  caseType: CaseType;
  stepOrder: number;
  steps: Omit<NextStep, "id">[];
}

/**
 * Rule-based next steps for Small Claims cases
 */
const smallClaimsRules: NextStepsRule[] = [
  {
    caseType: "small_claims",
    stepOrder: 1, // File Your Claim
    steps: [
      {
        title: "Download the small claims court form",
        description:
          "Obtain the official small claims form from your local court website or clerk's office",
        actionType: "form",
        estimatedTime: 10,
        priority: "high",
      },
      {
        title: "Gather supporting documents",
        description:
          "Collect contracts, receipts, photos, emails, and any other evidence for your case",
        actionType: "document",
        estimatedTime: 30,
        priority: "high",
      },
      {
        title: "Review filing requirements",
        description:
          "Check your court's specific requirements for filing fees, copies, and submission methods",
        actionType: "review",
        estimatedTime: 15,
        priority: "medium",
      },
    ],
  },
  {
    caseType: "small_claims",
    stepOrder: 2, // Serve the Defendant
    steps: [
      {
        title: "Obtain the defendant's current address",
        description:
          "Verify you have the correct legal address for the defendant to ensure proper service",
        actionType: "communication",
        estimatedTime: 15,
        priority: "high",
      },
      {
        title: "Choose your service method",
        description:
          "Research acceptable service methods in your jurisdiction (personal delivery, certified mail, or process server)",
        actionType: "review",
        estimatedTime: 20,
        priority: "high",
      },
      {
        title: "Prepare proof of service form",
        description:
          "Download and review the proof of service form you'll need to file with the court",
        actionType: "form",
        estimatedTime: 10,
        priority: "medium",
      },
    ],
  },
  {
    caseType: "small_claims",
    stepOrder: 3, // Prepare for Hearing
    steps: [
      {
        title: "Organize your evidence",
        description:
          "Create a clear timeline of events and organize all documents, photos, and receipts chronologically",
        actionType: "review",
        estimatedTime: 60,
        priority: "high",
      },
      {
        title: "Practice your presentation",
        description:
          "Prepare a brief, clear explanation of your case focusing on facts rather than emotions",
        actionType: "review",
        estimatedTime: 45,
        priority: "high",
      },
      {
        title: "Make copies of all documents",
        description:
          "Prepare at least 3 copies of all evidence (for yourself, the defendant, and the judge)",
        actionType: "document",
        estimatedTime: 20,
        priority: "medium",
      },
    ],
  },
  {
    caseType: "small_claims",
    stepOrder: 4, // Attend Court Hearing
    steps: [
      {
        title: "Confirm hearing details",
        description:
          "Verify the date, time, and location of your hearing and plan to arrive 15 minutes early",
        actionType: "review",
        estimatedTime: 10,
        priority: "high",
      },
      {
        title: "Prepare your documents",
        description:
          "Organize all original documents and evidence in the order you plan to present them",
        actionType: "document",
        estimatedTime: 30,
        priority: "high",
      },
      {
        title: "Plan your outfit",
        description:
          "Choose professional attire to make a good impression on the judge",
        actionType: "review",
        estimatedTime: 10,
        priority: "low",
      },
    ],
  },
  {
    caseType: "small_claims",
    stepOrder: 5, // Collect Judgment
    steps: [
      {
        title: "Wait for the judgment",
        description:
          "The judge may issue a judgment immediately or mail it within a few weeks",
        actionType: "wait",
        estimatedTime: 0,
        priority: "high",
      },
      {
        title: "Review collection options",
        description:
          "If you win, research your options for collecting the judgment (wage garnishment, bank levy, etc.)",
        actionType: "review",
        estimatedTime: 30,
        priority: "medium",
      },
      {
        title: "Keep detailed records",
        description:
          "Document all attempts to collect the judgment and any payments received",
        actionType: "document",
        estimatedTime: 15,
        priority: "medium",
      },
    ],
  },
];

/**
 * All case type rules registry
 */
const allRules: NextStepsRule[] = [
  ...smallClaimsRules,
  // Future case types can be added here
];

/**
 * Generate next steps for a case based on case type and current step
 * @param caseType - The type of case
 * @param currentStep - The current step order (1-indexed)
 * @returns Array of next steps (max 3)
 */
export function generateNextSteps(
  caseType: CaseType,
  currentStep: number
): NextStep[] {
  // Find matching rule for case type and step
  const rule = allRules.find(
    (r) => r.caseType === caseType && r.stepOrder === currentStep
  );

  if (!rule) {
    // No specific rules for this case type/step combination
    return [];
  }

  // Map rule steps to NextStep format with unique IDs
  return rule.steps.slice(0, 3).map((step, index) => ({
    ...step,
    id: `${caseType}-${currentStep}-${index}`,
  }));
}

/**
 * Check if next steps are available for a case type
 * @param caseType - The type of case
 * @returns True if next steps rules exist
 */
export function hasNextSteps(caseType: CaseType): boolean {
  return allRules.some((rule) => rule.caseType === caseType);
}

/**
 * Get all available step orders for a case type
 * @param caseType - The type of case
 * @returns Array of step orders with next steps
 */
export function getAvailableSteps(caseType: CaseType): number[] {
  return allRules
    .filter((rule) => rule.caseType === caseType)
    .map((rule) => rule.stepOrder)
    .sort((a, b) => a - b);
}
