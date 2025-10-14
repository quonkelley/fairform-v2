import crypto from 'crypto';
import { getCase } from '@/lib/db/casesRepo';
import { getById } from '@/lib/db/usersRepo';
import { listMessages } from '@/lib/db/aiSessionsRepo';

// Allowlisted fields - only these will be included in context
export const ALLOWLISTED_CASE_FIELDS = [
  'caseType',           // 'eviction', 'small_claims', etc.
  'jurisdiction',       // Court location
  'status',            // 'active', 'completed'
  'currentStepOrder',   // Current step number
  'progressPct',       // Completion percentage
  'createdAt',         // Case creation date
  'updatedAt'          // Last modification
] as const;

export const ALLOWLISTED_USER_FIELDS = [
  'aiParticipation',    // Boolean preference
  'tone',              // 'formal', 'friendly', 'helpful'
  'complexity'         // 'simple', 'detailed'
] as const;

export interface AIPromptContext {
  user: {
    id: string;
    timeZone?: string;
    preferences?: UserPreferences;
  };
  case?: {
    id: string;
    caseType?: string;
    jurisdiction?: string;
    currentStepOrder?: number;
    progressPct?: number;
    status?: string;
  };
  conversation?: {
    summary: string;      // Last 10 messages summary
    messageCount: number;
  };
  glossary?: Array<{
    term: string;
    definition: string;
  }>;
  summary: string;        // Concise narrative from allowlisted fields
  fingerprint: string;    // SHA-256 hash for caching
  tokenEstimate: number;  // Estimated token count
}

export interface UserPreferences {
  aiParticipation?: boolean;
  tone?: 'formal' | 'friendly' | 'helpful';
  complexity?: 'simple' | 'detailed';
}

interface PartialContext {
  case?: {
    caseType?: string;
    jurisdiction?: string;
    currentStepOrder?: number;
  };
  user?: {
    preferences?: UserPreferences;
  };
}

/**
 * Main context builder function
 * Aggregates case, user, and session data into structured AI prompts
 */
