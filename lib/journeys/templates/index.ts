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

  eviction: [
    {
      title: "Review Eviction Notice",
      description: "Understand the eviction notice and your rights",
      stepType: "review",
      instructions: [
        "Generally, you should carefully read the eviction notice to understand the reason and timeline",
        "In most jurisdictions, you have a specific number of days to respond or move out",
        "Typically, you can contest the eviction if you believe it's wrongful or if proper procedures weren't followed",
        "Keep copies of all documents and correspondence related to the eviction",
        "Note: Eviction laws vary significantly by state - check your local tenant rights",
      ],
      estimatedTime: 30,
      disclaimer: "This is general information, not legal advice. Consult a tenant rights organization or attorney for specific guidance.",
    },
    {
      title: "File Answer or Response",
      description: "Respond to the eviction notice within the required timeframe",
      stepType: "form",
      instructions: [
        "Generally, you must file an answer with the court within the specified timeframe (usually 3-7 days)",
        "In most cases, you can file a general denial or specific defenses to the eviction",
        "Typically, you'll need to pay a filing fee unless you qualify for a fee waiver",
        "Keep proof of filing and any court dates scheduled",
        "Note: Missing the deadline usually results in automatic eviction - contact legal aid immediately if you're past due",
      ],
      estimatedTime: 60,
      disclaimer: "This is general information, not legal advice. Time limits are critical - seek immediate legal help if needed.",
    },
    {
      title: "Prepare for Court Hearing",
      description: "Gather evidence and prepare your defense",
      stepType: "review",
      instructions: [
        "Generally, you should organize all evidence including lease, rent receipts, repair requests, and photos",
        "In most cases, you can present defenses like habitability issues, retaliation, or improper notice",
        "Typically, you should prepare a timeline of events and gather witness statements if applicable",
        "Practice explaining your case clearly and bring multiple copies of all documents",
        "Note: Court procedures vary - consider consulting with legal aid for case preparation",
      ],
      estimatedTime: 120,
      disclaimer: "This is general information, not legal advice. Consider seeking legal representation for court proceedings.",
    },
    {
      title: "Attend Court Hearing",
      description: "Present your case to the judge",
      stepType: "meeting",
      instructions: [
        "Typically, you should arrive early and dress professionally for court",
        "Generally, the judge will hear both sides and may ask questions about your case",
        "In most cases, you'll have the opportunity to present evidence and respond to landlord claims",
        "Bring all original documents and be prepared to explain your defense clearly",
        "Note: Court decisions are usually final - consider having legal representation if possible",
      ],
      estimatedTime: 90,
      disclaimer: "This is general information, not legal advice. Court proceedings can be complex - legal representation is recommended.",
    },
    {
      title: "Follow Up on Court Decision",
      description: "Understand and act on the court's decision",
      stepType: "wait",
      instructions: [
        "Generally, if you lose, you'll have a specific timeframe to move out or appeal",
        "In most cases, if you win, the eviction is dismissed and you can stay",
        "Typically, you should get a written copy of the court's decision",
        "If you need more time to move, you may be able to request a stay of execution",
        "Note: Appeal deadlines are usually very short - consult an attorney immediately if you want to appeal",
      ],
      estimatedTime: 30,
      disclaimer: "This is general information, not legal advice. Court decisions have strict timelines - seek immediate legal help if needed.",
    },
  ],

  family_law: [
    {
      title: "Gather Required Documents",
      description: "Collect all necessary paperwork for your family law case",
      stepType: "document",
      instructions: [
        "Generally, you'll need identification, marriage certificate, financial records, and any existing court orders",
        "In most cases, you'll need to provide proof of income, assets, and debts",
        "Typically, you should gather any evidence related to your case (photos, emails, witness statements)",
        "Make copies of all documents and organize them chronologically",
        "Note: Document requirements vary by case type and jurisdiction - check with your local court",
      ],
      estimatedTime: 90,
      disclaimer: "This is general information, not legal advice. Family law cases often require legal representation.",
    },
    {
      title: "File Initial Petition",
      description: "Complete and file the required court forms",
      stepType: "form",
      instructions: [
        "Generally, you'll need to complete specific forms for your type of family law case",
        "In most jurisdictions, you can get forms from the court clerk's office or online",
        "Typically, you'll need to pay a filing fee unless you qualify for a fee waiver",
        "File the original with the court and keep copies for your records",
        "Note: Family law forms can be complex - consider consulting with legal aid or an attorney",
      ],
      estimatedTime: 120,
      disclaimer: "This is general information, not legal advice. Family law cases often require legal representation due to complexity.",
    },
    {
      title: "Serve the Other Party",
      description: "Provide legal notice to the other party about your case",
      stepType: "communication",
      instructions: [
        "Generally, you cannot serve the other party yourself - you'll need someone over 18 who is not involved",
        "In most cases, service can be done by personal delivery, certified mail, or process server",
        "Typically, you must file proof of service with the court within a specific timeframe",
        "Keep all receipts and documentation related to service",
        "Note: Improper service can delay your case - follow your court's specific requirements",
      ],
      estimatedTime: 60,
      disclaimer: "This is general information, not legal advice. Service requirements vary by jurisdiction and case type.",
    },
    {
      title: "Attend Court Hearings",
      description: "Participate in scheduled court proceedings",
      stepType: "meeting",
      instructions: [
        "Typically, you should arrive early and dress professionally for court",
        "Generally, bring all relevant documents and be prepared to answer questions",
        "In most cases, the judge will ask both parties to present their positions",
        "Be respectful and follow all court rules and procedures",
        "Note: Family law hearings can be emotional - consider having legal representation",
      ],
      estimatedTime: 120,
      disclaimer: "This is general information, not legal advice. Family law cases often require legal representation due to emotional and legal complexity.",
    },
    {
      title: "Follow Court Orders",
      description: "Comply with any court orders or judgments",
      stepType: "review",
      instructions: [
        "Generally, you must follow all court orders exactly as written",
        "In most cases, you should keep copies of all orders and track compliance",
        "Typically, you can request modifications if circumstances change significantly",
        "If the other party violates orders, you may need to file a motion for enforcement",
        "Note: Violating court orders can result in penalties - consult an attorney if you have questions",
      ],
      estimatedTime: 60,
      disclaimer: "This is general information, not legal advice. Court orders are legally binding - seek legal help if you have compliance questions.",
    },
  ],

  other_civil: [
    {
      title: "Research Your Legal Issue",
      description: "Understand the legal basis for your case",
      stepType: "review",
      instructions: [
        "Generally, you should research the specific laws that apply to your situation",
        "In most cases, you can find information at your local law library or online legal resources",
        "Typically, you should understand the elements you need to prove for your case",
        "Consider consulting with legal aid or a law librarian for guidance",
        "Note: Legal research can be complex - consider consulting with an attorney for complex issues",
      ],
      estimatedTime: 120,
      disclaimer: "This is general information, not legal advice. Legal research can be complex and case-specific.",
    },
    {
      title: "Gather Evidence and Documentation",
      description: "Collect all relevant evidence for your case",
      stepType: "document",
      instructions: [
        "Generally, you should gather all documents, photos, emails, and other evidence related to your case",
        "In most cases, you'll need to organize evidence chronologically and make copies",
        "Typically, you should identify potential witnesses and their contact information",
        "Keep detailed records of all interactions and communications",
        "Note: Evidence rules vary by jurisdiction - some evidence may not be admissible in court",
      ],
      estimatedTime: 90,
      disclaimer: "This is general information, not legal advice. Evidence rules are complex and vary by jurisdiction.",
    },
    {
      title: "File Your Case",
      description: "Complete and file the necessary court forms",
      stepType: "form",
      instructions: [
        "Generally, you'll need to complete specific forms for your type of civil case",
        "In most jurisdictions, you can get forms from the court clerk's office or online",
        "Typically, you'll need to pay a filing fee unless you qualify for a fee waiver",
        "File the original with the court and serve copies on the other party",
        "Note: Civil procedure rules are complex - consider consulting with legal aid or an attorney",
      ],
      estimatedTime: 150,
      disclaimer: "This is general information, not legal advice. Civil procedure rules are complex and vary by jurisdiction.",
    },
    {
      title: "Prepare for Court Proceedings",
      description: "Get ready for hearings or trial",
      stepType: "review",
      instructions: [
        "Generally, you should prepare a clear, organized presentation of your case",
        "In most cases, you should practice explaining your position and presenting evidence",
        "Typically, you should prepare questions for witnesses and anticipate the other side's arguments",
        "Bring multiple copies of all documents and evidence",
        "Note: Court proceedings can be complex - consider having legal representation",
      ],
      estimatedTime: 180,
      disclaimer: "This is general information, not legal advice. Court proceedings can be complex and adversarial.",
    },
    {
      title: "Follow Up on Court Decision",
      description: "Understand and act on the court's decision",
      stepType: "wait",
      instructions: [
        "Generally, you should get a written copy of the court's decision",
        "In most cases, you may have the right to appeal within a specific timeframe",
        "Typically, if you win, you may need to take steps to collect any money awarded",
        "If you lose, you should understand your options and any deadlines",
        "Note: Appeal deadlines are usually strict - consult an attorney immediately if you want to appeal",
      ],
      estimatedTime: 60,
      disclaimer: "This is general information, not legal advice. Court decisions have strict timelines and procedures.",
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
