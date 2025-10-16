/**
 * Conversation Summarization Service for AI Copilot
 *
 * Implements sliding window approach with AI-powered summarization
 * to keep conversation context within token limits while preserving
 * important information.
 *
 * Story: 13.8 - Conversation Summarization
 */

import { AIMessage } from './types';
import OpenAI from 'openai';

// Configuration constants
const SLIDING_WINDOW_SIZE = 12; // Keep last 12 messages in full detail
const SUMMARIZATION_THRESHOLD_MESSAGES = 50; // Trigger at 50 messages
const SUMMARIZATION_THRESHOLD_TOKENS = 8000; // Trigger at 8000 tokens
const MAX_SUMMARY_TOKENS = 1000; // Limit summary generation

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Conversation summary structure
 */
export interface ConversationSummary {
  topics: string[];
  decisions: Decision[];
  userPreferences: Record<string, unknown>;
  legalGuidance: string[];
  summaryText: string;
  keyOutcomes: string[];
  messageCount: number;
  createdAt: number;
}

/**
 * Decision made during conversation
 */
export interface Decision {
  decision: string;
  context: string;
  timestamp: number;
}

/**
 * Conversation state with sliding window
 */
export interface ConversationState {
  recentMessages: AIMessage[];
  summary: ConversationSummary | null;
  totalTokens: number;
  lastSummarizedAt: number;
}

/**
 * Get sliding window of recent messages
 */
export function getSlidingWindow(messages: AIMessage[]): ConversationState {
  if (messages.length <= SLIDING_WINDOW_SIZE) {
    return {
      recentMessages: messages,
      summary: null,
      totalTokens: estimateTokens(messages),
      lastSummarizedAt: 0,
    };
  }

  const recentMessages = messages.slice(-SLIDING_WINDOW_SIZE);

  return {
    recentMessages,
    summary: null, // Will be populated by summarization
    totalTokens: estimateTokens(recentMessages),
    lastSummarizedAt: 0,
  };
}

/**
 * Check if conversation should be summarized
 */
export function shouldSummarize(
  messageCount: number,
  tokenCount: number,
  lastSummarizedAt: number
): boolean {
  // Always summarize if we exceed thresholds
  if (messageCount > SUMMARIZATION_THRESHOLD_MESSAGES) return true;
  if (tokenCount > SUMMARIZATION_THRESHOLD_TOKENS) return true;

  // Summarize if it's been a while since last summary (24 hours)
  const timeSinceLastSummary = Date.now() - lastSummarizedAt;
  if (lastSummarizedAt > 0 && timeSinceLastSummary > 24 * 60 * 60 * 1000) {
    return true;
  }

  return false;
}

/**
 * Estimate token count from messages
 * Rough estimation: 1 token ≈ 4 characters
 */
export function estimateTokens(messages: AIMessage[]): number {
  const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
  return Math.ceil(totalChars / 4);
}

/**
 * Generate AI-powered conversation summary
 */
export async function summarizeConversation(
  messages: AIMessage[]
): Promise<ConversationSummary> {
  const conversationText = messages
    .map((msg) => `${msg.author}: ${msg.content}`)
    .join('\n');

  const prompt = `You are analyzing a legal assistance conversation to create a concise summary.

Conversation to summarize:
${conversationText}

Please provide a structured summary in JSON format:
{
  "topics": ["topic1", "topic2", ...],
  "decisions": [
    {
      "decision": "description of decision made",
      "context": "why this decision was important",
      "timestamp": ${Date.now()}
    }
  ],
  "userPreferences": {
    "tone": "preferred communication style",
    "complexity": "preferred explanation level",
    "focus": "user's main concerns"
  },
  "legalGuidance": [
    "key legal guidance provided",
    "important legal concepts explained"
  ],
  "summaryText": "concise narrative of the conversation",
  "keyOutcomes": ["what was accomplished", "next steps identified"]
}

Focus on:
- Legal topics and decisions made
- User preferences and communication style
- Important guidance provided
- Case-related outcomes

Keep the summary concise but comprehensive.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a legal assistant conversation analyzer. Create structured summaries of legal assistance conversations in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent structure
      max_tokens: MAX_SUMMARY_TOKENS,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const summaryData = JSON.parse(content);

    return {
      topics: summaryData.topics || [],
      decisions: summaryData.decisions || [],
      userPreferences: summaryData.userPreferences || {},
      legalGuidance: summaryData.legalGuidance || [],
      summaryText: summaryData.summaryText || '',
      keyOutcomes: summaryData.keyOutcomes || [],
      messageCount: messages.length,
      createdAt: Date.now(),
    };
  } catch (error) {
    console.error('[Summarization] Failed:', error);
    throw new Error('Failed to summarize conversation');
  }
}

/**
 * Summarize with fallback strategy
 * Uses simple topic extraction if AI summarization fails
 */
export async function summarizeWithFallback(
  messages: AIMessage[]
): Promise<ConversationSummary> {
  try {
    return await summarizeConversation(messages);
  } catch (error) {
    console.warn('[Summarization] AI failed, using simple fallback:', error);

    // Fallback: Simple topic extraction and truncation
    const topics = extractTopics(messages);
    const summary = `Conversation about ${topics.join(', ')}. ${messages.length} messages discussed various legal topics.`;

    return {
      topics,
      decisions: [],
      userPreferences: {},
      legalGuidance: [],
      summaryText: summary,
      keyOutcomes: [],
      messageCount: messages.length,
      createdAt: Date.now(),
    };
  }
}

/**
 * Extract topics from conversation using keyword matching
 */
export function extractTopics(messages: AIMessage[]): string[] {
  const topicKeywords: Record<string, string[]> = {
    eviction: ['eviction', 'tenant', 'landlord', 'rent', 'lease'],
    small_claims: ['small claims', 'money', 'debt', 'payment', 'contract'],
    family_law: ['divorce', 'custody', 'child support', 'family'],
    employment: ['job', 'work', 'employer', 'wage', 'discrimination'],
    document_help: ['document', 'form', 'filing', 'paperwork'],
    court_process: ['court', 'hearing', 'trial', 'judge', 'procedure'],
  };

  const allText = messages.map((m) => m.content.toLowerCase()).join(' ');
  const foundTopics: string[] = [];

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((keyword) => allText.includes(keyword))) {
      foundTopics.push(topic);
    }
  }

  return foundTopics.length > 0 ? foundTopics : ['general legal assistance'];
}

/**
 * Generate problem description from conversation state
 * Used for context building
 */
export function generateProblemDescription(state: {
  caseType?: string;
  details?: Record<string, string | undefined>;
  context?: string[];
}): string {
  let description = '';

  // Start with case type context
  if (state.caseType === 'eviction') {
    description = 'User is facing an eviction. ';
    if (state.details?.noticeType) {
      description += `Received ${state.details.noticeType.replace(/-/g, ' ')} notice. `;
    }
  } else if (state.caseType === 'small_claims') {
    description = 'User has a small claims matter. ';
  }

  // Add first user message if available
  if (state.context && state.context.length > 0) {
    description += `Original concern: "${state.context[0]}"`;
  }

  return description || 'User seeking legal assistance.';
}
