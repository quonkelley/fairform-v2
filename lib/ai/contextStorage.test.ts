/**
 * Tests for Context Storage Service
 * Story: 13.25 - Intelligent Context Passing Between Copilot & Intake
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveIntakeContext,
  loadIntakeContext,
  clearIntakeContext,
  hasIntakeContext,
  updateIntakeContext,
  conversationToContext,
  formDataToContext,
  contextToFormDefaults,
  isFromCopilot,
  isFromForm,
  getContextAge,
  isContextExpired,
  type IntakeContext,
} from './contextStorage';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('contextStorage', () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveIntakeContext', () => {
    it('saves context to sessionStorage', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      saveIntakeContext(context);

      const stored = sessionStorage.getItem('fairform_intake_context');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.caseType).toBe('eviction');
      expect(parsed.source).toBe('copilot');
    });

    it('handles storage errors gracefully', () => {
      const setItemSpy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      // Should not throw
      expect(() => saveIntakeContext(context)).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('loadIntakeContext', () => {
    it('loads context from sessionStorage', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
      };

      saveIntakeContext(context);
      const loaded = loadIntakeContext();

      expect(loaded).toBeTruthy();
      expect(loaded?.caseType).toBe('eviction');
      expect(loaded?.source).toBe('copilot');
    });

    it('returns null if no context exists', () => {
      const loaded = loadIntakeContext();
      expect(loaded).toBeNull();
    });

    it('returns null and clears if context is expired', () => {
      const expiredContext: IntakeContext = {
        timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago
        source: 'copilot',
        caseType: 'eviction',
      };

      sessionStorage.setItem('fairform_intake_context', JSON.stringify(expiredContext));

      const loaded = loadIntakeContext();
      expect(loaded).toBeNull();
      expect(hasIntakeContext()).toBe(false);
    });

    it('handles invalid JSON gracefully', () => {
      sessionStorage.setItem('fairform_intake_context', 'invalid json');

      const loaded = loadIntakeContext();
      expect(loaded).toBeNull();
    });
  });

  describe('clearIntakeContext', () => {
    it('removes context from sessionStorage', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      saveIntakeContext(context);
      expect(hasIntakeContext()).toBe(true);

      clearIntakeContext();
      expect(hasIntakeContext()).toBe(false);
    });
  });

  describe('hasIntakeContext', () => {
    it('returns true when valid context exists', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      saveIntakeContext(context);
      expect(hasIntakeContext()).toBe(true);
    });

    it('returns false when no context exists', () => {
      expect(hasIntakeContext()).toBe(false);
    });

    it('returns false when context is expired', () => {
      const expiredContext: IntakeContext = {
        timestamp: Date.now() - (61 * 60 * 1000),
        source: 'copilot',
      };

      sessionStorage.setItem('fairform_intake_context', JSON.stringify(expiredContext));
      expect(hasIntakeContext()).toBe(false);
    });
  });

  describe('updateIntakeContext', () => {
    it('updates existing context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
        caseType: 'eviction',
      };

      saveIntakeContext(context);
      updateIntakeContext({ jurisdiction: 'Indianapolis, IN' });

      const loaded = loadIntakeContext();
      expect(loaded?.caseType).toBe('eviction');
      expect(loaded?.jurisdiction).toBe('Indianapolis, IN');
    });

    it('creates new context if none exists', () => {
      updateIntakeContext({
        source: 'form',
        caseType: 'small_claims',
      });

      const loaded = loadIntakeContext();
      expect(loaded?.source).toBe('form');
      expect(loaded?.caseType).toBe('small_claims');
    });
  });

  describe('conversationToContext', () => {
    it('maps conversation state to context', () => {
      const conversationState = {
        sessionId: 'session-123',
        caseType: 'eviction',
        details: {
          location: 'Indianapolis, IN',
          noticeType: '30-day',
          dateReceived: 'today',
        },
        context: ['I received an eviction notice', 'It was a 30-day notice'],
      };

      const context = conversationToContext(conversationState);

      expect(context.source).toBe('copilot');
      expect(context.sessionId).toBe('session-123');
      expect(context.caseType).toBe('eviction');
      expect(context.jurisdiction).toBe('Indianapolis, IN');
      expect(context.problemDescription).toContain('eviction notice');
      expect(context.details?.noticeType).toBe('30-day');
    });

    it('handles missing conversation context', () => {
      const conversationState = {
        caseType: 'eviction',
        details: {
          location: 'Indianapolis, IN',
        },
      };

      const context = conversationToContext(conversationState);

      expect(context.source).toBe('copilot');
      expect(context.caseType).toBe('eviction');
      expect(context.problemDescription).toBeUndefined();
    });
  });

  describe('formDataToContext', () => {
    it('maps form data to context', () => {
      const formData = {
        title: 'My Eviction Case',
        caseType: 'eviction',
        jurisdiction: 'Marion County, IN',
        notes: 'Received 30-day notice today',
      };

      const context = formDataToContext(formData);

      expect(context.source).toBe('form');
      expect(context.caseType).toBe('eviction');
      expect(context.jurisdiction).toBe('Marion County, IN');
      expect(context.problemDescription).toBe('Received 30-day notice today');
      expect(context.formData?.title).toBe('My Eviction Case');
    });
  });

  describe('contextToFormDefaults', () => {
    it('maps context to form defaults from Copilot', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
        caseType: 'eviction',
        jurisdiction: 'Indianapolis, IN',
        problemDescription: 'I received a 30-day eviction notice',
      };

      const defaults = contextToFormDefaults(context);

      expect(defaults.caseType).toBe('eviction');
      expect(defaults.jurisdiction).toBe('Indianapolis, IN');
      expect(defaults.notes).toBe('I received a 30-day eviction notice');
    });

    it('maps context to form defaults from Form', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'form',
        caseType: 'small_claims',
        formData: {
          title: 'My Case',
          notes: 'Unpaid invoice',
        },
      };

      const defaults = contextToFormDefaults(context);

      expect(defaults.caseType).toBe('small_claims');
      expect(defaults.title).toBe('My Case');
      expect(defaults.notes).toBe('Unpaid invoice');
    });
  });

  describe('isFromCopilot', () => {
    it('returns true for Copilot context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      expect(isFromCopilot(context)).toBe(true);
    });

    it('returns false for Form context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'form',
      };

      expect(isFromCopilot(context)).toBe(false);
    });

    it('returns false for null context', () => {
      expect(isFromCopilot(null)).toBe(false);
    });
  });

  describe('isFromForm', () => {
    it('returns true for Form context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'form',
      };

      expect(isFromForm(context)).toBe(true);
    });

    it('returns false for Copilot context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      expect(isFromForm(context)).toBe(false);
    });
  });

  describe('getContextAge', () => {
    it('returns age in milliseconds', () => {
      const context: IntakeContext = {
        timestamp: Date.now() - 5000, // 5 seconds ago
        source: 'copilot',
      };

      const age = getContextAge(context);
      expect(age).toBeGreaterThanOrEqual(5000);
      expect(age).toBeLessThan(6000);
    });
  });

  describe('isContextExpired', () => {
    it('returns false for fresh context', () => {
      const context: IntakeContext = {
        timestamp: Date.now(),
        source: 'copilot',
      };

      expect(isContextExpired(context)).toBe(false);
    });

    it('returns true for expired context', () => {
      const context: IntakeContext = {
        timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago
        source: 'copilot',
      };

      expect(isContextExpired(context)).toBe(true);
    });
  });
});

