import type { CreateCaseInput } from '@/lib/validation';
import { createCaseWithJourney } from '@/lib/db/casesRepo';

/**
 * Conversation state interface for case creation
 * This extends the ConversationState from the demo endpoint
 */
export interface ConversationStateForCase {
  stage: string;
  caseType?: string;
  context: string[];
  details: {
    location?: string;
    noticeType?: string;
    dateReceived?: string;
    [key: string]: string | undefined;
  };
  readiness?: {
    isReady: boolean;
    score: number;
    [key: string]: unknown;
  };
  caseId?: string;
}

/**
 * Result interface for case creation operations
 */
export interface CaseCreationResult {
  success: boolean;
  caseId?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * Map conversation state to case creation input
 */
export function mapConversationToCase(
  state: ConversationStateForCase,
  userId: string
): CreateCaseInput & { userId: string } {
  // Generate meaningful case title
  const title = generateCaseTitle(state.caseType, state.details);

  // Extract jurisdiction from location
  const jurisdiction = extractJurisdiction(state.details.location);

  // Create conversation summary for notes
  const notes = generateConversationSummary(state);

  return {
    userId,
    title,
    caseType: state.caseType || 'small_claims',
    jurisdiction,
    notes
  };
}

/**
 * Generate a meaningful case title from case type and details
 */
export function generateCaseTitle(
  caseType?: string,
  details?: Record<string, string | undefined>
): string {
  if (!caseType) {
    return 'New Legal Case';
  }

  // Base title on case type
  let title = '';
  switch (caseType) {
    case 'eviction':
      title = 'Eviction Defense';
      break;
    case 'small_claims':
      title = 'Small Claims Matter';
      break;
    case 'employment':
      title = 'Employment Case';
      break;
    case 'housing':
      title = 'Housing Matter';
      break;
    case 'consumer':
      title = 'Consumer Case';
      break;
    case 'contract':
      title = 'Contract Dispute';
      break;
    case 'discrimination':
      title = 'Discrimination Case';
      break;
    case 'family_law':
      title = 'Family Law Matter';
      break;
    default:
      title = `${caseType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Case`;
  }

  // Add location if available
  if (details?.location) {
    // Extract city/county from full location string
    const locationParts = details.location.split(',');
    const primaryLocation = locationParts[0]?.trim() || details.location;
    title += ` - ${primaryLocation}`;
  }

  return title;
}

/**
 * Extract jurisdiction from location string
 * Examples:
 *   "Indianapolis, IN Marion County" -> "Marion County, IN"
 *   "Fort Wayne, Indiana" -> "Allen County, IN"
 *   "Los Angeles, CA" -> "Los Angeles County, CA"
 */
export function extractJurisdiction(location?: string): string {
  if (!location) {
    return 'Unknown Jurisdiction';
  }

  // Check if county is mentioned
  const countyMatch = location.match(/([A-Za-z\s]+)\s+County/i);
  if (countyMatch) {
    const county = countyMatch[1].trim();
    // Extract state
    const stateMatch = location.match(/\b(IN|Indiana|CA|California|TX|Texas|NY|New York|[A-Z]{2})\b/i);
    const state = stateMatch ? normalizeState(stateMatch[1]) : '';
    return `${county} County${state ? ', ' + state : ''}`;
  }

  // If no county, try to infer from city
  const cityMatch = location.match(/^([A-Za-z\s]+),/);
  if (cityMatch) {
    const city = cityMatch[1].trim();
    const stateMatch = location.match(/,\s*([A-Z]{2}|[A-Za-z\s]+)$/);
    const state = stateMatch ? normalizeState(stateMatch[1]) : '';

    // For well-known cities, we can infer county
    const county = inferCountyFromCity(city);
    if (county) {
      return `${county}${state ? ', ' + state : ''}`;
    }

    return `${city}${state ? ', ' + state : ''}`;
  }

  // Fallback: use location as-is
  return location;
}

/**
 * Normalize state name/abbreviation
 */
function normalizeState(state: string): string {
  const stateMap: Record<string, string> = {
    'indiana': 'IN',
    'california': 'CA',
    'texas': 'TX',
    'new york': 'NY',
    'florida': 'FL',
    'ohio': 'OH',
    'illinois': 'IL',
    'pennsylvania': 'PA',
    'michigan': 'MI',
    'georgia': 'GA',
  };

  const normalized = state.toLowerCase().trim();
  return stateMap[normalized] || state.toUpperCase().substring(0, 2);
}

/**
 * Infer county from well-known cities
 */
function inferCountyFromCity(city: string): string | null {
  const cityCountyMap: Record<string, string> = {
    'indianapolis': 'Marion County',
    'fort wayne': 'Allen County',
    'evansville': 'Vanderburgh County',
    'south bend': 'St. Joseph County',
    'carmel': 'Hamilton County',
    'los angeles': 'Los Angeles County',
    'san francisco': 'San Francisco County',
    'san diego': 'San Diego County',
    'new york': 'New York County',
    'brooklyn': 'Kings County',
    'chicago': 'Cook County',
    'houston': 'Harris County',
    'dallas': 'Dallas County',
    'philadelphia': 'Philadelphia County',
    'miami': 'Miami-Dade County',
  };

  return cityCountyMap[city.toLowerCase()] || null;
}

/**
 * Generate conversation summary for case notes
 */
export function generateConversationSummary(state: ConversationStateForCase): string {
  let summary = `Case created through AI Copilot conversation.\n\n`;

  // Add case type context
  if (state.caseType === 'eviction') {
    summary += `**Eviction Details:**\n`;
    if (state.details.noticeType) {
      summary += `- Notice Type: ${state.details.noticeType.replace(/-/g, ' ')}\n`;
    }
    if (state.details.dateReceived) {
      summary += `- Date Received: ${state.details.dateReceived}\n`;
    }
  } else if (state.caseType === 'small_claims') {
    summary += `**Small Claims Details:**\n`;
  } else if (state.caseType) {
    summary += `**Case Type:** ${state.caseType.replace(/_/g, ' ')}\n\n`;
  }

  // Add location
  if (state.details.location) {
    summary += `- Location: ${state.details.location}\n`;
  }

  // Add any other relevant details
  Object.entries(state.details)
    .filter(([key]) => !['location', 'noticeType', 'dateReceived'].includes(key))
    .filter(([, value]) => value)
    .forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      summary += `- ${capitalizedLabel}: ${value}\n`;
    });

  // Add conversation context (first user message)
  if (state.context.length > 0) {
    summary += `\n**Initial User Concern:**\n`;
    summary += `"${state.context[0]}"\n`;
  }

  return summary;
}

