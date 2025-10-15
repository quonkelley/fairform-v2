import { CaseCreationReadiness } from './intentDetection';

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

export interface ConfirmationMessage {
  content: string;
  type: 'confirmation';
  meta: {
    caseType: string;
    details: Record<string, string | undefined>;
    readinessScore: number;
  };
}

/**
 * Generate a conversational confirmation message with case summary
 */
export function generateConfirmationMessage(
  state: ConversationState
): ConfirmationMessage {
  const { caseType, details } = state;
  const readinessScore = state.readiness?.score || 0;

  // Build conversational message
  let content = "Great! I think I have enough information to help you create your case. ";

  // Add case type specific message
  if (caseType === 'eviction') {
    content += "Let me summarize what you've told me about your eviction situation:\n\n";
  } else if (caseType === 'small_claims') {
    content += "Let me summarize the details of your small claims matter:\n\n";
  } else {
    content += "Here's what I've gathered:\n\n";
  }

  // List collected details
  const detailsList: string[] = [];

  if (details.location) {
    detailsList.push(`📍 **Location:** ${details.location}`);
  }

  if (details.noticeType) {
    detailsList.push(`📄 **Notice Type:** ${details.noticeType.replace(/-/g, ' ')}`);
  }

  if (details.dateReceived) {
    detailsList.push(`📅 **Date Received:** ${details.dateReceived}`);
  }

  // Add any other details
  Object.entries(details)
    .filter(([key]) => !['location', 'noticeType', 'dateReceived'].includes(key))
    .filter(([, value]) => value)
    .forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      detailsList.push(`• **${capitalizedLabel}:** ${value}`);
    });

  content += detailsList.join('\n') + '\n\n';

  // Add confirmation request
  content += "**Would you like me to create your case with this information?**\n\n";
  content += "• Say **\"Yes, create my case\"** to proceed\n";
  content += "• Or let me know if you'd like to **change any details** first\n";
  content += "• You can also say **\"Not yet\"** if you need more time";

  return {
    content,
    type: 'confirmation',
    meta: {
      caseType: caseType || 'unknown',
      details,
      readinessScore
    }
  };
}

/**
 * Format details for a specific case type
 */
export function formatDetailsForCaseType(
  caseType: string,
  details: Record<string, string | undefined>
): string[] {
  switch (caseType) {
    case 'eviction':
      return [
        details.location && `Location: ${details.location}`,
        details.noticeType && `Notice Type: ${details.noticeType}`,
        details.dateReceived && `Date Received: ${details.dateReceived}`
      ].filter(Boolean) as string[];

    case 'small_claims':
      return [
        details.location && `Location: ${details.location}`,
        details.disputeDescription && `Dispute: ${details.disputeDescription}`,
        details.amountInvolved && `Amount: ${details.amountInvolved}`
      ].filter(Boolean) as string[];

    default:
      return Object.entries(details)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').trim();
          return `${label}: ${value}`;
        });
  }
}
