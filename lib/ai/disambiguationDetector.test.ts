/**
 * Tests for Disambiguation Detector
 * Story 13.29: Smart Follow-Up Questions (Task 5 - Research-Based)
 */

import { describe, it, expect } from 'vitest';
import { detectAmbiguity } from './disambiguationDetector';
import type { SessionContext, CaseInfo } from './disambiguationDetector';

describe('disambiguationDetector', () => {
  describe('Multiple Case Ambiguity', () => {
    it('should detect ambiguity when user says "my case" with multiple active cases', () => {
      const activeCases: CaseInfo[] = [
        { id: '1', type: 'eviction', caseNumber: 'EV-001' },
        { id: '2', type: 'small_claims', caseNumber: 'SC-002' },
      ];

      const context: SessionContext = {
        activeCases,
        collectedInfo: {},
      };

      const result = detectAmbiguity('Tell me about my case', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('multiple_cases');
      expect(result.clarifyingQuestion).toContain('2 cases');
      expect(result.clarifyingQuestion).toContain('eviction');
      expect(result.clarifyingQuestion).toContain('small_claims');
    });

    it('should not detect ambiguity when user has only one active case', () => {
      const activeCases: CaseInfo[] = [
        { id: '1', type: 'eviction', caseNumber: 'EV-001' },
      ];

      const context: SessionContext = {
        activeCases,
        collectedInfo: {},
      };

      const result = detectAmbiguity('Tell me about my case', context);

      expect(result.isAmbiguous).toBe(false);
    });

    it('should handle "the case" references', () => {
      const activeCases: CaseInfo[] = [
        { id: '1', type: 'eviction', caseNumber: 'EV-001' },
        { id: '2', type: 'debt', title: 'Credit Card Dispute' },
      ];

      const context: SessionContext = {
        activeCases,
        collectedInfo: {},
      };

      const result = detectAmbiguity('What is the status of the case?', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('multiple_cases');
    });
  });

  describe('Vague Date References', () => {
    it('should detect "soon" as ambiguous in court context', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('My hearing is soon', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('vague_date');
      expect(result.clarifyingQuestion).toContain('specific date');
    });

    it('should detect "tomorrow" as ambiguous', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('I need to file tomorrow', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('vague_date');
    });

    it('should detect "next week" as ambiguous', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('Court date is next week', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('vague_date');
    });

    it('should provide helpful clarifying questions for vague dates', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('Deadline is later', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.clarifyingQuestion).toContain('specific date');
      expect(result.clarifyingQuestion).toMatch(/January|1\/15|2025/i); // Examples
    });
  });

  describe('Unclear Pronoun References', () => {
    it('should detect unclear "he" without context', () => {
      const context: SessionContext = {
        collectedInfo: {}, // No case type collected yet
      };

      const result = detectAmbiguity('He said I owe money', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('unclear_pronoun');
      expect(result.clarifyingQuestion).toContain('Who');
    });

    it('should detect unclear "they" without context', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('They filed a lawsuit', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('unclear_pronoun');
    });

    it('should not flag pronouns when case type is established (context available)', () => {
      const context: SessionContext = {
        collectedInfo: {
          caseType: 'eviction',
          jurisdiction: 'Marion County',
        },
      };

      const result = detectAmbiguity('He gave me a notice', context);

      // With case type established, we have some context
      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Vague Amount References', () => {
    it('should detect "a lot" as ambiguous in money context', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('I owe a lot of money', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('unclear_amount');
      expect(result.clarifyingQuestion).toContain('specific dollar amount');
    });

    it('should detect "some money" as ambiguous', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('They claim I owe some money', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('unclear_amount');
    });

    it('should not flag when specific dollar amount is provided', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('I owe $1200 in rent', context);

      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Unclear Party References', () => {
    it('should detect confusion about plaintiff/defendant roles', () => {
      const context: SessionContext = {
        collectedInfo: {
          caseType: 'small_claims',
        },
      };

      const result = detectAmbiguity('Am I the plaintiff or defendant?', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('unclear_party');
      expect(result.clarifyingQuestion).toContain('filed the case');
    });

    it('should only check party role for relevant case types', () => {
      const context: SessionContext = {
        collectedInfo: {
          caseType: 'eviction', // Not in relevant case types
        },
      };

      const result = detectAmbiguity('Am I the plaintiff or defendant?', context);

      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Vague Location References', () => {
    it('should detect "here" as ambiguous when jurisdiction not collected', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('I need to file in court here', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('vague_location');
      expect(result.clarifyingQuestion).toContain('city or county');
    });

    it('should detect "my county" as ambiguous', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('The case is in my county', context);

      expect(result.isAmbiguous).toBe(true);
      expect(result.type).toBe('vague_location');
    });

    it('should not flag location if jurisdiction already collected', () => {
      const context: SessionContext = {
        collectedInfo: {
          jurisdiction: 'Marion County',
        },
      };

      const result = detectAmbiguity('The case is here', context);

      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Research-Based Principles (AC 9: Never Guess)', () => {
    it('should always provide clarifying questions when ambiguous', () => {
      const testCases = [
        { message: 'Tell me about my case', activeCases: [{ id: '1', type: 'eviction' }, { id: '2', type: 'debt' }] },
        { message: 'My hearing is soon', activeCases: [] },
        { message: 'He said I owe money', activeCases: [] },
        { message: 'I owe a lot', activeCases: [] },
      ];

      testCases.forEach(({ message, activeCases }) => {
        const context: SessionContext = {
          activeCases: activeCases as CaseInfo[],
          collectedInfo: {},
        };

        const result = detectAmbiguity(message, context);

        if (result.isAmbiguous) {
          expect(result.clarifyingQuestion).toBeTruthy();
          expect(result.clarifyingQuestion!.length).toBeGreaterThan(20);
          expect(result.reason).toBeTruthy();
        }
      });
    });

    it('clarifying questions should be specific and actionable', () => {
      const context: SessionContext = {
        activeCases: [
          { id: '1', type: 'eviction', caseNumber: 'EV-001' },
          { id: '2', type: 'small_claims', caseNumber: 'SC-002' },
        ],
        collectedInfo: {},
      };

      const result = detectAmbiguity('What about my case?', context);

      expect(result.isAmbiguous).toBe(true);
      // Question should include case numbers for specificity
      expect(result.clarifyingQuestion).toContain('EV-001');
      expect(result.clarifyingQuestion).toContain('SC-002');
    });
  });

  describe('No False Positives', () => {
    it('should not flag clear, unambiguous messages', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const clearMessages = [
        'I received an eviction notice today',
        'My case number is EV-2024-001',
        'The hearing is on January 15, 2025',
        'I live in Marion County, Indiana',
        'The landlord claims I owe $1,200',
      ];

      clearMessages.forEach(message => {
        const result = detectAmbiguity(message, context);
        expect(result.isAmbiguous).toBe(false);
      });
    });

    it('should not flag when user provides specific information', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity(
        'My landlord John Smith served me notice on December 1st for $1500 in back rent',
        context
      );

      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const context: SessionContext = {
        collectedInfo: {},
      };

      const result = detectAmbiguity('', context);

      expect(result.isAmbiguous).toBe(false);
    });

    it('should handle undefined activeCases', () => {
      const context: SessionContext = {
        activeCases: undefined,
        collectedInfo: {},
      };

      const result = detectAmbiguity('Tell me about my case', context);

      expect(result.isAmbiguous).toBe(false);
    });

    it('should handle empty activeCases array', () => {
      const context: SessionContext = {
        activeCases: [],
        collectedInfo: {},
      };

      const result = detectAmbiguity('Tell me about my case', context);

      expect(result.isAmbiguous).toBe(false);
    });
  });
});
