/**
 * Structured Information Extraction using OpenAI Function Calling
 * Story 13.31: Replace regex patterns with GPT-based extraction for 90%+ accuracy
 */

import OpenAI from 'openai';
import type { MinimumCaseInfo } from './types';

const AI_MODEL = process.env.AI_MODEL ?? 'gpt-4o-mini';

// Lazy initialization to avoid errors in test environments
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

/**
 * Extraction result with confidence scores for each field
 */
export interface ExtractionResult {
  info: Partial<MinimumCaseInfo>;
  confidence: {
    caseType?: number;
    jurisdiction?: number;
    caseNumber?: number;
    hearingDate?: number;
  };
}

/**
 * OpenAI function definition for extracting case information
 * Supports all major case types and handles various date formats
 */
const extractionFunction: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function = {
  name: 'extract_case_info',
  description: 'Extract legal case information from user message',
  parameters: {
    type: 'object',
    properties: {
      caseType: {
        type: 'string',
        enum: [
          'eviction',
          'small_claims',
          'family_law',
          'debt',
          'employment',
          'housing',
          'consumer',
          'contract',
          'discrimination',
          'other',
        ],
        description: 'Type of legal case. Use "other" if case type is unclear or not in the list.',
      },
      jurisdiction: {
        type: 'string',
        description: 'City, county, or state where case is filed (e.g., "Marion County, Indiana", "Los Angeles, CA", "Indiana"). Extract full location with state if mentioned.',
      },
      caseNumber: {
        type: 'string',
        description: 'Court case number if mentioned (e.g., "49D01-2401-SC-001234", "SC-2024-0001"). Only extract if explicitly stated.',
      },
      hearingDate: {
        type: 'string',
        description: 'Court hearing date in ISO format (YYYY-MM-DD) if mentioned. Convert relative dates like "next Friday" or "January 15" to absolute dates if possible.',
      },
      confidence: {
        type: 'object',
        description: 'Confidence scores (0.0-1.0) for each extracted field',
        properties: {
          caseType: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'How confident you are about the case type (0.0-1.0)',
          },
          jurisdiction: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'How confident you are about the jurisdiction (0.0-1.0)',
          },
          caseNumber: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'How confident you are about the case number (0.0-1.0)',
          },
          hearingDate: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'How confident you are about the hearing date (0.0-1.0)',
          },
        },
        required: [],
      },
    },
    required: [],
  },
};

/**
 * Extract case information using OpenAI function calling
 *
 * @param message - User message containing potential case information
 * @param options - Optional configuration (timeout, temperature)
 * @returns Extraction result with case info and confidence scores
 *
 * @example
 * const result = await extractCaseInfoAI("I have an eviction case in Marion County, Indiana. My hearing is on January 15, 2025.");
 * // result.info.caseType === 'eviction'
 * // result.info.jurisdiction === 'Marion County, Indiana'
 * // result.info.hearingDate === '2025-01-15'
 * // result.confidence.caseType === 0.95
 */
export async function extractCaseInfoAI(
  message: string,
  options: {
    timeout?: number;
    temperature?: number;
  } = {}
): Promise<ExtractionResult> {
  const { timeout = 5000, temperature = 0.1 } = options;

  // Return empty result for empty messages
  if (!message || message.trim().length === 0) {
    return {
      info: {},
      confidence: {},
    };
  }

  try {
    const openai = getOpenAI();

    // Call OpenAI with function calling
    const response = await Promise.race([
      openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a precise information extraction system for legal case data. Extract only the information explicitly mentioned or strongly implied in the user's message. Do not guess or infer information that is not present.

When extracting:
- Case Type: Look for keywords like "eviction", "small claims", "divorce", "custody", "debt", "employment", "housing", "landlord", "tenant", "contract", "discrimination", "harassment"
- Jurisdiction: Extract city, county, or state. Normalize to full forms (e.g., "IN" → "Indiana", "LA" → "Los Angeles")
- Case Number: Only extract if explicitly mentioned (e.g., "case #12345", "49D01-2401-SC-001234")
- Hearing Date: Convert to ISO format (YYYY-MM-DD). If relative date like "next Friday", use context to infer actual date if possible.

Assign confidence scores based on:
- 0.9-1.0: Explicitly stated with clear keywords
- 0.7-0.89: Strongly implied or inferred from context
- 0.5-0.69: Weakly implied or ambiguous
- 0.0-0.49: Not present or very uncertain`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        functions: [extractionFunction],
        function_call: { name: 'extract_case_info' },
        temperature,
        max_tokens: 500,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Extraction timeout')), timeout)
      ),
    ]);

    // Parse function call response
    const functionCall = response.choices[0]?.message?.function_call;
    if (!functionCall || !functionCall.arguments) {
      return {
        info: {},
        confidence: {},
      };
    }

    const extracted = JSON.parse(functionCall.arguments);

    // Build result object with extracted fields
    const info: Partial<MinimumCaseInfo> = {};
    if (extracted.caseType) {
      info.caseType = extracted.caseType;
    }
    if (extracted.jurisdiction) {
      info.jurisdiction = extracted.jurisdiction;
    }
    if (extracted.caseNumber) {
      info.caseNumber = extracted.caseNumber;
    }
    if (extracted.hearingDate) {
      info.hearingDate = extracted.hearingDate;
    }

    return {
      info,
      confidence: extracted.confidence || {},
    };
  } catch (error) {
    // Log error but don't throw - graceful degradation
    console.error('Structured extraction failed:', error);

    return {
      info: {},
      confidence: {},
    };
  }
}

/**
 * Extract case information with fallback to regex patterns
 * This provides backward compatibility and resilience
 *
 * @param message - User message containing potential case information
 * @param fallbackFn - Optional fallback extraction function (e.g., regex-based)
 * @returns Extraction result with case info and confidence scores
 */
export async function extractCaseInfoWithFallback(
  message: string,
  fallbackFn?: (msg: string) => Partial<MinimumCaseInfo>
): Promise<ExtractionResult> {
  // Try AI-based extraction first
  const aiResult = await extractCaseInfoAI(message);

  // If AI extraction succeeded and has high confidence, return it
  const hasHighConfidence = Object.values(aiResult.confidence).some(
    (score) => score !== undefined && score >= 0.7
  );

  if (Object.keys(aiResult.info).length > 0 && hasHighConfidence) {
    return aiResult;
  }

  // If AI extraction failed or has low confidence, try fallback
  if (fallbackFn) {
    const fallbackInfo = fallbackFn(message);

    // Merge AI and fallback results (fallback fills in gaps)
    return {
      info: {
        ...fallbackInfo,
        ...aiResult.info, // AI results take precedence
      },
      confidence: {
        ...aiResult.confidence,
        // Assign lower confidence to fallback-extracted fields
        ...(fallbackInfo.caseType && !aiResult.info.caseType
          ? { caseType: 0.5 }
          : {}),
        ...(fallbackInfo.jurisdiction && !aiResult.info.jurisdiction
          ? { jurisdiction: 0.5 }
          : {}),
        ...(fallbackInfo.caseNumber && !aiResult.info.caseNumber
          ? { caseNumber: 0.5 }
          : {}),
        ...(fallbackInfo.hearingDate && !aiResult.info.hearingDate
          ? { hearingDate: 0.5 }
          : {}),
      },
    };
  }

  return aiResult;
}
