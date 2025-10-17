import { AIMessage } from './types';

export type FailureLevel = 'rephrase' | 'alternatives' | 'escalate';

export interface FailureResponse {
  level: FailureLevel;
  message: string;
  options?: Array<{ text: string; action: string }>;
  escalationData?: {
    conversationHistory: AIMessage[];
    context: string;
  };
}

export interface FailureContext {
  userMessage: string;
  conversationHistory: AIMessage[];
  capabilities: string[];
  attemptCount: number;
}

/**
 * Determine the appropriate failure level based on attempt count and error type
 */
export function determineFailureLevel(
  attemptCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _errorType: 'misunderstanding' | 'out_of_scope' | 'technical_error' = 'misunderstanding'
): FailureLevel {
  // _errorType parameter reserved for future use
  // First attempt: try to clarify
  if (attemptCount === 1) return 'rephrase';
  
  // Second attempt: show what we CAN do
  if (attemptCount === 2) return 'alternatives';
  
  // Third attempt or technical error: escalate
  return 'escalate';
}

/**
 * Build a failure response based on the failure level and context
 */
export function buildFailureResponse(
  level: FailureLevel,
  context: FailureContext
): FailureResponse {
  
  switch (level) {
    case 'rephrase':
      return {
        level: 'rephrase',
        message: `Just to clarify, are you asking about "${context.userMessage}"? I want to make sure I understand correctly so I can help you best.`
      };
      
    case 'alternatives':
      return {
        level: 'alternatives',
        message: "I'm not sure how to help with that specific request. Here's what I can assist you with:",
        options: context.capabilities.map(cap => ({
          text: cap,
          action: `help_with_${cap.toLowerCase().replace(/\s+/g, '_')}`
        }))
      };
      
    case 'escalate':
      return {
        level: 'escalate',
        message: "I'd like to connect you with someone from our support team who can better assist you.",
        options: [
          { text: 'Talk to Support →', action: 'escalate_support' },
          { text: 'Try Something Else', action: 'show_alternatives' }
        ],
        escalationData: {
          conversationHistory: context.conversationHistory,
          context: `User needs help with: "${context.userMessage}"`
        }
      };
  }
}

/**
 * Default capabilities that FairForm AI can help with
 */
export const DEFAULT_CAPABILITIES = [
  'Creating a new case',
  'Understanding case steps',
  'Answering legal questions',
  'Finding forms and documents',
  'Tracking case progress',
  'Getting reminders and deadlines'
];

/**
 * Generate system prompt instructions for graceful failure handling
 */
export function getFailureHandlingInstructions(): string {
  return `
When You Cannot Help (Graceful Failure Protocol):
- First attempt: Rephrase your understanding and ask for clarification
  Example: "Just to clarify, are you asking about [X]?"
  
- Second attempt: Acknowledge limitation and show what you CAN do
  Example: "I can't help with [specific request], but I can assist with: [list capabilities]"
  
- Persistent issues: Offer human support escalation
  Example: "This seems like something our support team can better help with. Would you like me to connect you?"

Never say generic "I don't understand" - always provide a path forward.
`;
}
