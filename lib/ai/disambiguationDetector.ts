/**
 * Disambiguation Detector for AI Copilot
 * Story 13.29: Smart Follow-Up Questions (Task 5 - Research-Based)
 *
 * Detects ambiguous user inputs and generates clarifying questions.
 * Implements research-based best practice: "Never guess when unclear, always ask."
 *
 * @see docs/stories/13.29.smart-follow-up-questions.md
 */

import type { MinimumCaseInfo } from './types';

/**
 * Case information for disambiguation context
 */
export interface CaseInfo {
  id: string;
  type: string;
  caseNumber?: string;
  title?: string;
}

/**
 * Session context for disambiguation detection
 */
export interface SessionContext {
  activeCases?: CaseInfo[];
  collectedInfo: Partial<MinimumCaseInfo>;
}

/**
 * Ambiguity detection result
 */
export interface AmbiguityResult {
  isAmbiguous: boolean;
  clarifyingQuestion?: string;
  reason?: string;
  type?: 'multiple_cases' | 'vague_date' | 'unclear_pronoun' | 'unclear_amount' | 'unclear_party' | 'vague_location';
}

/**
 * Detect ambiguity in user message
 *
 * Research Principle (Building Legal AI Chatbot, Section 7.2):
 * "When the AI detects ambiguity, its default behavior should be to ask
 * a clarifying question instead of making assumptions."
 *
 * @param userMessage - The user's message to analyze
 * @param sessionContext - Context including active cases and collected info
 * @returns Ambiguity detection result with clarifying question if needed
 */
export function detectAmbiguity(
  userMessage: string,
  sessionContext: SessionContext
): AmbiguityResult {
  const lowerMessage = userMessage.toLowerCase().trim();

  // 1. Detect ambiguous case reference (multiple active cases)
  const caseAmbiguity = detectMultipleCaseAmbiguity(lowerMessage, sessionContext.activeCases);
  if (caseAmbiguity.isAmbiguous) {
    return caseAmbiguity;
  }

  // 2. Detect vague date references
  const dateAmbiguity = detectVagueDateReference(lowerMessage);
  if (dateAmbiguity.isAmbiguous) {
    return dateAmbiguity;
  }

  // 3. Detect vague amount references (check before pronouns to prioritize financial context)
  const amountAmbiguity = detectVagueAmount(lowerMessage);
  if (amountAmbiguity.isAmbiguous) {
    return amountAmbiguity;
  }

  // 4. Detect unclear pronoun references (without context)
  const pronounAmbiguity = detectUnclearPronoun(lowerMessage, sessionContext.collectedInfo);
  if (pronounAmbiguity.isAmbiguous) {
    return pronounAmbiguity;
  }

  // 5. Detect unclear party references
  const partyAmbiguity = detectUnclearParty(lowerMessage, sessionContext.collectedInfo);
  if (partyAmbiguity.isAmbiguous) {
    return partyAmbiguity;
  }

  // 6. Detect vague location references
  const locationAmbiguity = detectVagueLocation(lowerMessage, sessionContext.collectedInfo);
  if (locationAmbiguity.isAmbiguous) {
    return locationAmbiguity;
  }

  // No ambiguity detected
  return { isAmbiguous: false };
}

/**
 * Detect when user references "my case" but has multiple active cases
 */
function detectMultipleCaseAmbiguity(
  lowerMessage: string,
  activeCases?: CaseInfo[]
): AmbiguityResult {
  // Check if message references a case
  const caseReferences = [
    'my case',
    'the case',
    'this case',
    'that case',
    'my lawsuit',
    'my court case',
  ];

  const hasCaseReference = caseReferences.some(ref => lowerMessage.includes(ref));

  if (hasCaseReference && activeCases && activeCases.length > 1) {
    // Generate clarifying question listing all cases
    const caseList = activeCases
      .map((c, i) => {
        const parts = [`(${i + 1}) ${c.type}`];
        if (c.caseNumber) {
          parts.push(`#${c.caseNumber}`);
        } else if (c.title) {
          parts.push(`"${c.title}"`);
        }
        return parts.join(' ');
      })
      .join(', ');

    return {
      isAmbiguous: true,
      type: 'multiple_cases',
      clarifyingQuestion: `I found ${activeCases.length} cases in your account: ${caseList}. Which one are you referring to?`,
      reason: 'Multiple active cases',
    };
  }

  return { isAmbiguous: false };
}

/**
 * Detect vague date references like "soon", "tomorrow", "next week"
 */
function detectVagueDateReference(lowerMessage: string): AmbiguityResult {
  const vagueDateWords = [
    'soon',
    'later',
    'next week',
    'tomorrow',
    'in a few days',
    'in a couple weeks',
    'this week',
    'this month',
    'next month',
  ];

  // Check if message contains vague date words
  const vagueDate = vagueDateWords.find(word => lowerMessage.includes(word));

  if (vagueDate) {
    // Only flag as ambiguous if it seems to be referencing a court date/deadline
    const dateContextWords = [
      'hearing',
      'court',
      'deadline',
      'due',
      'date',
      'file',
      'respond',
      'appear',
    ];

    const hasDateContext = dateContextWords.some(word => lowerMessage.includes(word));

    if (hasDateContext || lowerMessage.length < 50) {
      return {
        isAmbiguous: true,
        type: 'vague_date',
        clarifyingQuestion: `When you say "${vagueDate}", could you provide the specific date? For example, "January 15, 2025" or "1/15/2025".`,
        reason: 'Vague date reference needs clarification',
      };
    }
  }

  return { isAmbiguous: false };
}

