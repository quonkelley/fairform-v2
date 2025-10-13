import type { CaseType } from "@/lib/validation";

/**
 * Step type categorization for journey templates
 */
export type StepType =
  | "form" // Filling out forms or applications
  | "document" // Creating or reviewing documents
  | "review" // Reviewing information or preparing materials
  | "submit" // Submitting forms or documents
  | "wait" // Waiting for response or processing
  | "meeting" // Attending meetings or hearings
  | "communication"; // Communication with other parties

/**
 * Journey template structure for case type workflows
 */
export interface JourneyTemplate {
  /** Step title (user-facing) */
  title: string;
  /** Brief description of what this step entails */
  description: string;
  /** Categorization of step type */
  stepType: StepType;
  /** Array of instructional guidance (use "generally", "typically" language) */
  instructions: string[];
  /** Estimated time to complete in minutes (optional) */
  estimatedTime?: number;
  /** Legal disclaimer for this step (optional) */
  disclaimer?: string;
}

/**
 * Template registry mapping case types to their journey templates
 */
export const templates: Record<CaseType, JourneyTemplate[]> = {
  small_claims: [
    {
      title: "File Your Claim",
      description: "Complete and file your small claims court form",
      stepType: "form",
      instructions: [
        "Generally, you'll need to obtain the small claims form from your local court clerk's office or website",
        "Fill out all required information including plaintiff and defendant details, claim amount, and brief description of your case",
        "In most jurisdictions, you'll need to pay a filing fee when submitting the form",
        "Keep copies of all forms and receipts for your records",
        "Note: Requirements vary by jurisdiction - check with your local court for specific filing procedures",
      ],
      estimatedTime: 30,
      disclaimer: "This is general information, not legal advice. Consult your local court for specific requirements.",
    },
    {
      title: "Serve the Defendant",
      description: "Deliver legal notice to the defendant about your claim",
      stepType: "communication",
      instructions: [
        "Typically, you cannot serve the defendant yourself - you'll need someone over 18 who is not involved in the case",
        "Service methods generally include personal delivery, certified mail, or process server",
        "In most jurisdictions, proof of service must be filed with the court within a specific timeframe",
        "Keep all proof of service documentation (receipts, signed forms, tracking numbers)",
        "Note: Service requirements vary by state - verify acceptable methods with your local court",
      ],
      estimatedTime: 45,
      disclaimer: "This is general information, not legal advice. Improper service may delay your case.",
    },
    {
      title: "Prepare for Hearing",
      description: "Gather evidence and organize your case presentation",
      stepType: "review",
      instructions: [
        "Generally, you should organize all evidence including contracts, receipts, photos, emails, and witness statements",
        "Create a timeline of events and prepare a brief outline of what you'll say to the judge",
        "In most cases, bring at least 3 copies of all documents (for yourself, defendant, and judge)",
        "Practice explaining your case clearly and concisely, focusing on facts rather than emotions",
        "Note: Check your court's specific rules about evidence submission and witness testimony",
      ],
      estimatedTime: 120,
      disclaimer: "This is general information, not legal advice. Consider consulting with legal aid for case preparation assistance.",
    },
    {
      title: "Attend Court Hearing",
      description: "Present your case to the judge",
      stepType: "meeting",
      instructions: [
        "Typically, you should arrive at least 15 minutes early and dress professionally",
        "Bring all original documents and evidence you plan to present",
        "Generally, the judge will ask both parties to present their side of the story - remain calm and respectful",
        "In most cases, you'll have the opportunity to present evidence and respond to the defendant's claims",
        "Note: Court procedures vary - observe other cases if possible to understand the process",
      ],
      estimatedTime: 60,
      disclaimer: "This is general information, not legal advice. Follow all court rules and judge instructions.",
    },
    {
      title: "Collect Judgment",
      description: "Follow up on the court's decision",
      stepType: "wait",
      instructions: [
        "Generally, if you win, the court will issue a judgment specifying the amount owed",
        "In most jurisdictions, the defendant has a specific timeframe to pay the judgment voluntarily",
        "If the defendant doesn't pay, you may need to pursue collection methods such as wage garnishment or bank levy",
        "Keep detailed records of all payments received and remaining balance",
        "Note: Collection procedures vary by state - contact your court clerk for guidance on enforcing judgments",
      ],
      estimatedTime: 90,
      disclaimer: "This is general information, not legal advice. Consult your local court for judgment enforcement procedures.",
    },
  ],

  // Placeholder templates for future case types
  employment: [],
  housing: [],
  consumer: [],
  contract: [],
  discrimination: [],
  other: [],
};

/**
 * Get journey template for a specific case type
 * @param caseType - The case type to get template for
 * @returns Array of journey templates, or empty array if not found
 */
export function getTemplate(caseType: CaseType): JourneyTemplate[] {
  return templates[caseType] || [];
}

/**
 * Validate that a case type has a template defined
 * @param caseType - The case type to validate
 * @returns True if template exists and has steps
 */
export function hasTemplate(caseType: CaseType): boolean {
  const template = templates[caseType];
  return template !== undefined && template.length > 0;
}

/**
 * Get all case types that have templates defined
 * @returns Array of case types with templates
 */
export function getAvailableCaseTypes(): CaseType[] {
  return (Object.keys(templates) as CaseType[]).filter((caseType) =>
    hasTemplate(caseType)
  );
}