export async function buildContext(
  userId: string,
  caseId?: string,
  sessionId?: string
): Promise<AIPromptContext> {
  console.log(`Building context for user: ${userId}, case: ${caseId}, session: ${sessionId}`);
  
  // Fetch user data
  const user = await getById(userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // Build base context
  const context: Partial<AIPromptContext> = {
    user: {
      id: userId,
      timeZone: user.timeZone,
      preferences: filterUserData(user)
    }
  };

  // Add case data if caseId provided
  if (caseId) {
    const caseData = await getCase(caseId);
    if (caseData) {
      context.case = {
        id: caseId,
        ...filterCaseData(caseData)
      };
    }
  }

  // Add conversation summary if sessionId provided
  if (sessionId) {
    const conversationSummary = await summarizeConversation(sessionId);
    if (conversationSummary) {
      context.conversation = conversationSummary;
    }
  }

  // Add glossary terms if case context available
  if (context.case) {
    context.glossary = await extractGlossaryTerms();
  }

  // Generate summary and fingerprint
  context.summary = generateContextSummary(context);
  context.fingerprint = generateContextFingerprint(context as PartialContext);
  context.tokenEstimate = estimateTokenCount(context as AIPromptContext);

  // Optimize context size
  const optimizedContext = optimizeContextSize(context as AIPromptContext);

  console.log(`Context built - fingerprint: ${optimizedContext.fingerprint}, tokens: ${optimizedContext.tokenEstimate}`);
  
  return optimizedContext;
}

/**
 * Filter case data to only include allowlisted fields
 */
export function filterCaseData(caseData: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  
  for (const field of ALLOWLISTED_CASE_FIELDS) {
    if (caseData[field] !== undefined) {
      filtered[field] = caseData[field];
    }
  }
  
  // Log filtered data for debugging (hash only, not raw content)
  const filteredHash = crypto.createHash('sha256')
    .update(JSON.stringify(filtered))
    .digest('hex')
    .substring(0, 8);
  console.log(`Case data filtered - hash: ${filteredHash}`);
  
  return filtered;
}

/**
 * Filter user data to only include allowlisted fields
 */
export function filterUserData(userData: Record<string, unknown>): UserPreferences | undefined {
  const preferences: Partial<UserPreferences> = {};

  if (userData.aiParticipation !== undefined && typeof userData.aiParticipation === 'boolean') {
    preferences.aiParticipation = userData.aiParticipation;
  }

  if (userData.tone !== undefined &&
      (userData.tone === 'formal' || userData.tone === 'friendly' || userData.tone === 'helpful')) {
    preferences.tone = userData.tone;
  }

  if (userData.complexity !== undefined &&
      (userData.complexity === 'simple' || userData.complexity === 'detailed')) {
    preferences.complexity = userData.complexity;
  }

  // Return undefined if no preferences found
  return Object.keys(preferences).length > 0 ? preferences as UserPreferences : undefined;
}


/**
 * Generate SHA-256 fingerprint for context caching
 */
export function generateContextFingerprint(context: PartialContext): string {
  const fingerprintData = {
    caseType: context.case?.caseType,
    jurisdiction: context.case?.jurisdiction,
    currentStepOrder: context.case?.currentStepOrder,
    userPrefs: context.user?.preferences,
    timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute buckets
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(fingerprintData))
    .digest('hex');
}

/**
 * Summarize conversation from last 10 messages
 */
async function summarizeConversation(sessionId: string): Promise<{ summary: string; messageCount: number } | undefined> {
  try {
    const messages = await listMessages(sessionId, { limit: 10 });
    
    if (messages.items.length === 0) {
      return undefined;
    }
    
    const userMessages = messages.items
      .filter((m) => m.author === 'user')
      .map((m) => m.content.substring(0, 50))
      .join(', ');
      
    const summary = userMessages.length > 200 
      ? userMessages.substring(0, 197) + '...'
      : userMessages;
    
    return {
      summary,
      messageCount: messages.items.length
    };
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return undefined;
  }
}

/**
 * Extract relevant glossary terms for case context
 */
async function extractGlossaryTerms(): Promise<Array<{ term: string; definition: string }>> {
  // TODO: Import glossary data from Epic 7 implementation
  // For now, return empty array until glossary system is available
  console.log('Glossary integration pending Epic 7 implementation');
  return [];
}

/**
 * Generate concise summary from context data
 */
function generateContextSummary(context: Partial<AIPromptContext>): string {
  const parts: string[] = [];
  
  if (context.case) {
    parts.push(`Case: ${context.case.caseType || 'Unknown type'}`);
    if (context.case.jurisdiction) {
      parts.push(`Jurisdiction: ${context.case.jurisdiction}`);
    }
    if (context.case.currentStepOrder) {
      parts.push(`Step: ${context.case.currentStepOrder}`);
    }
  }
  
  if (context.user?.preferences?.tone) {
    parts.push(`Tone: ${context.user.preferences.tone}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Basic user context';
}

/**
 * Estimate token count for context
 */
export function estimateTokenCount(context: AIPromptContext): number {
  // Rough estimation: 1 token ≈ 4 characters
  const text = JSON.stringify(context);
  return Math.ceil(text.length / 4);
}

/**
 * Optimize context size to stay under token limits
 */
export function optimizeContextSize(context: AIPromptContext): AIPromptContext {
  const maxTokens = 2000;
  const currentTokens = estimateTokenCount(context);
  
  // Truncate conversation summary if too large
  if (currentTokens > maxTokens && context.conversation) {
    const reduction = currentTokens - maxTokens + 100; // Buffer
    const newSummaryLength = Math.max(50, context.conversation.summary.length - reduction);
    context.conversation.summary = context.conversation.summary.substring(0, newSummaryLength);
    context.tokenEstimate = estimateTokenCount(context);
  }
  
  return context;
}

/**
 * Get demo context for demo mode sessions
 */
export function getDemoContext(): AIPromptContext {
  return {
    user: {
      id: 'demo-user-123',
      timeZone: 'America/Los_Angeles',
      preferences: {
        aiParticipation: true,
        tone: 'friendly',
        complexity: 'simple'
      }
    },
    case: {
      id: 'demo-case-456',
      caseType: 'small_claims',
      jurisdiction: 'Los Angeles County',
      currentStepOrder: 2,
      progressPct: 40,
      status: 'active'
    },
    summary: 'Demo case: Small claims tenant dispute in Los Angeles County',
    fingerprint: 'demo-fingerprint-123',
    tokenEstimate: 150
  };
}