/**
 * Detect unclear pronouns without established context
 */
function detectUnclearPronoun(
  lowerMessage: string,
  collectedInfo: Partial<MinimumCaseInfo>
): AmbiguityResult {
  // Only check for unclear pronouns if we don't have case context established
  if (collectedInfo.caseType) {
    return { isAmbiguous: false };
  }

  // Pronouns that might be unclear
  const pronouns = ['he', 'she', 'they', 'them', 'him', 'her', 'his', 'hers', 'their'];

  // Check if message starts with or heavily uses pronouns
  const words = lowerMessage.split(/\s+/);
  const firstWord = words[0];

  if (pronouns.includes(firstWord)) {
    return {
      isAmbiguous: true,
      type: 'unclear_pronoun',
      clarifyingQuestion: `I want to make sure I understand correctly. Who are you referring to?`,
      reason: 'Unclear pronoun reference without context',
    };
  }

  // Check for pronoun-heavy messages without clear antecedent
  const pronounCount = words.filter(word => pronouns.includes(word)).length;
  const hasPronouns = pronounCount > 0;
  const hasProperNouns = /[A-Z][a-z]+/.test(lowerMessage); // Basic proper noun detection

  if (hasPronouns && !hasProperNouns && words.length < 15) {
    return {
      isAmbiguous: true,
      type: 'unclear_pronoun',
      clarifyingQuestion: `Could you clarify who you're talking about? It would help to use specific names or roles (like "my landlord" or "the plaintiff").`,
      reason: 'Pronoun usage without clear reference',
    };
  }

  return { isAmbiguous: false };
}

/**
 * Detect vague amount references like "a lot", "some money"
 */
function detectVagueAmount(lowerMessage: string): AmbiguityResult {
  // Specific vague amount phrases that indicate unclear amounts
  const vagueAmountPhrases = [
    'a lot of money',
    'some money',
    'a bunch of money',
    'tons of money',
    'loads of money',
    'some cash',
  ];

  // Check for vague amounts in money/debt contexts
  const moneyContextWords = ['owe', 'debt', 'claim', 'damages', 'rent', 'pay', 'cost'];

  const hasMoneyContext = moneyContextWords.some(word => lowerMessage.includes(word));
  const hasVagueAmount = vagueAmountPhrases.some(phrase => lowerMessage.includes(phrase));

  if (hasMoneyContext && hasVagueAmount) {
    // Check if there's also a specific dollar amount
    const hasDollarAmount = /\$\d+/.test(lowerMessage) || /\d+\s*dollars?/.test(lowerMessage);

    if (!hasDollarAmount) {
      return {
        isAmbiguous: true,
        type: 'unclear_amount',
        clarifyingQuestion: `Could you provide the specific dollar amount? Even an approximate figure helps (for example, "$1,200" or "around $1,000").`,
        reason: 'Vague amount needs specific figure',
      };
    }
  }

  return { isAmbiguous: false };
}

/**
 * Detect unclear party references (plaintiff/defendant confusion)
 */
function detectUnclearParty(
  lowerMessage: string,
  collectedInfo: Partial<MinimumCaseInfo>
): AmbiguityResult {
  // Only check for party confusion in case types where it matters
  const relevantCaseTypes = ['small_claims', 'debt', 'contract'];

  if (collectedInfo.caseType && relevantCaseTypes.includes(collectedInfo.caseType)) {
    // Look for confusion indicators
    const confusionPhrases = [
      'am i the',
      'who am i',
      'am i considered',
      'which one am i',
    ];

    const hasConfusion = confusionPhrases.some(phrase => lowerMessage.includes(phrase));

    if (hasConfusion && lowerMessage.includes('plaintiff') && lowerMessage.includes('defendant')) {
      return {
        isAmbiguous: true,
        type: 'unclear_party',
        clarifyingQuestion: `Are you the person who filed the case (plaintiff), or are you being sued (defendant)?`,
        reason: 'Unclear party role',
      };
    }
  }

  return { isAmbiguous: false };
}

/**
 * Detect vague location references
 */
function detectVagueLocation(
  lowerMessage: string,
  collectedInfo: Partial<MinimumCaseInfo>
): AmbiguityResult {
  // Only check if jurisdiction isn't already collected
  if (collectedInfo.jurisdiction) {
    return { isAmbiguous: false };
  }

  const vagueLocationPhrases = [
    'here',
    'local',
    'my city',
    'my town',
    'my county',
    'nearby',
    'around here',
  ];

  const courtContextWords = ['court', 'jurisdiction', 'file', 'case', 'hearing'];

  const hasCourtContext = courtContextWords.some(word => lowerMessage.includes(word));
  const hasVagueLocation = vagueLocationPhrases.some(phrase => lowerMessage.includes(phrase));

  if (hasCourtContext && hasVagueLocation) {
    return {
      isAmbiguous: true,
      type: 'vague_location',
      clarifyingQuestion: `Could you specify the city or county where your case is located? For example, "Indianapolis" or "Marion County, Indiana".`,
      reason: 'Vague location needs specific jurisdiction',
    };
  }

  return { isAmbiguous: false };
}
