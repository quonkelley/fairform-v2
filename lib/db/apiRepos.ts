/**
 * API-based Repository Implementations
 * 
 * These repositories make HTTP requests to Next.js API routes
 * which handle Firebase operations. This is the production
 * implementation that works with real Firebase data.
 */

import type { Case, CaseStep, Reminder, CreateCaseStepInput, UpdateStepCompletionInput } from '@/lib/validation';
import type { CasesRepository, StepsRepository, RemindersRepository } from './repoFactory';

/**
 * API-based Cases Repository
 * 
 * Makes HTTP requests to /api/cases endpoints
 */
export const apiCasesRepo: CasesRepository = {
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch case: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse dates
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching case:', error);
      throw error;
    }
  },

  async getUserCases(): Promise<Case[]> {
    // userId is provided by auth context in API routes
    try {
      const response = await fetch('/api/cases');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cases: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse dates
      return (data as Case[]).map(caseData => ({
        ...caseData,
        createdAt: new Date(caseData.createdAt),
        updatedAt: new Date(caseData.updatedAt),
      }));
    } catch (error) {
      console.error('Error fetching user cases:', error);
      throw error;
    }
  },

  async createCase(data: {
    userId: string;
    caseType: string;
    jurisdiction: string;
    title?: string;
    notes?: string;
  }): Promise<Case> {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create case: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Parse dates
      return {
        ...result,
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt),
      };
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  },

  async updateCase(caseId: string, updates: Partial<Case>): Promise<Case> {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update case: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  },

  async deleteCase(caseId: string): Promise<void> {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete case: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting case:', error);
      throw error;
    }
  },
};

/**
 * API-based Steps Repository
 */
export const apiStepsRepo: StepsRepository = {
  async getCaseSteps(caseId: string): Promise<CaseStep[]> {
    try {
      const response = await fetch(`/api/cases/${caseId}/steps`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch steps: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse dates
      return (data as CaseStep[]).map(step => ({
        ...step,
        dueDate: step.dueDate ? new Date(step.dueDate) : null,
        completedAt: step.completedAt ? new Date(step.completedAt) : null,
      }));
    } catch (error) {
      console.error('Error fetching case steps:', error);
      throw error;
    }
  },

  async getStep(stepId: string): Promise<CaseStep | null> {
    try {
      const response = await fetch(`/api/steps/${stepId}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch step: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
      };
    } catch (error) {
      console.error('Error fetching step:', error);
      throw error;
    }
  },

  async createStep(data: CreateCaseStepInput): Promise<CaseStep> {
    try {
      const response = await fetch('/api/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create step: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        ...result,
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
        completedAt: result.completedAt ? new Date(result.completedAt) : null,
      };
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  },

  async updateStepCompletion(stepId: string, data: UpdateStepCompletionInput): Promise<CaseStep> {
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update step completion: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        ...result,
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
        completedAt: result.completedAt ? new Date(result.completedAt) : null,
      };
    } catch (error) {
      console.error('Error updating step completion:', error);
      throw error;
    }
  },

  async updateStep(stepId: string, updates: Partial<CaseStep>): Promise<CaseStep> {
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update step: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        ...result,
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
        completedAt: result.completedAt ? new Date(result.completedAt) : null,
      };
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  },

  async deleteStep(stepId: string): Promise<void> {
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete step: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  },
};

/**
 * API-based Reminders Repository
 */
export const apiRemindersRepo: RemindersRepository = {
  async createReminder(data: {
    userId: string;
    caseId: string;
    dueDate: Date;
    channel: 'email' | 'sms';
    message: string;
  }): Promise<Reminder> {
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create reminder: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        ...result,
        dueDate: new Date(result.dueDate),
        createdAt: new Date(result.createdAt),
      };
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  async getStepReminders(stepId: string): Promise<Reminder[]> {
    try {
      const response = await fetch(`/api/steps/${stepId}/reminders`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch step reminders: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return (data as Reminder[]).map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching step reminders:', error);
      throw error;
    }
  },

  async getCaseReminders(caseId: string): Promise<Reminder[]> {
    try {
      const response = await fetch(`/api/cases/${caseId}/reminders`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch case reminders: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return (data as Reminder[]).map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching case reminders:', error);
      throw error;
    }
  },

  async getUserReminders(): Promise<Reminder[]> {
    // userId is provided by auth context in API routes
    try {
      const response = await fetch(`/api/reminders`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user reminders: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return (data as Reminder[]).map(reminder => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching user reminders:', error);
      throw error;
    }
  },

  async markReminderSent(reminderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sent: true }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark reminder sent: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking reminder sent:', error);
      throw error;
    }
  },

  async deleteReminder(reminderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete reminder: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },
};

