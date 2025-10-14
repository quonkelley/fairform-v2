/**
 * TypeScript interfaces for AI Copilot system
 *
 * These types define the data structures for AI sessions, messages,
 * context snapshots, and prompt contexts used throughout Epic 13.
 *
 * @see docs/epic-13-unified-architecture-specification.md
 */

/**
 * Author type for AI messages
 */
export type Author = 'user' | 'assistant' | 'system';

/**
 * Session status lifecycle
 */
export type SessionStatus = 'active' | 'archived' | 'ended';

/**
 * Case types matching the validation schema
 */
export type CaseType =
  | 'eviction'
  | 'small_claims'
  | 'family_law'
  | 'debt'
  | 'employment'
  | 'housing'
  | 'consumer'
  | 'contract'
  | 'discrimination'
  | 'other_civil'
  | 'other';

/**
 * User preferences for AI interaction
 */
export interface UserPreferences {
  aiParticipation?: boolean;
  timeZone?: string;
  tone?: 'formal' | 'friendly' | 'helpful';
  complexity?: 'simple' | 'detailed';
}

/**
 * Context snapshot for efficient context building
 * Stored with each session to enable fast context reconstruction
 */
export interface ContextSnapshot {
  caseType?: CaseType;
  jurisdiction?: string;
  currentStepOrder?: number;
  progressPct?: number;
  userPrefs?: UserPreferences;
  hash: string; // SHA-256 hash for deduplication and caching
}

/**
 * AI Session document
 * Main collection: aiSessions/{sessionId}
 */
export interface AISession {
  id: string;
  userId: string; // Firebase Auth UID (indexed)
  caseId?: string | null; // Optional case association (indexed)
  title: string; // e.g., "Small Claims – Tenant Issue"
  status: SessionStatus;
  createdAt: number; // epoch milliseconds
  updatedAt: number; // epoch milliseconds
  lastMessageAt: number; // epoch milliseconds for lifecycle management
  contextSnapshot: ContextSnapshot;
  demo: boolean; // true for demo sandbox isolation
}

/**
 * AI Message metadata
 * Optional metadata about the message processing
 */
export interface MessageMeta {
  tokensIn?: number; // Input tokens consumed
  tokensOut?: number; // Output tokens generated
  latencyMs?: number; // Processing time in milliseconds
  blocked?: boolean; // Moderation result
  model?: string; // AI model used (e.g., "gpt-4o-mini")
  status?: 'sending' | 'sent' | 'failed'; // Message delivery status
  moderation?: {
    flaggedCategories: string[];
  };
}

/**
 * AI Message document
 * Subcollection: aiSessions/{sessionId}/messages/{messageId}
 */
export interface AIMessage {
  id: string;
  sessionId: string; // Parent session reference
  author: Author;
  content: string; // Plain text, PII-filtered
  meta?: MessageMeta;
  createdAt: number; // epoch milliseconds
}

/**
 * Case context for AI prompt building
 */
export interface CaseContext {
  id: string;
  caseType?: string;
  jurisdiction?: string;
  currentStepOrder?: number;
  progressPct?: number;
}

/**
 * User context for AI prompt building
 */
export interface UserContext {
  id: string;
  timeZone?: string;
}

/**
 * Glossary term for inline definitions
 */
export interface GlossaryTerm {
  term: string;
  definition: string;
}

/**
 * AI Prompt Context
 * Full context structure passed to AI for generating responses
 */
export interface AIPromptContext {
  user?: UserContext;
  case?: CaseContext;
  summary?: string; // Concise narrative from allowlisted fields
  glossaryTerms?: GlossaryTerm[];
  fingerprint?: string; // SHA-256 for caching/ETag
  caseType?: CaseType;
  caseId?: string;
}

/**
 * Input type for creating a new AI session
 */
export interface CreateSessionInput {
  userId: string;
  caseId?: string;
  demo?: boolean;
  title?: string;
}

/**
 * Input type for appending a message to a session
 */
export interface AppendMessageInput {
  author: Author;
  content: string;
  meta?: MessageMeta;
}

/**
 * Pagination options for listing messages
 */
export interface ListMessagesOptions {
  after?: number; // Timestamp to paginate from
  limit?: number; // Number of messages to fetch (default: 20)
}

/**
 * Paginated message list response
 */
export interface PaginatedMessages {
  items: AIMessage[];
  hasMore: boolean;
  nextAfter?: number;
}

/**
 * Moderation result from content filtering
 */
export interface ModerationResult {
  flagged: boolean;
  categories?: Record<string, boolean>;
}
