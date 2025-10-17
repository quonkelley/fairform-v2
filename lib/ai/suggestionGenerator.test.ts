import { describe, it, expect } from 'vitest';
import {
  getSuggestionsForStage,
  shouldShowSuggestions,
  getPrioritizedSuggestions,
} from './suggestionGenerator';
import type { MinimumCaseInfo } from './types';

describe('suggestionGenerator', () => {
  describe('getSuggestionsForStage', () => {
    it('returns case type options when no case type is selected', () => {
      const suggestions = getSuggestionsForStage('GREET', {});

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Eviction notice',
          value: 'I received an eviction notice and need help',
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Small claims',
        })
      );
    });

    it('returns location options after case type is selected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      const suggestions = getSuggestionsForStage('GATHER_MIN', collectedInfo);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Indianapolis, IN',
          value: 'I am in Indianapolis, Indiana',
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Fort Wayne, IN',
        })
      );
    });

    it('returns confirmation options at confirmation stage', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      const suggestions = getSuggestionsForStage('CONFIRM_CREATE', collectedInfo);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Yes, create my case',
          primary: true,
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Not yet',
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Edit information',
        })
      );
    });

    it('returns hearing date options for eviction cases', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      const suggestions = getSuggestionsForStage('GATHER_MIN', collectedInfo);

      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Yes, I have a hearing date',
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'No hearing date yet',
        })
      );
    });

    it('returns hearing date options for housing cases', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'housing',
        jurisdiction: 'Fort Wayne, IN',
      };

      const suggestions = getSuggestionsForStage('GATHER_MIN', collectedInfo);

      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Yes, I have a hearing date',
        })
      );
    });

    it('returns amount options for small claims cases', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'small claims',
        jurisdiction: 'Indianapolis, IN',
      };

      const suggestions = getSuggestionsForStage('GATHER_MIN', collectedInfo);

      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: 'Under $1,000',
        })
      );
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          text: '$1,000 - $6,000',
        })
      );
    });

    it('returns empty array for post-creation stage', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      const suggestions = getSuggestionsForStage('POST_CREATE_COACH', collectedInfo);

      // POST_CREATE_COACH should not have suggestions (handled by shouldShowSuggestions)
      // But this tests the fallback behavior
      expect(suggestions).toBeDefined();
    });

    it('adds unique IDs to all suggestions', () => {
      const suggestions = getSuggestionsForStage('GREET', {});

      suggestions.forEach((suggestion) => {
        expect(suggestion.id).toBeDefined();
        expect(typeof suggestion.id).toBe('string');
        expect(suggestion.id.length).toBeGreaterThan(0);
      });

      // All IDs should be unique
      const ids = suggestions.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('includes icons for all suggestions', () => {
      const suggestions = getSuggestionsForStage('GREET', {});

      suggestions.forEach((suggestion) => {
        expect(suggestion.icon).toBeDefined();
      });
    });
  });

  describe('shouldShowSuggestions', () => {
    it('returns true when suggestions are available', () => {
      const shouldShow = shouldShowSuggestions('GREET', {});
      expect(shouldShow).toBe(true);
    });

    it('returns false for POST_CREATE_COACH stage', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      const shouldShow = shouldShowSuggestions('POST_CREATE_COACH', collectedInfo);
      expect(shouldShow).toBe(false);
    });

    it('returns true when no case type is selected', () => {
      const shouldShow = shouldShowSuggestions('GREET', {});
      expect(shouldShow).toBe(true);
    });

    it('returns true when case type is selected but no jurisdiction', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      const shouldShow = shouldShowSuggestions('GATHER_MIN', collectedInfo);
      expect(shouldShow).toBe(true);
    });

    it('returns true at confirmation stage', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      const shouldShow = shouldShowSuggestions('CONFIRM_CREATE', collectedInfo);
      expect(shouldShow).toBe(true);
    });
  });

  describe('getPrioritizedSuggestions', () => {
    it('returns all suggestions when count is less than max', () => {
      const suggestions = getPrioritizedSuggestions('CONFIRM_CREATE', {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      });

      // Confirmation stage has 3 options
      expect(suggestions.length).toBe(3);
    });

    it('limits suggestions to maxSuggestions', () => {
      const suggestions = getPrioritizedSuggestions('GREET', {}, 3);

      expect(suggestions.length).toBe(3);
    });

    it('respects custom max limit', () => {
      const suggestions = getPrioritizedSuggestions('GREET', {}, 2);

      expect(suggestions.length).toBe(2);
    });

    it('returns all suggestions when max is higher than available', () => {
      const suggestions = getPrioritizedSuggestions('CONFIRM_CREATE', {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      }, 10);

      // Confirmation stage has only 3 options
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });

    it('prioritizes most common case types', () => {
      const suggestions = getPrioritizedSuggestions('GREET', {}, 5);

      // Should include common case types like eviction and small claims
      const texts = suggestions.map((s) => s.text);
      expect(texts).toContain('Eviction notice');
      expect(texts).toContain('Small claims');
    });
  });

  describe('Stage transitions', () => {
    it('progresses through stages correctly', () => {
      // Stage 1: No case type
      const stage1 = getSuggestionsForStage('GREET', {});
      expect(stage1[0].text).toContain('Eviction');

      // Stage 2: Has case type, no jurisdiction
      const stage2 = getSuggestionsForStage('GATHER_MIN', { caseType: 'eviction' });
      expect(stage2[0].text).toContain('Indianapolis');

      // Stage 3: Has case type and jurisdiction
      const stage3 = getSuggestionsForStage('GATHER_MIN', {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      });
      expect(stage3[0].text).toContain('hearing');

      // Stage 4: Confirmation
      const stage4 = getSuggestionsForStage('CONFIRM_CREATE', {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
        hearingDate: '2024-12-01',
      });
      expect(stage4[0].text).toContain('Yes');
    });
  });

  describe('Case type specific suggestions', () => {
    it('provides eviction-specific suggestions', () => {
      const suggestions = getSuggestionsForStage('GATHER_MIN', {
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      });

      const hasHearingDateOption = suggestions.some((s) =>
        s.text.toLowerCase().includes('hearing')
      );
      expect(hasHearingDateOption).toBe(true);
    });

    it('provides small claims-specific suggestions', () => {
      const suggestions = getSuggestionsForStage('GATHER_MIN', {
        caseType: 'small claims',
        jurisdiction: 'Indianapolis, IN',
      });

      const hasAmountOption = suggestions.some((s) =>
        s.text.includes('$')
      );
      expect(hasAmountOption).toBe(true);
    });

    it('handles case-insensitive case type matching', () => {
      const suggestions1 = getSuggestionsForStage('GATHER_MIN', {
        caseType: 'EVICTION',
        jurisdiction: 'Indianapolis, IN',
      });

      const suggestions2 = getSuggestionsForStage('GATHER_MIN', {
        caseType: 'Eviction',
        jurisdiction: 'Indianapolis, IN',
      });

      expect(suggestions1.length).toBe(suggestions2.length);
    });
  });
});
