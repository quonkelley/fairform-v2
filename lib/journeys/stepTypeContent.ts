import type { StepType } from "@/lib/validation";

export interface StepTypeContent {
  title: string;
  description: string;
  tips: string[];
}

export const stepTypeContent: Record<StepType, StepTypeContent> = {
  form: {
    title: "About Form Completion",
    description: "This step involves filling out legal forms or applications required for your case.",
    tips: [
      "Read all instructions carefully before starting",
      "Gather all required documents and information beforehand",
      "Double-check your answers for accuracy before submitting"
    ]
  },
  document: {
    title: "About Document Creation",
    description: "This step involves creating or reviewing legal documents related to your case.",
    tips: [
      "Use clear, professional language in all documents",
      "Include all relevant facts and supporting evidence",
      "Review documents for completeness before filing"
    ]
  },
  review: {
    title: "About Review and Preparation",
    description: "This step involves reviewing information and preparing materials before taking action.",
    tips: [
      "Take time to understand all requirements and deadlines",
      "Organize your documents and evidence systematically",
      "Consider seeking legal advice if you have questions"
    ]
  },
  submit: {
    title: "About Filing and Submission",
    description: "This step involves filing or submitting documents to the court or relevant authority.",
    tips: [
      "Make copies of everything you submit for your records",
      "Follow all filing requirements and deadlines exactly",
      "Keep proof of submission (receipts, confirmation numbers)"
    ]
  },
  wait: {
    title: "About Waiting Periods",
    description: "This step involves waiting for a response, processing, or the next scheduled event.",
    tips: [
      "Use this time to prepare for the next steps in your case",
      "Keep track of important dates and deadlines",
      "Contact the court if you haven't received expected responses"
    ]
  },
  meeting: {
    title: "About Court Hearings and Meetings",
    description: "This step involves attending court hearings, mediations, or other formal meetings.",
    tips: [
      "Arrive early and dress professionally",
      "Bring all required documents and evidence",
      "Be prepared to answer questions about your case"
    ]
  },
  communication: {
    title: "About Communication",
    description: "This step involves correspondence with other parties, the court, or legal representatives.",
    tips: [
      "Keep all communications professional and factual",
      "Document all important conversations and correspondence",
      "Respond promptly to requests for information"
    ]
  }
};

export function getStepTypeContent(stepType?: StepType): StepTypeContent | null {
  if (!stepType) return null;
  return stepTypeContent[stepType] || null;
}
