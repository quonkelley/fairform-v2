/**
 * Repository Factory
 *
 * Provides a unified interface for accessing data repositories via API.
 */

import type { Case, CaseStep, Reminder, CreateCaseStepInput, UpdateStepCompletionInput } from '@/lib/validation';

/**
 * Cases Repository Interface
 */
export interface CasesRepository {
  getCase(caseId: string): Promise<Case | null>;
  getUserCases(userId: string): Promise<Case[]>;
  createCase(data: {
    userId: string;
    caseType: string;
    jurisdiction: string;
    title?: string;
    notes?: string;
  }): Promise<Case>;
  updateCase(caseId: string, updates: Partial<Case>): Promise<Case>;
  deleteCase(caseId: string): Promise<void>;
}

/**
 * Steps Repository Interface
 */
export interface StepsRepository {
  getCaseSteps(caseId: string): Promise<CaseStep[]>;
  getStep(stepId: string): Promise<CaseStep | null>;
  createStep(data: CreateCaseStepInput): Promise<CaseStep>;
  updateStepCompletion(stepId: string, data: UpdateStepCompletionInput): Promise<CaseStep>;
  updateStep(stepId: string, updates: Partial<CaseStep>): Promise<CaseStep>;
  deleteStep(stepId: string): Promise<void>;
}

/**
 * Reminders Repository Interface
 */
export interface RemindersRepository {
  createReminder(data: {
    userId: string;
    caseId: string;
    dueDate: Date;
    channel: 'email' | 'sms';
    message: string;
  }): Promise<Reminder>;
  getStepReminders(stepId: string): Promise<Reminder[]>;
  getCaseReminders(caseId: string): Promise<Reminder[]>;
  getUserReminders(userId: string): Promise<Reminder[]>;
  markReminderSent(reminderId: string): Promise<void>;
  deleteReminder(reminderId: string): Promise<void>;
}

/**
 * Repository Factory - Cases
 *
 * Returns the API-based repository implementation
 */
export async function getCasesRepo(): Promise<CasesRepository> {
  const { apiCasesRepo } = await import('./apiRepos');
  return apiCasesRepo;
}

/**
 * Repository Factory - Steps
 */
export async function getStepsRepo(): Promise<StepsRepository> {
  const { apiStepsRepo } = await import('./apiRepos');
  return apiStepsRepo;
}

/**
 * Repository Factory - Reminders
 */
export async function getRemindersRepo(): Promise<RemindersRepository> {
  const { apiRemindersRepo } = await import('./apiRepos');
  return apiRemindersRepo;
}

