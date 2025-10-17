import type { ConversationStage, MinimumCaseInfo } from './types';
import { extractCaseInfoWithFallback } from './structuredExtraction';
import { translateText, normalizeForDatabase } from './translation';

// Feature flag for structured extraction rollout
const USE_STRUCTURED_EXTRACTION =
  process.env.USE_STRUCTURED_EXTRACTION !== 'false';

/**
 * Check if minimum case information is available for case creation
 */
export function hasMinimumInfo(info: MinimumCaseInfo): boolean {
  return !!(
    info.caseType &&
    info.jurisdiction &&
    (info.caseNumber || info.hearingDate)
  );
}

/**
 * Extract case information from user message using regex patterns
 * This is the fallback implementation for backward compatibility
 * @deprecated Use extractCaseInfoAI from structuredExtraction.ts instead (Story 13.31)
 */
export function extractCaseInfoRegex(message: string): Partial<MinimumCaseInfo> {
  const lowerMessage = message.toLowerCase();
  const info: Partial<MinimumCaseInfo> = {};

  // Extract case type
  if (lowerMessage.includes('eviction')) {
    info.caseType = 'eviction';
  } else if (lowerMessage.includes('small claims') || lowerMessage.includes('small claims')) {
    info.caseType = 'small_claims';
  } else if (lowerMessage.includes('family') || lowerMessage.includes('divorce') || lowerMessage.includes('custody')) {
    info.caseType = 'family_law';
  } else if (lowerMessage.includes('debt') || lowerMessage.includes('credit')) {
    info.caseType = 'debt';
  } else if (lowerMessage.includes('employment') || lowerMessage.includes('workplace') || lowerMessage.includes('job')) {
    info.caseType = 'employment';
  } else if (lowerMessage.includes('housing') || lowerMessage.includes('tenant') || lowerMessage.includes('landlord')) {
    info.caseType = 'housing';
  } else if (lowerMessage.includes('consumer') || lowerMessage.includes('warranty') || lowerMessage.includes('product')) {
    info.caseType = 'consumer';
  } else if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
    info.caseType = 'contract';
  } else if (lowerMessage.includes('discrimination') || lowerMessage.includes('harassment')) {
    info.caseType = 'discrimination';
  }

  // Extract jurisdiction (simple patterns)
  const jurisdictionPatterns = [
    /in ([a-z\s]+),?\s*(in|indiana|ca|california|tx|texas|ny|new york)/i,
    /(indianapolis|los angeles|new york|houston|chicago|seattle|phoenix|philadelphia)/i,
    /([a-z\s]+)\s+county/i,
    /marion\s+county/i,
    /indiana/i,
  ];

  for (const pattern of jurisdictionPatterns) {
    const match = message.match(pattern);
    if (match) {
      const location = match[0].replace(/^in\s+/i, '').trim();
      info.jurisdiction = location;
      break;
    }
  }

  // Extract case number (simple patterns)
  const caseNumberPatterns = [
    /case\s*(number|#)?\s*([A-Z0-9-]+)/i,
    /([A-Z0-9-]{6,})/i, // General pattern for case-like numbers
  ];

  for (const pattern of caseNumberPatterns) {
    const match = message.match(pattern);
    if (match) {
      const caseNumber = match[2] || match[1];
      if (caseNumber && caseNumber.length >= 6) {
        info.caseNumber = caseNumber;
        break;
      }
    }
  }

  // Extract hearing date
  const datePatterns = [
    /hearing\s*(date|is)?\s*(on\s*)?([a-z0-9\s,]+)/i,
    /court\s*(date|is)?\s*(on\s*)?([a-z0-9\s,]+)/i,
    /([a-z]+\s+\d{1,2},?\s+\d{4})/i, // "January 15, 2024"
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/i, // "1/15/2024"
  ];

  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      const dateStr = match[3] || match[1];
      if (dateStr && dateStr.length > 3) {
        info.hearingDate = dateStr.trim();
        break;
      }
    }
  }

  return info;
}

/**
 * Extract case information from user message
 * Story 13.31: Uses AI-based structured extraction with regex fallback
 * Story 13.35: Added multi-language support
 *
 * @param message - User message containing potential case information
 * @returns Partial case information extracted from message
 */
