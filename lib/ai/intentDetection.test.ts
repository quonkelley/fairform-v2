/**
 * Tests for Case Creation Intent Detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeConversationState,
  getCaseTypeRequirements,
  shouldRecheckReadiness,
  formatReadinessLog,
  type ConversationState,
  type CaseCreationReadiness
} from './intentDetection';

describe('Intent Detection', () => {
  describe('analyzeConversationState', () => {
    it('returns score 0 when no case type is present', () => {
      const state: ConversationState = {
        stage: 'greeting',
        context: ['hello'],
        details: {}
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBe(0);
      expect(readiness.isReady).toBe(false);
      expect(readiness.missingDetails).toContain('caseType');
      expect(readiness.caseType).toBeUndefined();
    });

    it('detects ready state for complete eviction conversation', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi', 'eviction help', 'indianapolis', '30 day notice'],
        details: {
          location: 'Indianapolis, IN Marion County',
          noticeType: '30-day'
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBeGreaterThanOrEqual(80);
      expect(readiness.isReady).toBe(true);
      expect(readiness.missingDetails).toHaveLength(0);
      expect(readiness.caseType).toBe('eviction');
      expect(readiness.presentDetails).toContain('location');
      expect(readiness.presentDetails).toContain('noticeType');
    });

    it('identifies missing details for incomplete eviction conversation', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi', 'eviction'],
        details: {
          location: 'Indianapolis, IN'
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.isReady).toBe(false);
      expect(readiness.missingDetails).toContain('noticeType');
      expect(readiness.presentDetails).toContain('location');
      expect(readiness.score).toBeLessThan(80);
    });

    it('detects quality issues with vague details', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi', 'eviction', 'help'],
        details: {
          location: 'IN',  // Too vague, missing comma
          noticeType: 'yes' // Not actually a notice type
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.qualityIssues.length).toBeGreaterThan(0);
      expect(readiness.score).toBeLessThan(80);
      expect(readiness.isReady).toBe(false);
    });

    it('gives bonus points for optional details', () => {
      const stateWithoutOptional: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi', 'eviction', 'help', 'details'],
        details: {
          location: 'Indianapolis, IN',
          noticeType: '30-day'
        }
      };

      const stateWithOptional: ConversationState = {
        ...stateWithoutOptional,
        details: {
          ...stateWithoutOptional.details,
          dateReceived: 'yesterday'
        }
      };

      const readinessWithout = analyzeConversationState(stateWithoutOptional);
      const readinessWith = analyzeConversationState(stateWithOptional);

      expect(readinessWith.score).toBeGreaterThan(readinessWithout.score);
      expect(readinessWith.presentDetails).toContain('dateReceived');
    });

    it('penalizes insufficient conversation context', () => {
      const stateMinimalContext: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi'], // Only 1 message, needs 3+
        details: {
          location: 'Indianapolis, IN',
          noticeType: '30-day'
        }
      };

      const stateGoodContext: ConversationState = {
        ...stateMinimalContext,
        context: ['hi', 'eviction', 'details', 'more info']
      };

      const readinessMinimal = analyzeConversationState(stateMinimalContext);
      const readinessGood = analyzeConversationState(stateGoodContext);

      expect(readinessGood.score).toBeGreaterThan(readinessMinimal.score);
      expect(readinessMinimal.score).toBeLessThan(80);
    });

    it('handles small claims cases correctly', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'small_claims',
        context: ['hi', 'small claims help', 'my dispute', 'need guidance'],
        details: {
          location: 'Los Angeles, CA'
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBeGreaterThanOrEqual(80);
      expect(readiness.isReady).toBe(true);
      expect(readiness.caseType).toBe('small_claims');
    });

    it('handles unknown case types with fallback requirements', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'unknown_case_type',
        context: ['hi', 'help'],
        details: {
          location: 'Seattle, WA'
        }
      };

      const readiness = analyzeConversationState(state);

      // Should still work with fallback requirements
      expect(readiness.caseType).toBe('unknown_case_type');
      expect(readiness.score).toBeGreaterThan(0);
    });
  });

  describe('getCaseTypeRequirements', () => {
    it('returns eviction requirements with correct fields', () => {
      const reqs = getCaseTypeRequirements('eviction');

      expect(reqs.caseType).toBe('eviction');
      expect(reqs.required).toContain('location');
      expect(reqs.required).toContain('noticeType');
      expect(reqs.optional).toContain('dateReceived');
      expect(reqs.minimumContext).toBe(3);
      expect(typeof reqs.qualityChecks.location).toBe('function');
    });

    it('returns small claims requirements', () => {
      const reqs = getCaseTypeRequirements('small_claims');

      expect(reqs.caseType).toBe('small_claims');
      expect(reqs.required).toContain('location');
      expect(reqs.optional).toContain('disputeDescription');
      expect(reqs.optional).toContain('amountInvolved');
    });

    it('returns fallback requirements for unknown case type', () => {
      const reqs = getCaseTypeRequirements('unknown_type');

      expect(reqs.caseType).toBe('unknown_type');
      expect(reqs.required).toContain('location');
      expect(reqs.minimumContext).toBeGreaterThan(0);
    });

    it('quality checks validate location format for eviction', () => {
      const reqs = getCaseTypeRequirements('eviction');

      expect(reqs.qualityChecks.location('Indianapolis, IN')).toBe(true);
      expect(reqs.qualityChecks.location('IN')).toBe(false); // Too short
      expect(reqs.qualityChecks.location('Indianapolis')).toBe(false); // No comma
    });

    it('quality checks validate notice type', () => {
      const reqs = getCaseTypeRequirements('eviction');

      expect(reqs.qualityChecks.noticeType('30-day notice')).toBe(true);
      expect(reqs.qualityChecks.noticeType('3 day')).toBe(true);
      expect(reqs.qualityChecks.noticeType('yes')).toBe(false);
    });
  });

  describe('shouldRecheckReadiness', () => {
    it('returns true when never checked before', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: [],
        details: {}
      };

      expect(shouldRecheckReadiness(null, state)).toBe(true);
    });

    it('returns false during cooldown period', () => {
      const lastReadiness: CaseCreationReadiness = {
        score: 50,
        isReady: false,
        missingDetails: [],
        presentDetails: [],
        qualityIssues: [],
        lastChecked: Date.now() - 2000 // 2 seconds ago
      };

      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: [],
        details: {}
      };

      expect(shouldRecheckReadiness(lastReadiness, state)).toBe(false);
    });

    it('returns true when new details added after cooldown', () => {
      const lastReadiness: CaseCreationReadiness = {
        score: 50,
        isReady: false,
        missingDetails: ['noticeType'],
        presentDetails: ['location'],
        qualityIssues: [],
        lastChecked: Date.now() - 10000 // 10 seconds ago
      };

      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: [],
        details: { location: 'Indianapolis, IN', noticeType: '30-day' }
      };

      expect(shouldRecheckReadiness(lastReadiness, state)).toBe(true);
    });

    it('returns false when no new details added', () => {
      const lastReadiness: CaseCreationReadiness = {
        score: 50,
        isReady: false,
        missingDetails: ['noticeType'],
        presentDetails: ['location'],
        qualityIssues: [],
        lastChecked: Date.now() - 10000 // 10 seconds ago
      };

      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: [],
        details: { location: 'Indianapolis, IN' } // Same as before
      };

      expect(shouldRecheckReadiness(lastReadiness, state)).toBe(false);
    });
  });

  describe('formatReadinessLog', () => {
    it('formats readiness information for logging', () => {
      const readiness: CaseCreationReadiness = {
        score: 85,
        isReady: true,
        caseType: 'eviction',
        missingDetails: [],
        presentDetails: ['location', 'noticeType'],
        qualityIssues: [],
        lastChecked: Date.now()
      };

      const formatted = formatReadinessLog(readiness);

      expect(formatted).toContain('Score: 85/100');
      expect(formatted).toContain('Ready: true');
      expect(formatted).toContain('location');
      expect(formatted).toContain('noticeType');
    });

    it('includes quality issues in formatted output', () => {
      const readiness: CaseCreationReadiness = {
        score: 60,
        isReady: false,
        caseType: 'eviction',
        missingDetails: ['noticeType'],
        presentDetails: ['location'],
        qualityIssues: ['location needs more detail'],
        lastChecked: Date.now()
      };

      const formatted = formatReadinessLog(readiness);

      expect(formatted).toContain('Quality Issues');
      expect(formatted).toContain('location needs more detail');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty details object', () => {
      const state: ConversationState = {
        stage: 'greeting',
        caseType: 'eviction',
        context: ['hello'],
        details: {}
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBeLessThan(80);
      expect(readiness.isReady).toBe(false);
      expect(readiness.missingDetails.length).toBeGreaterThan(0);
    });

    it('handles partial quality check failures', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi', 'eviction', 'help', 'details'],
        details: {
          location: 'Indianapolis, IN', // Good
          noticeType: 'yes' // Bad quality
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.qualityIssues).toContain('noticeType needs more detail');
      expect(readiness.presentDetails).toContain('location');
      expect(readiness.isReady).toBe(false);
    });

    it('score never exceeds 100', () => {
      const state: ConversationState = {
        stage: 'guidance',
        caseType: 'eviction',
        context: ['msg1', 'msg2', 'msg3', 'msg4', 'msg5', 'msg6', 'msg7', 'msg8'],
        details: {
          location: 'Indianapolis, IN Marion County',
          noticeType: '30-day eviction notice',
          dateReceived: 'last week',
          extraField1: 'extra data',
          extraField2: 'more data'
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBeLessThanOrEqual(100);
      expect(readiness.score).toBeGreaterThan(0);
    });

    it('score never goes below 0', () => {
      const state: ConversationState = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hi'],
        details: {
          location: 'x', // Bad quality
          noticeType: 'y' // Bad quality
        }
      };

      const readiness = analyzeConversationState(state);

      expect(readiness.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('simulates a typical eviction conversation flow', () => {
      // Step 1: Initial greeting
      let state: ConversationState = {
        stage: 'greeting',
        context: ['hello'],
        details: {}
      };
      let readiness = analyzeConversationState(state);
      expect(readiness.score).toBe(0);

      // Step 2: User mentions eviction
      state = {
        stage: 'intake',
        caseType: 'eviction',
        context: ['hello', 'i need help with eviction'],
        details: {}
      };
      readiness = analyzeConversationState(state);
      expect(readiness.score).toBeLessThan(80);
      expect(readiness.isReady).toBe(false);

      // Step 3: User provides location
      state = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hello', 'i need help with eviction', 'i am in indianapolis indiana'],
        details: {
          location: 'Indianapolis, Indiana'
        }
      };
      readiness = analyzeConversationState(state);
      expect(readiness.score).toBeLessThan(80);
      expect(readiness.isReady).toBe(false);

      // Step 4: User provides notice type - NOW READY
      state = {
        stage: 'details',
        caseType: 'eviction',
        context: ['hello', 'i need help with eviction', 'i am in indianapolis indiana', 'i received a 30 day notice'],
        details: {
          location: 'Indianapolis, Indiana',
          noticeType: '30-day'
        }
      };
      readiness = analyzeConversationState(state);
      expect(readiness.score).toBeGreaterThanOrEqual(80);
      expect(readiness.isReady).toBe(true);
      expect(readiness.missingDetails).toHaveLength(0);
    });

    it('simulates a small claims conversation flow', () => {
      // Quick flow - small claims only needs location
      const state: ConversationState = {
        stage: 'details',
        caseType: 'small_claims',
        context: ['hello', 'small claims help', 'los angeles california'],
        details: {
          location: 'Los Angeles, California'
        }
      };

      const readiness = analyzeConversationState(state);
      expect(readiness.isReady).toBe(true);
      expect(readiness.caseType).toBe('small_claims');
    });
  });
});