/**
 * Create case from conversation state
 * This function is called from the server-side (API endpoint)
 */
export async function createCaseFromConversation(
  state: ConversationStateForCase,
  userId: string
): Promise<CaseCreationResult> {
  try {
    // Map conversation to case input
    const caseInput = mapConversationToCase(state, userId);

    // Create case directly using the database function
    // This avoids HTTP request issues and is more efficient
    const caseRecord = await createCaseWithJourney(caseInput);

    return {
      success: true,
      caseId: caseRecord.id
    };
  } catch (error) {
    console.error('Case creation error:', error);

    // Determine if error is retryable based on error type
    let retryable = true;
    let errorCode = 'API_ERROR';
    let errorMessage = 'Failed to create case';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        errorCode = 'UNAUTHORIZED';
        retryable = false;
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorCode = 'QUOTA_EXCEEDED';
        retryable = false;
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        errorCode = 'VALIDATION_ERROR';
        retryable = false;
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        retryable
      }
    };
  }
}

/**
 * Generate success message after case creation
 */
export function generateSuccessMessage(
  caseId: string,
  caseTitle: string,
  caseType: string
): string {
  let message = `🎉 **Great news! Your case has been created successfully.**\n\n`;

  message += `I've set up **"${caseTitle}"** for you and generated a personalized journey with step-by-step guidance.\n\n`;

  // Add case-specific encouragement
  if (caseType === 'eviction') {
    message += `Your eviction defense journey includes important deadlines, required documents, and court preparation steps. `;
  } else if (caseType === 'small_claims') {
    message += `Your small claims journey includes filing requirements, evidence preparation, and hearing preparation steps. `;
  } else if (caseType === 'employment') {
    message += `Your employment case journey includes documentation requirements, filing deadlines, and preparation guidance. `;
  } else if (caseType === 'housing') {
    message += `Your housing matter journey includes important steps, required documentation, and resources. `;
  } else {
    message += `Your case journey includes step-by-step guidance to help you move forward. `;
  }

  message += `\n**[View your case →](/cases/${caseId})**\n\n`;

  message += `You can continue this conversation at any time, or start working through your case steps. I'm here to help!`;

  return message;
}

/**
 * Generate error message for failed case creation
 */
export function generateErrorMessage(error: {
  code: string;
  message: string;
  retryable: boolean;
}): string {
  let message = '';

  switch (error.code) {
    case 'UNAUTHORIZED':
      message = `⚠️ **Please sign in to create your case**\n\n`;
      message += `I can help you prepare your case information, but you'll need to be signed in to save it. `;
      message += `Please sign in and then say "create my case" to try again.`;
      break;

    case 'NETWORK_ERROR':
      message = `⚠️ **Connection issue**\n\n`;
      message += `I'm having trouble connecting right now. Please check your internet connection and say "try again" to create your case.`;
      break;

    case 'API_ERROR':
    default:
      if (error.retryable) {
        message = `⚠️ **Temporary issue**\n\n`;
        message += `I'm unable to create your case right now, but this is likely temporary. `;
        message += `Please wait a moment and say "try again" or "create my case" to retry.\n\n`;
        message += `If the problem continues, please contact support.`;
      } else {
        message = `⚠️ **Unable to create case**\n\n`;
        message += `${error.message}\n\n`;
        message += `Please contact support if you need assistance.`;
      }
  }

  return message;
}