export async function extractCaseInfo(
  message: string
): Promise<Partial<MinimumCaseInfo>> {
  // First, translate the message to English for consistent extraction
  let englishMessage = message;
  try {
    // Only translate if the message contains non-ASCII characters (likely non-English)
    if (/[^\x00-\x7F]/.test(message)) {
      englishMessage = await translateText(message, 'en');
    }
  } catch (error) {
    console.error('Translation failed, using original message:', error);
    // Continue with original message if translation fails
  }

  // Use structured extraction if feature flag is enabled
  if (USE_STRUCTURED_EXTRACTION) {
    try {
      const result = await extractCaseInfoWithFallback(
        englishMessage,
        extractCaseInfoRegex
      );
      
      // Normalize extracted information for database storage
      const normalizedInfo: Partial<MinimumCaseInfo> = {};
      
      if (result.info.caseType) {
        normalizedInfo.caseType = result.info.caseType;
      }
      
      if (result.info.jurisdiction) {
        normalizedInfo.jurisdiction = await normalizeForDatabase(result.info.jurisdiction, 'text');
      }
      
      if (result.info.caseNumber) {
        normalizedInfo.caseNumber = await normalizeForDatabase(result.info.caseNumber, 'text');
      }
      
      if (result.info.hearingDate) {
        normalizedInfo.hearingDate = await normalizeForDatabase(result.info.hearingDate, 'date');
      }
      
      return normalizedInfo;
    } catch (error) {
      console.error('Structured extraction failed, falling back to regex:', error);
      // Fallback to regex if AI extraction fails completely
      return extractCaseInfoRegex(englishMessage);
    }
  }

  // Use legacy regex extraction if feature flag is disabled
  return extractCaseInfoRegex(englishMessage);
}

/**
 * Build app state context for AI system messages
 */
export function buildAppStateContext(
  stage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>
): string {
  const lines = [
    '[app_state]',
    `stage=${stage}`,
    `has_case_number=${!!collectedInfo.caseNumber}`,
    `has_hearing_date=${!!collectedInfo.hearingDate}`,
    `has_jurisdiction=${!!collectedInfo.jurisdiction}`,
    `has_case_type=${!!collectedInfo.caseType}`,
  ];

  if (collectedInfo.jurisdiction) {
    lines.push(`jurisdiction_guess="${collectedInfo.jurisdiction}"`);
  }
  if (collectedInfo.caseType) {
    lines.push(`case_type=${collectedInfo.caseType}`);
  }
  if (collectedInfo.caseNumber) {
    lines.push(`case_number="${collectedInfo.caseNumber}"`);
  }
  if (collectedInfo.hearingDate) {
    lines.push(`hearing_date="${collectedInfo.hearingDate}"`);
  }

  lines.push(''); // Empty line before user message
  return lines.join('\n');
}

/**
 * Determine next conversation stage based on current state
 */
export function getNextStage(
  currentStage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>,
  userMessage: string
): ConversationStage {
  // If we have minimum info, advance to confirmation
  if (currentStage === 'GATHER_MIN' && hasMinimumInfo(collectedInfo)) {
    return 'CONFIRM_CREATE';
  }

  // If user confirms case creation, advance to post-creation coaching
  if (currentStage === 'CONFIRM_CREATE') {
    const lowerMessage = userMessage.toLowerCase();

    // Expanded confirmation detection to handle more natural language patterns
    const confirmationPatterns = [
      'yes',
      'yeah',
      'yep',
      'sure',
      'ok',
      'okay',
      'alright',
      'create',
      'continue',
      'proceed',
      'go ahead',
      'let\'s do it',
      'sounds good',
      'that works',
      'perfect',
      'great',
      'ready',
      'i\'m ready',
      'please create',
      'create it',
      'create my case',
      'start',
      'begin'
    ];

    // Check if message contains any confirmation pattern
    const hasConfirmation = confirmationPatterns.some(pattern =>
      lowerMessage.includes(pattern)
    );

    // Also check for negative responses to stay in CONFIRM_CREATE
    const negativePatterns = ['no', 'not yet', 'wait', 'don\'t', 'cancel', 'stop'];
    const hasNegation = negativePatterns.some(pattern =>
      lowerMessage.includes(pattern)
    );

    // Only advance if confirmed and not negated
    if (hasConfirmation && !hasNegation) {
      return 'POST_CREATE_COACH';
    }
  }

  // Default: stay in current stage or advance from greet
  if (currentStage === 'GREET') {
    return 'GATHER_MIN';
  }

  return currentStage;
}

/**
 * Convert MinimumCaseInfo to ConversationStateForCase for case creation
 */
export function mapToConversationState(
  collectedInfo: Partial<MinimumCaseInfo>,
  userContext: string[]
): {
  stage: string;
  caseType?: string;
  context: string[];
  details: {
    location?: string;
    hearingDate?: string;
    caseNumber?: string;
  };
  readiness: {
    isReady: boolean;
    score: number;
  };
} {
  return {
    stage: 'ready_for_creation',
    caseType: collectedInfo.caseType,
    context: userContext,
    details: {
      location: collectedInfo.jurisdiction,
      hearingDate: collectedInfo.hearingDate,
      caseNumber: collectedInfo.caseNumber,
    },
    readiness: {
      isReady: hasMinimumInfo(collectedInfo),
      score: Object.values(collectedInfo).filter(Boolean).length / 4,
    }
  };
}
