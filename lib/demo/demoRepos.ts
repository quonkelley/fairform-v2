/**
 * Demo Repository Implementations
 * 
 * These implementations match the production repository interfaces but use
 * in-memory storage with demo data. Components call these repos the same way
 * they call production repos - no switching logic needed.
 * 
 * This enables:
 * - Realistic demo behavior without Firebase
 * - Fast testing with structured demo data
 * - Easy scenario swapping via config
 */

import type { Case, CaseStep, Reminder, CreateCaseStepInput, UpdateStepCompletionInput } from '@/lib/validation';
import { currentScenario } from './scenarios';

/**
 * In-memory storage (persists during session)
 */
const storage = {
  cases: new Map<string, Case>(),
  steps: new Map<string, CaseStep>(),
  reminders: new Map<string, Reminder>(),
};

/**
 * Initialize storage with scenario data
 */
function initializeStorage() {
  // Clear existing data
  storage.cases.clear();
  storage.steps.clear();
  storage.reminders.clear();
  
  // Load scenario data
  storage.cases.set(currentScenario.case.id, currentScenario.case);
  
  currentScenario.steps.forEach(step => {
    storage.steps.set(step.id, step);
  });
  
  currentScenario.reminders.forEach(reminder => {
    storage.reminders.set(reminder.id, reminder);
  });
}

// Initialize on module load
initializeStorage();

/**
 * Simulate network delay for realistic demo behavior
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Demo Cases Repository
 * 
 * Implements same interface as production casesRepo
 */
