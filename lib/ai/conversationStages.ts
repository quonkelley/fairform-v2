import type { ConversationStage, MinimumCaseInfo } from './types';

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
 * Extract case information from user message
 * This is a simple implementation - in production you might want to use
 * more sophisticated NLP or structured data extraction
 */
export function extractCaseInfo(message: string): Partial<MinimumCaseInfo> {
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
    if (lowerMessage.includes('yes') || lowerMessage.includes('create') || lowerMessage.includes('continue') || lowerMessage.includes('proceed')) {
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
