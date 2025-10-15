/**
 * Context Storage Service
 * 
 * Manages bidirectional context passing between AI Copilot and Intake Form.
 * Uses sessionStorage for privacy-first, client-side storage.
 * 
 * Story: 13.25 - Intelligent Context Passing Between Copilot & Intake
 */

const CONTEXT_KEY = 'fairform_intake_context';
const CONTEXT_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Intake context structure for passing data between Copilot and Form
 */
export interface IntakeContext {
  sessionId?: string;
  timestamp: number;
  source: 'copilot' | 'form';
  caseType?: string;
  jurisdiction?: string;
  problemDescription?: string;
  details?: {
    location?: string;
    noticeType?: string;
    dateReceived?: string;
    [key: string]: string | undefined;
  };
  conversationSummary?: string;
  formData?: {
    title?: string;
    notes?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Save intake context to sessionStorage
 */
export function saveIntakeContext(context: IntakeContext): void {
  try {
    const contextWithTimestamp = {
      ...context,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(contextWithTimestamp));
  } catch (error) {
    console.error('Failed to save intake context:', error);
    // Graceful degradation - don't throw
  }
}

/**
 * Load intake context from sessionStorage
 * Returns null if no context exists or if expired
 */
export function loadIntakeContext(): IntakeContext | null {
  try {
    const stored = sessionStorage.getItem(CONTEXT_KEY);
    if (!stored) return null;

    const context = JSON.parse(stored) as IntakeContext;

    // Check expiration
    const age = Date.now() - context.timestamp;
    if (age > CONTEXT_EXPIRY_MS) {
      clearIntakeContext();
      return null;
    }

    return context;
  } catch (error) {
    console.error('Failed to load intake context:', error);
    return null;
  }
}

/**
 * Clear intake context from sessionStorage
 */
export function clearIntakeContext(): void {
  try {
    sessionStorage.removeItem(CONTEXT_KEY);
  } catch (error) {
    console.error('Failed to clear intake context:', error);
  }
}

/**
 * Check if intake context exists and is valid
 */
export function hasIntakeContext(): boolean {
  const context = loadIntakeContext();
  return context !== null;
}

/**
 * Update existing context (merge with existing data)
 */
export function updateIntakeContext(updates: Partial<IntakeContext>): void {
  const existing = loadIntakeContext();
  if (existing) {
    saveIntakeContext({
      ...existing,
      ...updates,
      timestamp: Date.now(),
    });
  } else {
    // Create new context if none exists
    saveIntakeContext({
      timestamp: Date.now(),
      source: updates.source || 'copilot',
      ...updates,
    });
  }
}

/**
 * Map conversation state to intake context
 */
export function conversationToContext(conversationState: {
  sessionId?: string;
  caseType?: string;
  details?: {
    location?: string;
    noticeType?: string;
    dateReceived?: string;
    [key: string]: string | undefined;
  };
  context?: string[];
}): IntakeContext {
  // Generate problem description from conversation context
  const problemDescription = conversationState.context
    ? conversationState.context.join(' ').substring(0, 500)
    : undefined;

  return {
    sessionId: conversationState.sessionId,
    timestamp: Date.now(),
    source: 'copilot',
    caseType: conversationState.caseType,
    jurisdiction: conversationState.details?.location,
    problemDescription,
    details: conversationState.details,
    conversationSummary: problemDescription,
  };
}

/**
 * Map form data to intake context
 */
export function formDataToContext(formData: {
  title?: string;
  caseType?: string;
  jurisdiction?: string;
  notes?: string;
  [key: string]: string | undefined;
}): IntakeContext {
  return {
    timestamp: Date.now(),
    source: 'form',
    caseType: formData.caseType,
    jurisdiction: formData.jurisdiction,
    problemDescription: formData.notes,
    formData: {
      title: formData.title,
      notes: formData.notes,
    },
  };
}

/**
 * Map intake context to form default values
 */
export function contextToFormDefaults(context: IntakeContext): {
  caseType?: string;
  jurisdiction?: string;
  notes?: string;
  title?: string;
} {
  return {
    caseType: context.caseType,
    jurisdiction: context.jurisdiction,
    notes: context.problemDescription || context.formData?.notes,
    title: context.formData?.title,
  };
}

/**
 * Check if context is from Copilot
 */
export function isFromCopilot(context: IntakeContext | null): boolean {
  return context?.source === 'copilot';
}

/**
 * Check if context is from Form
 */
export function isFromForm(context: IntakeContext | null): boolean {
  return context?.source === 'form';
}

/**
 * Get context age in milliseconds
 */
export function getContextAge(context: IntakeContext): number {
  return Date.now() - context.timestamp;
}

/**
 * Check if context is expired
 */
export function isContextExpired(context: IntakeContext): boolean {
  return getContextAge(context) > CONTEXT_EXPIRY_MS;
}

