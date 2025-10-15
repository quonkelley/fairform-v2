export type ConfirmationResponseType =
  | { type: 'confirm' }
  | { type: 'decline' }
  | { type: 'edit'; field: string; newValue: string }
  | { type: 'unclear' };

/**
 * Parse user's response to confirmation message
 */
export function parseConfirmationResponse(
  message: string
): ConfirmationResponseType {
  const lower = message.toLowerCase().trim();

  // Affirmative responses
  const affirmativePatterns = [
    /^yes$/i,
    /^yeah$/i,
    /^yep$/i,
    /^sure$/i,
    /^okay$/i,
    /^ok$/i,
    /create.*case/i,
    /go ahead/i,
    /proceed/i,
    /let's do it/i,
    /let'?s do it/i,
    /sounds good/i,
    /that's correct/i,
    /that'?s correct/i,
    /that looks good/i,
    /looks good/i,
    /perfect/i,
    /confirmed/i
  ];

  if (affirmativePatterns.some(pattern => pattern.test(lower))) {
    return { type: 'confirm' };
  }

  // Negative responses
  const negativePatterns = [
    /^no$/i,
    /^nope$/i,
    /not yet/i,
    /not now/i,
    /wait/i,
    /hold on/i,
    /cancel/i,
    /nevermind/i,
    /never mind/i,
    /let me think/i,
    /i need.*time/i,
    /maybe later/i
  ];

  if (negativePatterns.some(pattern => pattern.test(lower))) {
    return { type: 'decline' };
  }

  // Edit requests
  const editPatterns = [
    { pattern: /(?:change|update|correct|fix).*location.*(?:to|is)\s+(.+)/i, field: 'location' },
    { pattern: /(?:actually|correction)[,:]?\s*(?:my )?location\s+(?:is|should be)\s+(.+)/i, field: 'location' },
    { pattern: /(?:change|update|correct).*notice.*(?:to|is)\s+(.+)/i, field: 'noticeType' },
    { pattern: /(?:received|got).*(?:on|at)\s+(.+)/i, field: 'dateReceived' },
    { pattern: /date.*(?:should be|was|is)\s+(.+)/i, field: 'dateReceived' },
  ];

  for (const { pattern, field } of editPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const newValue = match[1].trim();
      return { type: 'edit', field, newValue };
    }
  }

  // If unclear, return unclear type
  return { type: 'unclear' };
}

/**
 * Generate response to unclear confirmation response
 */
export function generateUnclearResponse(): string {
  return "I'm not sure if you'd like to proceed with creating your case. " +
    "Please let me know:\n\n" +
    "• Say **\"Yes\"** to create your case\n" +
    "• Say **\"No\"** if you need more time\n" +
    "• Or tell me what you'd like to change";
}
