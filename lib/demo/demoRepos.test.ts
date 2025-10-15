/**
 * Tests for demo repositories
 * 
 * Verifies that demo repos match production repo interfaces and behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { demoCasesRepo, demoStepsRepo, demoRemindersRepo, resetDemoStorage, getDemoStorageState } from './demoRepos';
import type { CreateCaseStepInput } from '@/lib/validation';

describe('Demo Repositories', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    resetDemoStorage();
  });

  describe('demoCasesRepo', () => {
    it('gets existing demo case by ID', async () => {
      const caseData = await demoCasesRepo.getCase('DEMO-EVICTION-001');
      
      expect(caseData).not.toBeNull();
      expect(caseData?.id).toBe('DEMO-EVICTION-001');
      expect(caseData?.caseType).toBe('eviction');
      expect(caseData?.jurisdiction).toBe('Marion County, IN');
    });

    it('returns null for non-existent case', async () => {
      const caseData = await demoCasesRepo.getCase('NON-EXISTENT');
      expect(caseData).toBeNull();
    });

    it('gets all cases for demo user', async () => {
      const cases = await demoCasesRepo.getUserCases('demo-user');
      
      expect(cases).toHaveLength(1);
      expect(cases[0].userId).toBe('demo-user');
    });

    it('creates a new case', async () => {
      const newCase = await demoCasesRepo.createCase({
        userId: 'demo-user',
        caseType: 'small_claims',
        jurisdiction: 'Allen County, IN',
        title: 'Test Case',
        notes: 'Test notes',
      });

      expect(newCase.id).toContain('DEMO-');
      expect(newCase.caseType).toBe('small_claims');
      expect(newCase.jurisdiction).toBe('Allen County, IN');
      expect(newCase.status).toBe('active');
      expect(newCase.progressPct).toBe(0);
    });

    it('updates an existing case', async () => {
      const updated = await demoCasesRepo.updateCase('DEMO-EVICTION-001', {
        title: 'Updated Title',
        progressPct: 50,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.progressPct).toBe(50);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(0);
    });

    it('throws error when updating non-existent case', async () => {
      await expect(
        demoCasesRepo.updateCase('NON-EXISTENT', { title: 'Test' })
      ).rejects.toThrow('Case not found');
    });

    it('soft deletes a case', async () => {
      await demoCasesRepo.deleteCase('DEMO-EVICTION-001');
      
      const caseData = await demoCasesRepo.getCase('DEMO-EVICTION-001');
      expect(caseData?.status).toBe('archived');
    });
  });

  describe('demoStepsRepo', () => {
    it('gets all steps for a case ordered by order field', async () => {
      const steps = await demoStepsRepo.getCaseSteps('DEMO-EVICTION-001');
      
      expect(steps).toHaveLength(5);
      expect(steps[0].order).toBe(1);
      expect(steps[4].order).toBe(5);
      
      // Verify ordering
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].order).toBeGreaterThan(steps[i - 1].order);
      }
    });

    it('returns empty array for case with no steps', async () => {
      const steps = await demoStepsRepo.getCaseSteps('NON-EXISTENT');
      expect(steps).toEqual([]);
    });

    it('gets a single step by ID', async () => {
      const step = await demoStepsRepo.getStep('demo-step-1');
      
      expect(step).not.toBeNull();
      expect(step?.name).toBe('Review Eviction Notice');
      expect(step?.isComplete).toBe(true);
    });

    it('creates a new step', async () => {
      const stepData: CreateCaseStepInput = {
        caseId: 'DEMO-EVICTION-001',
        name: 'New Test Step',
        order: 6,
        dueDate: new Date(),
      };

      const newStep = await demoStepsRepo.createStep(stepData);

      expect(newStep.id).toContain('demo-step-');
      expect(newStep.name).toBe('New Test Step');
      expect(newStep.order).toBe(6);
      expect(newStep.isComplete).toBe(false);
      expect(newStep.completedAt).toBeNull();
    });

    it('updates step completion status', async () => {
      const updated = await demoStepsRepo.updateStepCompletion('demo-step-2', {
        isComplete: true,
      });

      expect(updated.isComplete).toBe(true);
      expect(updated.completedAt).not.toBeNull();
      expect(updated.completedAt).toBeInstanceOf(Date);
    });

    it('clears completedAt when marking incomplete', async () => {
      // First mark as complete
      await demoStepsRepo.updateStepCompletion('demo-step-2', { isComplete: true });
      
      // Then mark as incomplete
      const updated = await demoStepsRepo.updateStepCompletion('demo-step-2', {
        isComplete: false,
      });

      expect(updated.isComplete).toBe(false);
      expect(updated.completedAt).toBeNull();
    });

    it('updates case progress when step completion changes', async () => {
      // Complete another step
      await demoStepsRepo.updateStepCompletion('demo-step-2', { isComplete: true });
      
      // Check case progress updated
      const caseData = await demoCasesRepo.getCase('DEMO-EVICTION-001');
      
      expect(caseData?.completedSteps).toBe(2); // Was 1, now 2
      expect(caseData?.progressPct).toBe(40); // 2 of 5 = 40%
    });

    it('updates a step', async () => {
      const updated = await demoStepsRepo.updateStep('demo-step-2', {
        name: 'Updated Step Name',
        dueDate: new Date('2025-10-20'),
      });

      expect(updated.name).toBe('Updated Step Name');
      expect(updated.dueDate).toEqual(new Date('2025-10-20'));
    });

    it('deletes a step', async () => {
      await demoStepsRepo.deleteStep('demo-step-5');
      
      const step = await demoStepsRepo.getStep('demo-step-5');
      expect(step).toBeNull();
    });
  });

  describe('demoRemindersRepo', () => {
    it('creates a reminder', async () => {
      const reminder = await demoRemindersRepo.createReminder({
        userId: 'demo-user',
        caseId: 'DEMO-EVICTION-001',
        dueDate: new Date('2025-10-20'),
        channel: 'email',
        message: 'Test reminder',
      });

      expect(reminder.id).toContain('demo-reminder-');
      expect(reminder.message).toBe('Test reminder');
      expect(reminder.sent).toBe(false);
      expect(reminder.channel).toBe('email');
    });

    it('gets case reminders', async () => {
      const reminders = await demoRemindersRepo.getCaseReminders('DEMO-EVICTION-001');
      
      expect(reminders.length).toBeGreaterThan(0);
      expect(reminders[0].caseId).toBe('DEMO-EVICTION-001');
    });

    it('gets user reminders (unsent only)', async () => {
      const reminders = await demoRemindersRepo.getUserReminders('demo-user');
      
      expect(reminders.length).toBeGreaterThan(0);
      reminders.forEach(r => {
        expect(r.userId).toBe('demo-user');
        expect(r.sent).toBe(false);
      });
    });

    it('marks reminder as sent', async () => {
      const reminders = await demoRemindersRepo.getCaseReminders('DEMO-EVICTION-001');
      const reminderId = reminders[0].id;

      await demoRemindersRepo.markReminderSent(reminderId);

      const state = getDemoStorageState();
      const reminder = state.reminders.find(r => r.id === reminderId);
      
      expect(reminder?.sent).toBe(true);
    });

    it('deletes a reminder', async () => {
      const reminders = await demoRemindersRepo.getCaseReminders('DEMO-EVICTION-001');
      const reminderId = reminders[0].id;

      await demoRemindersRepo.deleteReminder(reminderId);

      const state = getDemoStorageState();
      const reminder = state.reminders.find(r => r.id === reminderId);
      
      expect(reminder).toBeUndefined();
    });
  });

  describe('Demo utilities', () => {
    it('resets storage to initial scenario state', () => {
      // Make changes
      demoCasesRepo.updateCase('DEMO-EVICTION-001', { title: 'Changed' });
      
      // Reset
      resetDemoStorage();
      
      // Verify back to initial state
      const state = getDemoStorageState();
      expect(state.cases[0].title).toBe('Eviction Defense - Indianapolis');
    });

    it('gets current storage state', () => {
      const state = getDemoStorageState();
      
      expect(state.cases).toHaveLength(1);
      expect(state.steps).toHaveLength(5);
      expect(state.reminders.length).toBeGreaterThan(0);
    });
  });

  describe('Interface compatibility', () => {
    it('matches production repo method signatures', async () => {
      // Verify all expected methods exist and are async
      expect(typeof demoCasesRepo.getCase).toBe('function');
      expect(typeof demoCasesRepo.getUserCases).toBe('function');
      expect(typeof demoCasesRepo.createCase).toBe('function');
      expect(typeof demoCasesRepo.updateCase).toBe('function');
      
      expect(typeof demoStepsRepo.getCaseSteps).toBe('function');
      expect(typeof demoStepsRepo.getStep).toBe('function');
      expect(typeof demoStepsRepo.createStep).toBe('function');
      expect(typeof demoStepsRepo.updateStepCompletion).toBe('function');
      
      expect(typeof demoRemindersRepo.createReminder).toBe('function');
      expect(typeof demoRemindersRepo.getCaseReminders).toBe('function');
      expect(typeof demoRemindersRepo.getUserReminders).toBe('function');
    });

    it('returns promises for all async methods', () => {
      const promise1 = demoCasesRepo.getCase('test');
      const promise2 = demoStepsRepo.getCaseSteps('test');
      const promise3 = demoRemindersRepo.getUserReminders('test');
      
      expect(promise1).toBeInstanceOf(Promise);
      expect(promise2).toBeInstanceOf(Promise);
      expect(promise3).toBeInstanceOf(Promise);
    });
  });

  describe('Performance', () => {
    it('simulates realistic delays', async () => {
      const start = Date.now();
      await demoCasesRepo.getCase('DEMO-EVICTION-001');
      const duration = Date.now() - start;
      
      // Should take at least 100ms (simulated delay)
      expect(duration).toBeGreaterThanOrEqual(90); // Allow small variance
    });

    it('completes operations in reasonable time', async () => {
      const start = Date.now();
      
      // Multiple operations
      await demoCasesRepo.getCase('DEMO-EVICTION-001');
      await demoStepsRepo.getCaseSteps('DEMO-EVICTION-001');
      await demoRemindersRepo.getCaseReminders('DEMO-EVICTION-001');
      
      const duration = Date.now() - start;
      
      // Should complete in under 1 second total
      expect(duration).toBeLessThan(1000);
    });
  });
});

