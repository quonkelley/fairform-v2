/**
 * Follow-Up Question Generator for AI Copilot
 * Story 13.29: Smart Follow-Up Questions
 *
 * Generates prioritized follow-up questions based on collected case information.
 * Ensures questions are conversational, include reasoning, and never repeat.
 */

import type { MinimumCaseInfo } from './types';

/**
 * Follow-up question structure
 */
export interface FollowUpQuestion {
  question: string; // The question to ask
  reason: string; // Why this information is needed
  key: string; // Unique identifier for tracking
  priority: number; // 1 (highest) - 5 (lowest)
}

/**
 * Question templates by case type
 */
const CASE_TYPE_QUESTIONS: Record<string, FollowUpQuestion[]> = {
  eviction: [
    {
      question: "Do you have a court hearing date listed on your notice? If so, when is it?",
      reason: "The hearing date determines how much time we have to help you prepare.",
      key: 'hearingDate',
      priority: 1,
    },
    {
      question: "Is there a case number on your eviction notice? It usually starts with letters and numbers.",
      reason: "The case number helps us track your specific case in the court system.",
      key: 'caseNumber',
      priority: 2,
    },
    {
      question: "How much rent does your landlord claim you owe, if any?",
      reason: "The amount determines what defenses and options you may have available.",
      key: 'amount',
      priority: 3,
    },
    {
      question: "Did your landlord give you a written notice before filing the eviction?",
      reason: "Proper notice is required by law, and missing notice could be a defense.",
      key: 'priorNotice',
      priority: 4,
    },
  ],
  small_claims: [
    {
      question: "What is the amount involved in your small claims matter?",
      reason: "The amount determines if your case qualifies for small claims court.",
      key: 'amount',
      priority: 1,
    },
    {
      question: "Is there a case number listed on any court documents you've received?",
      reason: "The case number helps us track your case and access court information.",
      key: 'caseNumber',
      priority: 2,
    },
    {
      question: "Do you have a court hearing date scheduled?",
      reason: "The hearing date tells us how much time you have to prepare.",
      key: 'hearingDate',
      priority: 3,
    },
    {
      question: "Are you the plaintiff (the person filing) or the defendant (the person being sued)?",
      reason: "Your role determines what steps you need to take next.",
      key: 'partyRole',
      priority: 4,
    },
  ],
  family_law: [
    {
      question: "Is there a case number on any court documents you've received?",
      reason: "The case number helps us access your case information and court records.",
      key: 'caseNumber',
      priority: 1,
    },
    {
      question: "Do you have any upcoming court dates?",
      reason: "Knowing your court date helps us prioritize what you need to prepare.",
      key: 'hearingDate',
      priority: 2,
    },
    {
      question: "Does your case involve children?",
      reason: "Cases with children have additional requirements and considerations.",
      key: 'hasChildren',
      priority: 3,
    },
  ],
  debt: [
    {
      question: "What is the total amount being claimed by the creditor?",
      reason: "The amount affects what defenses and options you may have.",
      key: 'amount',
      priority: 1,
    },
    {
      question: "Have you been served with court papers, or are you just receiving collection calls?",
      reason: "This tells us if you're facing a lawsuit or just debt collection.",
      key: 'legalAction',
      priority: 2,
    },
    {
      question: "Is there a case number on any court documents?",
      reason: "The case number helps us access your case in the court system.",
      key: 'caseNumber',
      priority: 3,
    },
  ],
  employment: [
    {
      question: "Did you file a complaint with a government agency like the EEOC or state labor board?",
      reason: "Filing with an agency first is often required before going to court.",
      key: 'agencyComplaint',
      priority: 1,
    },
    {
      question: "Is there a case number on any documents you've received?",
      reason: "The case number helps us track your case.",
      key: 'caseNumber',
      priority: 2,
    },
    {
      question: "Do you have any court dates scheduled?",
      reason: "Court dates help us prioritize your next steps.",
      key: 'hearingDate',
      priority: 3,
    },
  ],
  housing: [
    {
      question: "Are you currently facing eviction, or is this about housing conditions or another issue?",
      reason: "This helps us understand what type of housing case you have.",
      key: 'housingIssueType',
      priority: 1,
    },
    {
      question: "Is there a case number on any court documents?",
      reason: "The case number helps us track your case in the court system.",
      key: 'caseNumber',
      priority: 2,
    },
    {
      question: "Do you have any upcoming court dates?",
      reason: "Court dates help us understand how urgent your situation is.",
      key: 'hearingDate',
      priority: 3,
    },
  ],
};

/**
 * Universal questions that apply after case type and jurisdiction
 */
const UNIVERSAL_QUESTIONS: FollowUpQuestion[] = [
  {
    question: "What city or county is your case in? This helps me understand which court has jurisdiction.",
    reason: "Location determines which court handles your case and what local rules apply.",
    key: 'jurisdiction',
    priority: 1,
  },
];

/**
 * Get the next follow-up question based on collected information
 *
 * @param collectedInfo - Case information collected so far
 * @param askedQuestions - Set of question keys already asked
 * @returns Next question to ask, or null if no more questions needed
 */
export function getNextQuestion(
  collectedInfo: Partial<MinimumCaseInfo>,
  askedQuestions: Set<string>
): FollowUpQuestion | null {
  // Priority 1: Ask for jurisdiction if case type is known but jurisdiction is missing
  if (collectedInfo.caseType && !collectedInfo.jurisdiction && !askedQuestions.has('jurisdiction')) {
    return UNIVERSAL_QUESTIONS[0];
  }

  // Priority 2: Ask case-type-specific questions
  if (collectedInfo.caseType) {
    const caseTypeQuestions = CASE_TYPE_QUESTIONS[collectedInfo.caseType] || [];

    // Filter out already-asked questions and questions for already-collected info
    const availableQuestions = caseTypeQuestions.filter((q) => {
      // Skip if already asked
      if (askedQuestions.has(q.key)) {
        return false;
      }

      // Skip if info already collected
      if (q.key === 'caseNumber' && collectedInfo.caseNumber) {
        return false;
      }
      if (q.key === 'hearingDate' && collectedInfo.hearingDate) {
        return false;
      }

      // Otherwise, this question is available
      return true;
    });

    // Return highest priority available question
    if (availableQuestions.length > 0) {
      availableQuestions.sort((a, b) => a.priority - b.priority);
      return availableQuestions[0];
    }
  }

  // No more follow-ups needed
  return null;
}

/**
 * Get all possible follow-up questions for a case type
 * Useful for testing and documentation
 *
 * @param caseType - The case type to get questions for
 * @returns Array of all follow-up questions for the case type
 */
export function getAllQuestionsForCaseType(caseType: string): FollowUpQuestion[] {
  return CASE_TYPE_QUESTIONS[caseType] || [];
}

/**
 * Check if minimum information is collected
 * Used to determine if we should stop asking questions
 *
 * @param collectedInfo - Case information collected so far
 * @returns True if minimum info is present
 */
export function hasMinimumInfo(collectedInfo: Partial<MinimumCaseInfo>): boolean {
  return !!(
    collectedInfo.caseType &&
    collectedInfo.jurisdiction &&
    (collectedInfo.caseNumber || collectedInfo.hearingDate)
  );
}
