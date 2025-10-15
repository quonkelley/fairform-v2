/**
 * Case Creation Intent Detection
 *
 * Analyzes conversation state to determine if sufficient information
 * has been gathered to offer case creation to the user.
 *
 * @module lib/ai/intentDetection
 */

/**
 * Assessment of whether a conversation contains enough information
 * to create a case
 */
export interface CaseCreationReadiness {
  /** Readiness score from 0-100, where 80+ indicates ready to offer case creation */
  score: number;
  /** True if score >= 80 and no required details are missing */
  isReady: boolean;
  /** Detected case type (e.g., 'eviction', 'small_claims') */
  caseType?: string;
  /** Array of required fields that are still missing */
  missingDetails: string[];
  /** Array of fields that have been successfully collected */
  presentDetails: string[];
  /** Array of quality concerns (e.g., "location too vague") */
  qualityIssues: string[];
  /** Timestamp when this assessment was made */
  lastChecked: number;
}

/**
 * Requirements definition for a specific case type
 */
export interface CaseTypeRequirements {
  /** Case type identifier */
  caseType: string;
  /** Required detail field names */
  required: string[];
  /** Optional but helpful field names */
  optional: string[];
  /** Minimum number of conversation messages needed */
  minimumContext: number;
  /** Functions to validate detail quality */
  qualityChecks: {
    [field: string]: (value: string) => boolean;
  };
}

/**
 * Conversation state structure (matches demo endpoint)
 */
export interface ConversationState {
  stage: 'greeting' | 'intake' | 'details' | 'guidance' | 'awaiting_confirmation' | 'case_creation' | 'case_created';
  caseType?: string;
  context: string[];
  details: {
    location?: string;
    noticeType?: string;
    dateReceived?: string;
    [key: string]: string | undefined;
  };
  readiness?: CaseCreationReadiness;
  confirmationShown?: boolean;
  confirmed?: boolean;
  lastConfirmationTime?: number;
}

/**
 * Analyze conversation state to determine if enough information exists to create a case
 *
 * @param state Current conversation state
 * @returns Readiness assessment with score and details
 */
export function analyzeConversationState(
  state: ConversationState
): CaseCreationReadiness {
  // Check basic requirement: must have a case type
  if (!state.caseType) {
    return {
      score: 0,
      isReady: false,
      missingDetails: ['caseType'],
      presentDetails: [],
      qualityIssues: [],
      lastChecked: Date.now()
    };
  }

  // Get requirements for this case type
  const requirements = getCaseTypeRequirements(state.caseType);

  // Check required details
  const presentDetails: string[] = [];
  const missingDetails: string[] = [];
  const qualityIssues: string[] = [];

  for (const field of requirements.required) {
    const value = state.details[field];
    if (!value) {
      missingDetails.push(field);
    } else {
      // Check quality
      const qualityCheck = requirements.qualityChecks[field];
      if (qualityCheck && !qualityCheck(value)) {
        qualityIssues.push(`${field} needs more detail`);
      } else {
        presentDetails.push(field);
      }
    }
  }

  // Check optional details for bonus points
  for (const field of requirements.optional) {
    if (state.details[field]) {
      presentDetails.push(field);
    }
  }

  // Check conversation context length
  const contextMeetsMinimum = state.context.length >= requirements.minimumContext;

  // Calculate readiness score
  const requiredScore = (presentDetails.filter(d => requirements.required.includes(d)).length / requirements.required.length) * 70;
  const optionalScore = (presentDetails.filter(d => requirements.optional.includes(d)).length / Math.max(requirements.optional.length, 1)) * 20;
  const contextScore = contextMeetsMinimum ? 10 : 0;
  const qualityPenalty = qualityIssues.length * 10;

  const score = Math.max(0, Math.min(100, requiredScore + optionalScore + contextScore - qualityPenalty));

  return {
    score,
    isReady: score >= 80 && missingDetails.length === 0,
    caseType: state.caseType,
    missingDetails,
    presentDetails,
    qualityIssues,
    lastChecked: Date.now()
  };
}

/**
 * Get requirements for a specific case type
 *
 * @param caseType The case type to get requirements for
 * @returns Requirements definition for the case type
 */
export function getCaseTypeRequirements(caseType: string): CaseTypeRequirements {
  switch (caseType) {
    case 'eviction':
      return {
        caseType: 'eviction',
        required: ['location', 'noticeType'], // Need both for good guidance
        optional: ['dateReceived'], // Helpful but not required
        minimumContext: 3, // At least greeting, case type, and details
        qualityChecks: {
          location: (val) => val.length > 5 && val.includes(','), // "City, State" format
          noticeType: (val) => val.includes('day') || val.includes('notice'),
          dateReceived: (val) => val.length > 3 // More than just "yes"
        }
      };

    case 'small_claims':
      return {
        caseType: 'small_claims',
        required: ['location'], // Need location for court jurisdiction
        optional: ['disputeDescription', 'amountInvolved'],
        minimumContext: 3,
        qualityChecks: {
          location: (val) => val.length > 5,
          disputeDescription: (val) => val.length > 10,
          amountInvolved: (val) => /\d+/.test(val) // Contains a number
        }
      };

    default:
      // Generic fallback for unknown case types
      return {
        caseType,
        required: ['location'],
        optional: [],
        minimumContext: 2,
        qualityChecks: {}
      };
  }
}

/**
 * Determine if conversation state has changed enough to warrant rechecking readiness
 *
 * This prevents unnecessary recalculations and implements a cooldown period.
 *
 * @param lastReadiness Previous readiness assessment (null if never checked)
 * @param currentState Current conversation state
 * @returns True if readiness should be rechecked
 */
export function shouldRecheckReadiness(
  lastReadiness: CaseCreationReadiness | null,
  currentState: ConversationState
): boolean {
  // Always check if never checked before
  if (!lastReadiness) return true;

  // Check if enough time has passed (5 seconds cooldown)
  const timeSinceLastCheck = Date.now() - lastReadiness.lastChecked;
  if (timeSinceLastCheck < 5000) return false;

  // Check if new details have been added
  const currentDetailCount = Object.keys(currentState.details).filter(k => currentState.details[k]).length;
  const previousDetailCount = lastReadiness.presentDetails.length;

  return currentDetailCount > previousDetailCount;
}

/**
 * Helper function to format readiness for logging
 *
 * @param readiness Readiness assessment
 * @returns Formatted string for console logging
 */
export function formatReadinessLog(readiness: CaseCreationReadiness): string {
  return `Score: ${readiness.score}/100 | Ready: ${readiness.isReady} | Missing: [${readiness.missingDetails.join(', ')}] | Present: [${readiness.presentDetails.join(', ')}]${readiness.qualityIssues.length > 0 ? ` | Quality Issues: [${readiness.qualityIssues.join(', ')}]` : ''}`;
}
