/**
 * Suggestion Generator for AI Copilot
 *
 * Generates context-aware quick action suggestions based on conversation stage
 * and collected information during the case creation flow.
 *
 * @see docs/stories/13.28.context-aware-quick-actions.md
 */

import {
  Home,
  Scale,
  Users,
  Briefcase,
  MapPin,
  Check,
  X,
  Edit,
  HelpCircle,
  Calendar,
  FileText,
  Building,
  DollarSign
} from 'lucide-react';
import type { ConversationStage, MinimumCaseInfo } from './types';
import type { SuggestionChip } from '@/components/ai-copilot/SuggestionChips';

/**
 * Case type suggestion chips
 * Shown when no case type is selected yet
 */
const CASE_TYPE_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Eviction notice',
    value: 'I received an eviction notice and need help',
    icon: Home,
  },
  {
    text: 'Small claims',
    value: 'I have a small claims matter',
    icon: Scale,
  },
  {
    text: 'Family law',
    value: 'I need help with a family law issue',
    icon: Users,
  },
  {
    text: 'Employment',
    value: 'I have an employment issue',
    icon: Briefcase,
  },
  {
    text: 'Housing issue',
    value: 'I have a housing issue',
    icon: Building,
  },
  {
    text: 'Debt collection',
    value: 'I have a debt collection issue',
    icon: DollarSign,
  },
  {
    text: 'Other',
    value: 'I have a different type of case',
    icon: HelpCircle,
  },
];

/**
 * Location suggestion chips
 * Shown after case type is identified but before jurisdiction is collected
 * Currently focused on Indiana jurisdictions
 */
const LOCATION_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Indianapolis, IN',
    value: 'I am in Indianapolis, Indiana',
    icon: MapPin,
  },
  {
    text: 'Fort Wayne, IN',
    value: 'I am in Fort Wayne, Indiana',
    icon: MapPin,
  },
  {
    text: 'Evansville, IN',
    value: 'I am in Evansville, Indiana',
    icon: MapPin,
  },
  {
    text: 'South Bend, IN',
    value: 'I am in South Bend, Indiana',
    icon: MapPin,
  },
  {
    text: 'Gary, IN',
    value: 'I am in Gary, Indiana',
    icon: MapPin,
  },
  {
    text: 'Other location',
    value: 'I am in a different location',
    icon: MapPin,
  },
];

/**
 * Confirmation suggestion chips
 * Shown at the confirmation stage when ready to create case
 */
const CONFIRMATION_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Yes, create my case',
    value: 'Yes, create my case',
    icon: Check,
    primary: true,
  },
  {
    text: 'Not yet',
    value: 'Not yet',
    icon: X,
  },
  {
    text: 'Edit information',
    value: 'I need to edit some information',
    icon: Edit,
  },
];

/**
 * Eviction-specific follow-up chips
 * Shown when case type is eviction but hearing date is not collected
 */
const EVICTION_HEARING_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Yes, I have a hearing date',
    value: 'Yes, I have a hearing date',
    icon: Calendar,
  },
  {
    text: 'No hearing date yet',
    value: 'No, I don\'t have a hearing date yet',
    icon: Calendar,
  },
];

/**
 * Small claims follow-up chips
 * Shown when case type is small claims but amount is not collected
 */
const SMALL_CLAIMS_AMOUNT_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Under $1,000',
    value: 'The claim is under $1,000',
    icon: DollarSign,
  },
  {
    text: '$1,000 - $6,000',
    value: 'The claim is between $1,000 and $6,000',
    icon: DollarSign,
  },
  {
    text: 'Over $6,000',
    value: 'The claim is over $6,000',
    icon: DollarSign,
  },
];

/**
 * Case number chips
 * Shown when asking if user has a case number
 */
const CASE_NUMBER_CHIPS: Omit<SuggestionChip, 'id'>[] = [
  {
    text: 'Yes, I have a case number',
    value: 'Yes, I have a case number',
    icon: FileText,
  },
  {
    text: 'No case number yet',
    value: 'No, I don\'t have a case number yet',
    icon: FileText,
  },
];

/**
 * Generates suggestion chips based on conversation stage and collected info
 *
 * @param stage - Current conversation stage
 * @param collectedInfo - Information collected so far
 * @returns Array of suggestion chips with unique IDs
 */
export function getSuggestionsForStage(
  stage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>
): SuggestionChip[] {
  let baseSuggestions: Omit<SuggestionChip, 'id'>[] = [];

  // Priority 1: Confirmation stage
  if (stage === 'CONFIRM_CREATE') {
    baseSuggestions = CONFIRMATION_CHIPS;
  }
  // Priority 2: No case type yet - show case type options
  else if (!collectedInfo.caseType) {
    baseSuggestions = CASE_TYPE_CHIPS;
  }
  // Priority 3: Has case type but no jurisdiction - show location options
  else if (collectedInfo.caseType && !collectedInfo.jurisdiction) {
    baseSuggestions = LOCATION_CHIPS;
  }
  // Priority 4: Has case type and jurisdiction - case-specific follow-ups
  else if (collectedInfo.caseType && collectedInfo.jurisdiction) {
    // Eviction-specific: Ask about hearing date
    if (
      (collectedInfo.caseType.toLowerCase().includes('eviction') ||
       collectedInfo.caseType.toLowerCase().includes('housing')) &&
      !collectedInfo.hearingDate
    ) {
      baseSuggestions = EVICTION_HEARING_CHIPS;
    }
    // Small claims: Ask about amount
    else if (
      collectedInfo.caseType.toLowerCase().includes('small') &&
      !collectedInfo.caseNumber // Use caseNumber as proxy for "amount asked"
    ) {
      baseSuggestions = SMALL_CLAIMS_AMOUNT_CHIPS;
    }
    // Ask about case number if not provided
    else if (!collectedInfo.caseNumber) {
      baseSuggestions = CASE_NUMBER_CHIPS;
    }
  }

  // Add unique IDs to suggestions
  return baseSuggestions.map((suggestion, index) => ({
    ...suggestion,
    id: `suggestion-${stage}-${index}-${Date.now()}`,
  }));
}

/**
 * Determines whether to show suggestions based on conversation stage
 *
 * @param stage - Current conversation stage
 * @param collectedInfo - Information collected so far
 * @returns True if suggestions should be displayed
 */
export function shouldShowSuggestions(
  stage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>
): boolean {
  // Don't show during post-creation coaching stage
  if (stage === 'POST_CREATE_COACH') {
    return false;
  }

  // Show if we have suggestions available
  const suggestions = getSuggestionsForStage(stage, collectedInfo);
  return suggestions.length > 0;
}

/**
 * Gets a limited set of prioritized suggestions
 * Ensures we don't overwhelm users with too many options
 *
 * @param stage - Current conversation stage
 * @param collectedInfo - Information collected so far
 * @param maxSuggestions - Maximum number of suggestions to return (default: 5)
 * @returns Limited array of suggestion chips
 */
export function getPrioritizedSuggestions(
  stage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>,
  maxSuggestions: number = 5
): SuggestionChip[] {
  const allSuggestions = getSuggestionsForStage(stage, collectedInfo);

  // If we have fewer than max, return all
  if (allSuggestions.length <= maxSuggestions) {
    return allSuggestions;
  }

  // For case types, prioritize most common ones
  if (!collectedInfo.caseType) {
    return allSuggestions.slice(0, maxSuggestions);
  }

  // For other stages, return first N suggestions
  return allSuggestions.slice(0, maxSuggestions);
}
