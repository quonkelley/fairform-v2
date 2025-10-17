/**
 * Tests for Follow-Up Question Generator
 * Story 13.29: Smart Follow-Up Questions
 */

import { describe, it, expect } from 'vitest';
import {
  getNextQuestion,
  getAllQuestionsForCaseType,
  hasMinimumInfo,
} from './followUpGenerator';
import type { MinimumCaseInfo } from './types';

describe('followUpGenerator', () => {
  describe('getNextQuestion', () => {
    it('should ask for jurisdiction after case type is collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).not.toBeNull();
      expect(question?.key).toBe('jurisdiction');
      expect(question?.question).toContain('city or county');
      expect(question?.reason).toContain('Location determines');
    });

    it('should ask eviction-specific questions for eviction cases', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).not.toBeNull();
      expect(question?.key).toBe('hearingDate');
      expect(question?.priority).toBe(1);
      expect(question?.question).toContain('hearing date');
    });

    it('should ask small claims specific questions for small claims cases', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'small_claims',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).not.toBeNull();
      expect(question?.key).toBe('amount');
      expect(question?.question).toContain('amount');
      expect(question?.reason).toContain('qualifies for small claims');
    });

    it('should not ask already-asked questions (duplicate prevention)', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>(['hearingDate', 'caseNumber']);

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).not.toBeNull();
      expect(question?.key).not.toBe('hearingDate');
      expect(question?.key).not.toBe('caseNumber');
      expect(question?.key).toBe('amount'); // Next priority question
    });

    it('should not ask for info already collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        caseNumber: 'EV-2024-001',
        hearingDate: '2024-01-15',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      // Should skip caseNumber and hearingDate since they're already collected
      expect(question).not.toBeNull();
      expect(question?.key).not.toBe('caseNumber');
      expect(question?.key).not.toBe('hearingDate');
    });

    it('should return null when no more questions are needed', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        caseNumber: 'EV-2024-001',
      };
      const askedQuestions = new Set<string>([
        'hearingDate',
        'caseNumber',
        'amount',
        'priorNotice',
      ]);

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).toBeNull();
    });

    it('should prioritize questions by priority level', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>();

      const question1 = getNextQuestion(collectedInfo, askedQuestions);
      expect(question1?.priority).toBe(1); // Highest priority

      askedQuestions.add(question1!.key);
      const question2 = getNextQuestion(collectedInfo, askedQuestions);
      expect(question2?.priority).toBe(2); // Next priority
    });

    it('should handle case types without specific questions', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'other',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      // Should return null for unknown case types
      expect(question).toBeNull();
    });

    it('should include explanations for why info is needed', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'debt',
        jurisdiction: 'Marion County',
      };
      const askedQuestions = new Set<string>();

      const question = getNextQuestion(collectedInfo, askedQuestions);

      expect(question).not.toBeNull();
      expect(question?.reason).toBeTruthy();
      expect(question?.reason.length).toBeGreaterThan(10);
    });
  });

  describe('getAllQuestionsForCaseType', () => {
    it('should return all questions for eviction case type', () => {
      const questions = getAllQuestionsForCaseType('eviction');

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.key === 'hearingDate')).toBe(true);
      expect(questions.some(q => q.key === 'caseNumber')).toBe(true);
    });

    it('should return all questions for small claims case type', () => {
      const questions = getAllQuestionsForCaseType('small_claims');

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.key === 'amount')).toBe(true);
    });

    it('should return empty array for unknown case types', () => {
      const questions = getAllQuestionsForCaseType('unknown_type');

      expect(questions).toEqual([]);
    });
  });

  describe('hasMinimumInfo', () => {
    it('should return true when minimum info is present (case number)', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        caseNumber: 'EV-2024-001',
      };

      expect(hasMinimumInfo(collectedInfo)).toBe(true);
    });

    it('should return true when minimum info is present (hearing date)', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        hearingDate: '2024-01-15',
      };

      expect(hasMinimumInfo(collectedInfo)).toBe(true);
    });

    it('should return false when case type is missing', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        jurisdiction: 'Marion County',
        caseNumber: 'EV-2024-001',
      };

      expect(hasMinimumInfo(collectedInfo)).toBe(false);
    });

    it('should return false when jurisdiction is missing', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        caseNumber: 'EV-2024-001',
      };

      expect(hasMinimumInfo(collectedInfo)).toBe(false);
    });

    it('should return false when both case number and hearing date are missing', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
      };

      expect(hasMinimumInfo(collectedInfo)).toBe(false);
    });
  });

  describe('AC: Questions are conversational and include reasoning', () => {
    it('all questions should be conversational (not robotic)', () => {
      const caseTypes = ['eviction', 'small_claims', 'family_law', 'debt', 'employment', 'housing'];

      caseTypes.forEach(caseType => {
        const questions = getAllQuestionsForCaseType(caseType);
        questions.forEach(q => {
          // Check that questions don't start with robotic phrases
          expect(q.question).not.toMatch(/^Enter/);
          expect(q.question).not.toMatch(/^Provide/);
          expect(q.question).not.toMatch(/^Input/);

          // Check that questions are phrased naturally
          expect(q.question.length).toBeGreaterThan(20);
        });
      });
    });

    it('all questions should include explanations', () => {
      const caseTypes = ['eviction', 'small_claims', 'family_law', 'debt', 'employment', 'housing'];

      caseTypes.forEach(caseType => {
        const questions = getAllQuestionsForCaseType(caseType);
        questions.forEach(q => {
          expect(q.reason).toBeTruthy();
          expect(q.reason.length).toBeGreaterThan(15);
        });
      });
    });
  });

  describe('AC: Works across all supported case types', () => {
    it('should have questions for eviction', () => {
      const questions = getAllQuestionsForCaseType('eviction');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions for small_claims', () => {
      const questions = getAllQuestionsForCaseType('small_claims');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions for family_law', () => {
      const questions = getAllQuestionsForCaseType('family_law');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions for debt', () => {
      const questions = getAllQuestionsForCaseType('debt');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions for employment', () => {
      const questions = getAllQuestionsForCaseType('employment');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions for housing', () => {
      const questions = getAllQuestionsForCaseType('housing');
      expect(questions.length).toBeGreaterThan(0);
    });
  });
});