export const demoCasesRepo = {
  /**
   * Get a case by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    await simulateDelay(100);
    return storage.cases.get(caseId) || null;
  },

  /**
   * Get all cases for a user
   */
  async getUserCases(userId: string): Promise<Case[]> {
    await simulateDelay(150);
    return Array.from(storage.cases.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  /**
   * Create a new case
   */
  async createCase(data: {
    userId: string;
    caseType: string;
    jurisdiction: string;
    title?: string;
    notes?: string;
  }): Promise<Case> {
    await simulateDelay(200);
    
    const newCase: Case = {
      id: `DEMO-${Date.now()}`,
      userId: data.userId,
      caseType: data.caseType,
      jurisdiction: data.jurisdiction,
      status: 'active',
      title: data.title,
      notes: data.notes || null,
      progressPct: 0,
      totalSteps: 0,
      completedSteps: 0,
      currentStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    storage.cases.set(newCase.id, newCase);
    return newCase;
  },

  /**
   * Update a case
   */
  async updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
    await simulateDelay(150);
    
    const existing = storage.cases.get(caseId);
    if (!existing) {
      throw new Error(`Case not found: ${caseId}`);
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    storage.cases.set(caseId, updated);
    return updated;
  },

  /**
   * Delete a case (soft delete - change status)
   */
  async deleteCase(caseId: string): Promise<void> {
    await simulateDelay(150);
    
    const existing = storage.cases.get(caseId);
    if (existing) {
      const archived = { ...existing, status: 'archived' as const, updatedAt: new Date() };
      storage.cases.set(caseId, archived);
    }
  },
};

/**
 * Demo Steps Repository
 * 
 * Implements same interface as production stepsRepo
 */
export const demoStepsRepo = {
  /**
   * Get all steps for a case
   */
  async getCaseSteps(caseId: string): Promise<CaseStep[]> {
    await simulateDelay(100);
    
    return Array.from(storage.steps.values())
      .filter(s => s.caseId === caseId)
      .sort((a, b) => a.order - b.order);
  },

  /**
   * Get a single step by ID
   */
  async getStep(stepId: string): Promise<CaseStep | null> {
    await simulateDelay(80);
    return storage.steps.get(stepId) || null;
  },

  /**
   * Create a new step
   */
  async createStep(data: CreateCaseStepInput): Promise<CaseStep> {
    await simulateDelay(150);
    
    const newStep: CaseStep = {
      id: `demo-step-${Date.now()}`,
      caseId: data.caseId,
      name: data.name,
      order: data.order,
      dueDate: data.dueDate || null,
      isComplete: false,
      completedAt: null,
    };
    
    storage.steps.set(newStep.id, newStep);
    return newStep;
  },

  /**
   * Update step completion status
   */
  async updateStepCompletion(stepId: string, data: UpdateStepCompletionInput): Promise<CaseStep> {
    await simulateDelay(100);
    
    const existing = storage.steps.get(stepId);
    if (!existing) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const updated: CaseStep = {
      ...existing,
      isComplete: data.isComplete,
      completedAt: data.isComplete ? new Date() : null,
    };
    
    storage.steps.set(stepId, updated);
    
    // Update case progress
    await updateCaseProgress(existing.caseId);
    
    return updated;
  },

  /**
   * Update a step
   */
  async updateStep(stepId: string, updates: Partial<CaseStep>): Promise<CaseStep> {
    await simulateDelay(100);
    
    const existing = storage.steps.get(stepId);
    if (!existing) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const updated = { ...existing, ...updates };
    storage.steps.set(stepId, updated);
    return updated;
  },

  /**
   * Delete a step
   */
  async deleteStep(stepId: string): Promise<void> {
    await simulateDelay(100);
    storage.steps.delete(stepId);
  },
};

/**
 * Demo Reminders Repository
 * 
 * Implements same interface as production remindersRepo
 */
export const demoRemindersRepo = {
  /**
   * Create a reminder
   */
  async createReminder(data: {
    userId: string;
    caseId: string;
    dueDate: Date;
    channel: 'email' | 'sms';
    message: string;
  }): Promise<Reminder> {
    await simulateDelay(150);
    
    const reminder: Reminder = {
      id: `demo-reminder-${Date.now()}`,
      userId: data.userId,
      caseId: data.caseId,
      dueDate: data.dueDate,
      channel: data.channel,
      message: data.message,
      sent: false,
      createdAt: new Date(),
    };
    
    storage.reminders.set(reminder.id, reminder);
    return reminder;
  },

  /**
   * Get reminders for a specific step
   */
  async getStepReminders(): Promise<Reminder[]> {
    await simulateDelay(100);
    
    // In demo, stepId not used - return all active reminders instead
    return Array.from(storage.reminders.values())
      .filter(r => !r.sent)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },

  /**
   * Get all reminders for a case
   */
  async getCaseReminders(caseId: string): Promise<Reminder[]> {
    await simulateDelay(100);
    
    return Array.from(storage.reminders.values())
      .filter(r => r.caseId === caseId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },

  /**
   * Get reminders for a user
   */
  async getUserReminders(userId: string): Promise<Reminder[]> {
    await simulateDelay(100);
    
    return Array.from(storage.reminders.values())
      .filter(r => r.userId === userId && !r.sent)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },

  /**
   * Mark reminder as sent
   */
  async markReminderSent(reminderId: string): Promise<void> {
    await simulateDelay(80);
    
    const reminder = storage.reminders.get(reminderId);
    if (reminder) {
      storage.reminders.set(reminderId, { ...reminder, sent: true });
    }
  },

  /**
   * Delete a reminder
   */
  async deleteReminder(reminderId: string): Promise<void> {
    await simulateDelay(80);
    storage.reminders.delete(reminderId);
  },
};

/**
 * Helper: Update case progress based on completed steps
 */
async function updateCaseProgress(caseId: string): Promise<void> {
  const caseData = storage.cases.get(caseId);
  if (!caseData) return;

  const steps = await demoStepsRepo.getCaseSteps(caseId);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.isComplete).length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  await demoCasesRepo.updateCase(caseId, {
    totalSteps,
    completedSteps,
    progressPct,
  });
}

/**
 * Demo utility: Reset storage to initial scenario state
 * Useful for testing and resetting demos
 */
export function resetDemoStorage(): void {
  initializeStorage();
}

/**
 * Demo utility: Get current storage state
 * Useful for debugging
 */
export function getDemoStorageState() {
  return {
    cases: Array.from(storage.cases.values()),
    steps: Array.from(storage.steps.values()),
    reminders: Array.from(storage.reminders.values()),
  };
}

