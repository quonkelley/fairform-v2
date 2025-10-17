/**
 * Utility to map journey template data to CaseStep format
 * Ensures demo scenarios have complete step information
 */

import type { CaseStep } from '@/lib/validation';
import type { JourneyTemplate } from './templates';

export interface StepMappingOptions {
  caseId: string;
  baseOrder?: number;
  dueDateOffset?: number; // Days to add to base date
  isComplete?: boolean;
  completedAt?: Date | null;
}

/**
 * Map a journey template step to a CaseStep with enhanced information
 */
export function mapTemplateToStep(
  template: JourneyTemplate,
  order: number,
  options: StepMappingOptions
): CaseStep {
  const {
    caseId,
    dueDateOffset = 0,
    isComplete = false,
    completedAt = null
  } = options;

  // Calculate due date based on offset
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dueDateOffset);
  
  return {
    id: `step-${caseId}-${order}`,
    caseId,
    name: template.title,
    order,
    dueDate: dueDateOffset > 0 ? baseDate : null,
    isComplete,
    completedAt,
    // Enhanced fields from template
    description: template.description,
    stepType: template.stepType,
    instructions: template.instructions,
    estimatedTime: template.estimatedTime,
    disclaimer: template.disclaimer,
  };
}

/**
 * Map multiple journey template steps to CaseStep array
 */
export function mapTemplatesToSteps(
  templates: JourneyTemplate[],
  options: StepMappingOptions
): CaseStep[] {
  return templates.map((template, index) => 
    mapTemplateToStep(template, index + 1, {
      ...options,
      dueDateOffset: (options.dueDateOffset || 0) + (index * 7), // 7 days between steps by default
    })
  );
}

/**
 * Create a step with enhanced information for demo scenarios
 */
export function createEnhancedStep(
  caseId: string,
  order: number,
  name: string,
  stepType: 'form' | 'document' | 'review' | 'submit' | 'wait' | 'meeting' | 'communication',
  options: {
    description: string;
    instructions: string[];
    estimatedTime: number;
    disclaimer: string;
    dueDateOffset?: number;
    isComplete?: boolean;
    completedAt?: Date | null;
  }
): CaseStep {
  const baseDate = new Date();
  if (options.dueDateOffset) {
    baseDate.setDate(baseDate.getDate() + options.dueDateOffset);
  }

  return {
    id: `step-${caseId}-${order}`,
    caseId,
    name,
    order,
    dueDate: options.dueDateOffset ? baseDate : null,
    isComplete: options.isComplete || false,
    completedAt: options.completedAt || null,
    description: options.description,
    stepType,
    instructions: options.instructions,
    estimatedTime: options.estimatedTime,
    disclaimer: options.disclaimer,
  };
}
