/**
 * Repository Factory
 * 
 * Provides a unified interface for accessing data repositories.
 * Automatically switches between demo and production implementations
 * based on environment and user context.
 * 
 * This enables:
 * - Demo mode without Firebase
 * - Production mode with Firebase
 * - Seamless switching with no component changes
 * - Testing with structured demo data
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
 * Determine if we're in demo mode
 * 
 * Demo mode is active when:
 * - NEXT_PUBLIC_DEMO_MODE=true in environment
 * - User ID matches demo user ID
 * - No Firebase user is present (client-side)
 */
export function isDemoMode(): boolean {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true;
  }

  // In browser, check for demo user in localStorage
  if (typeof window !== 'undefined') {
    try {
      const demoUserId = localStorage.getItem('demo_user_id');
      if (demoUserId === 'demo-user') {
        return true;
      }
    } catch {
      // LocalStorage not available or blocked
    }
  }

  return false;
}

/**
 * Enable demo mode
 * Sets localStorage flag to activate demo mode
 */
export function enableDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demo_user_id', 'demo-user');
    localStorage.setItem('demo_mode', 'true');
  }
}

/**
 * Disable demo mode
 * Clears localStorage flags
 */
export function disableDemoMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_mode');
  }
}

/**
 * Repository Factory - Cases
 * 
 * Returns the appropriate repository implementation based on mode
 */
export async function getCasesRepo(): Promise<CasesRepository> {
  if (isDemoMode()) {
    // Dynamic import to avoid bundling demo code in production
    const { demoCasesRepo } = await import('@/lib/demo/demoRepos');
    return demoCasesRepo;
  } else {
    // Dynamic import production repo
    // For now, we'll create an API-based repo adapter
    const { apiCasesRepo } = await import('./apiRepos');
    return apiCasesRepo;
  }
}

/**
 * Repository Factory - Steps
 */
export async function getStepsRepo(): Promise<StepsRepository> {
  if (isDemoMode()) {
    const { demoStepsRepo } = await import('@/lib/demo/demoRepos');
    return demoStepsRepo;
  } else {
    const { apiStepsRepo } = await import('./apiRepos');
    return apiStepsRepo;
  }
}

/**
 * Repository Factory - Reminders
 */
export async function getRemindersRepo(): Promise<RemindersRepository> {
  if (isDemoMode()) {
    const { demoRemindersRepo } = await import('@/lib/demo/demoRepos');
    return demoRemindersRepo;
  } else {
    const { apiRemindersRepo } = await import('./apiRepos');
    return apiRemindersRepo;
  }
}

/**
 * Synchronous version for use in React components
 * 
 * Note: Returns null on first render, triggers re-render when loaded
 */
// Note: Synchronous repo access removed in favor of async factory pattern
// Components should use async hooks with the factory functions above

