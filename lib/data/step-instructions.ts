/**
 * Step Instruction Templates
 * 
 * Hardcoded instruction templates for Small Claims case type.
 * These will be replaced with Firestore-backed templates in Phase 1.5.
 */

export interface StepInstruction {
  title: string;
  instructions: string[];
  estimatedTime: string;
  resources?: string[];
  helpText?: string;
}

const SMALL_CLAIMS_INSTRUCTIONS: Record<string, StepInstruction> = {
  "File Complaint": {
    title: "File Your Small Claims Complaint",
    instructions: [
      "Complete form SC-100 (Plaintiff's Claim and ORDER to Go to Small Claims Court).",
      "Make 2 copies of the completed form for your records.",
      "File the original form at the courthouse clerk's office during business hours.",
      "Pay the filing fee or request a fee waiver using form FW-001 if you qualify.",
    ],
    estimatedTime: "1-2 hours",
    resources: [
      "Form SC-100 (available at courthouse or online)",
      "Fee Waiver Form FW-001",
    ],
    helpText: "Filing fee varies by claim amount ($30-$100). Fee waivers available for low-income filers.",
  },
  
  "Serve Defendant": {
    title: "Serve the Defendant",
    instructions: [
      "Have someone over 18 (not you) deliver the court papers to the defendant.",
      "Service can be done in person, by substituted service, or by certified mail.",
      "The server must complete a Proof of Service form (SC-104) after delivery.",
      "File the completed Proof of Service with the court before the hearing.",
    ],
    estimatedTime: "30 minutes to 1 hour",
    resources: [
      "Proof of Service Form SC-104",
      "List of professional process servers (optional)",
    ],
    helpText: "Service must be completed 15-20 days before your hearing date. You cannot serve the papers yourself.",
  },
  
  "Wait for Response": {
    title: "Wait for Defendant's Response",
    instructions: [
      "The defendant has 30 days from service to file a response.",
      "If no response is filed, you can request a default judgment.",
      "If the defendant files a response or counterclaim, review it carefully.",
      "Start organizing your evidence and preparing for the hearing.",
    ],
    estimatedTime: "Ongoing (30-day period)",
    resources: [
      "Evidence checklist",
      "Hearing preparation guide",
    ],
    helpText: "Use this time to gather receipts, photos, contracts, and any other proof supporting your claim.",
  },
  
  "Attend Hearing": {
    title: "Attend Your Court Hearing",
    instructions: [
      "Arrive at the courthouse 30 minutes early with all your documents.",
      "Bring 3 copies of all evidence (one for you, judge, and defendant).",
      "Dress professionally and turn off your phone before entering the courtroom.",
      "Address the judge as 'Your Honor' and speak clearly when presenting your case.",
      "Be prepared to answer questions about your claim and evidence.",
    ],
    estimatedTime: "15-30 minutes (plus wait time)",
    resources: [
      "Evidence packet (3 copies)",
      "Witness list (if applicable)",
      "Notebook for taking notes",
    ],
    helpText: "Court hearings are typically brief (15-minute slots). Be concise and focus on facts.",
  },
  
  "Receive Judgment": {
    title: "Receive and Understand the Judgment",
    instructions: [
      "The judge will issue a judgment, usually on the same day or within 10 days.",
      "Read the judgment carefully to understand the outcome and payment terms.",
      "If you won, the defendant typically has 30 days to pay.",
      "If the defendant doesn't pay, you can file for enforcement or wage garnishment.",
      "If you disagree with the judgment, you have 30 days to file an appeal.",
    ],
    estimatedTime: "30 minutes to review",
    resources: [
      "Judgment document",
      "Enforcement options guide",
      "Appeal process information",
    ],
    helpText: "Keep all court documents organized. You'll need them if you need to enforce the judgment.",
  },
};

/**
 * Get instruction template for a step by name
 * @param stepName - The name of the step (e.g., "File Complaint")
 * @returns StepInstruction object or null if not found
 */
export function getStepInstructions(stepName: string): StepInstruction | null {
  return SMALL_CLAIMS_INSTRUCTIONS[stepName] || null;
}

/**
 * Get default instructions for unknown steps
 * @returns Generic StepInstruction
 */
export function getDefaultInstructions(): StepInstruction {
  return {
    title: "Complete This Step",
    instructions: [
      "Follow the specific requirements for this step as provided by your court.",
      "Keep copies of all documents you file.",
      "Note any important deadlines or requirements.",
    ],
    estimatedTime: "Varies",
    helpText: "Instructions for this step will be available soon.",
  };
}

