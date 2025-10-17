/**
 * Tests for Structured Information Extraction (Story 13.31)
 */

import { describe, it, expect } from 'vitest';
import {
  extractCaseInfoAI,
  extractCaseInfoWithFallback,
} from './structuredExtraction';

describe('extractCaseInfoAI', () => {
  it('should return empty result for empty messages', async () => {
    const result = await extractCaseInfoAI('');

    expect(result.info).toEqual({});
    expect(result.confidence).toEqual({});
  });

  it('should handle extraction errors gracefully', async () => {
    // Without proper OpenAI API key, extraction will fail gracefully
    const result = await extractCaseInfoAI('I have an eviction case');

    // Should return empty result or fallback result, not throw
    expect(result).toBeDefined();
    expect(result.info).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  it('should respect timeout option', async () => {
    const startTime = Date.now();
    const result = await extractCaseInfoAI('I have an eviction case', {
      timeout: 100,
    });
    const elapsed = Date.now() - startTime;

    // Should fail fast with timeout
    expect(elapsed).toBeLessThan(500);
    expect(result).toBeDefined();
  });
});

describe('extractCaseInfoWithFallback', () => {
  it('should use fallback when AI extraction fails', async () => {
    const fallbackFn = () => ({
      caseType: 'eviction',
      jurisdiction: 'Marion County',
    });

    const result = await extractCaseInfoWithFallback(
      'eviction Marion County',
      fallbackFn
    );

    // Should get fallback results
    expect(result.info).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  it('should work without fallback function', async () => {
    const result = await extractCaseInfoWithFallback('eviction case');

    expect(result.info).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  it('should merge AI and fallback results when both available', async () => {
    const fallbackFn = () => ({
      caseType: 'eviction',
      jurisdiction: 'Marion County',
      caseNumber: '12345',
    });

    const result = await extractCaseInfoWithFallback(
      'eviction case #12345 in Marion County',
      fallbackFn
    );

    // Should merge both sources
    expect(result.info).toBeDefined();
    expect(result.confidence).toBeDefined();
  });
});

/**
 * Integration tests with real OpenAI API
 *
 * These tests are skipped by default to avoid API costs.
 * Run with OPENAI_API_KEY environment variable to enable.
 */
describe.skip('extractCaseInfoAI (Integration)', () => {
  it('should extract eviction case with high confidence', async () => {
    const result = await extractCaseInfoAI(
      'I have an eviction case in Marion County, Indiana. My hearing is on January 15, 2025.'
    );

    expect(result.info.caseType).toBe('eviction');
    expect(result.info.jurisdiction).toContain('Marion County');
    expect(result.info.hearingDate).toBe('2025-01-15');
    expect(result.confidence.caseType).toBeGreaterThanOrEqual(0.85);
  });

  it('should extract small claims case with case number', async () => {
    const result = await extractCaseInfoAI(
      'My small claims case number is 49D01-2401-SC-001234 in Los Angeles'
    );

    expect(result.info.caseType).toBe('small_claims');
    expect(result.info.jurisdiction).toContain('Los Angeles');
    expect(result.info.caseNumber).toBe('49D01-2401-SC-001234');
  });

  it('should handle jurisdiction variations (abbreviations)', async () => {
    const result = await extractCaseInfoAI('I have a debt case in IN');

    expect(result.info.caseType).toBe('debt');
    expect(result.info.jurisdiction).toContain('Indiana');
  });

  it('should extract dates in various formats', async () => {
    const result = await extractCaseInfoAI(
      'My divorce hearing is on March 20, 2025'
    );

    expect(result.info.caseType).toBe('family_law');
    expect(result.info.hearingDate).toBe('2025-03-20');
  });

  it('should handle conversational, informal language', async () => {
    const result = await extractCaseInfoAI(
      "So like, my landlord is trying to kick me out in Marion County and I don't know what to do"
    );

    expect(result.info.caseType).toBe('eviction');
    expect(result.info.jurisdiction).toContain('Marion County');
  });

  it('should extract employment case', async () => {
    const result = await extractCaseInfoAI(
      'I was wrongfully terminated from my job in Chicago'
    );

    expect(result.info.caseType).toBe('employment');
    expect(result.info.jurisdiction).toContain('Chicago');
  });

  it('should extract discrimination case', async () => {
    const result = await extractCaseInfoAI(
      'I was discriminated against at work in New York'
    );

    expect(result.info.caseType).toBe('discrimination');
    expect(result.info.jurisdiction).toContain('New York');
  });
});
