/**
 * Tests for demo scenarios
 * 
 * Verifies scenario data structure and completeness
 */

import { describe, it, expect } from 'vitest';
import { evictionScenario, smallClaimsScenario, currentScenario, getScenario } from './index';

describe('Demo Scenarios', () => {
  describe('evictionScenario', () => {
    it('has valid case data', () => {
      expect(evictionScenario.case.id).toBe('DEMO-EVICTION-001');
      expect(evictionScenario.case.caseType).toBe('eviction');
      expect(evictionScenario.case.status).toBe('active');
      expect(evictionScenario.case.jurisdiction).toBe('Marion County, IN');
    });

    it('has 5 journey steps', () => {
      expect(evictionScenario.steps).toHaveLength(5);
    });

    it('has steps in correct order', () => {
      evictionScenario.steps.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
        expect(step.caseId).toBe('DEMO-EVICTION-001');
      });
    });

    it('has at least one completed step', () => {
      const completedSteps = evictionScenario.steps.filter(s => s.isComplete);
      expect(completedSteps.length).toBeGreaterThan(0);
    });

    it('has glossary terms', () => {
      expect(Object.keys(evictionScenario.glossaryTerms).length).toBeGreaterThan(0);
      
      // Check specific important terms
      expect(evictionScenario.glossaryTerms['eviction-notice']).toBeDefined();
      expect(evictionScenario.glossaryTerms['answer']).toBeDefined();
      expect(evictionScenario.glossaryTerms['default-judgment']).toBeDefined();
    });

    it('glossary terms have required fields', () => {
      Object.values(evictionScenario.glossaryTerms).forEach(term => {
        expect(term.id).toBeTruthy();
        expect(term.term).toBeTruthy();
        expect(term.definition).toBeTruthy();
        expect(term.lastReviewed).toBeInstanceOf(Date);
      });
    });

    it('has reminders', () => {
      expect(evictionScenario.reminders.length).toBeGreaterThan(0);
      
      evictionScenario.reminders.forEach(reminder => {
        expect(reminder.caseId).toBe('DEMO-EVICTION-001');
        expect(reminder.userId).toBe('demo-user');
        expect(reminder.sent).toBe(false);
      });
    });

    it('has appearance form template', () => {
      expect(evictionScenario.forms.appearance).toBeDefined();
      expect(evictionScenario.forms.appearance.fields.length).toBeGreaterThan(0);
      
      // Check required form fields
      const fieldIds = evictionScenario.forms.appearance.fields.map(f => f.id);
      expect(fieldIds).toContain('full_name');
      expect(fieldIds).toContain('case_number');
      expect(fieldIds).toContain('mailing_address');
    });

    it('form fields have required properties', () => {
      evictionScenario.forms.appearance.fields.forEach(field => {
        expect(field.id).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.type).toBeTruthy();
        expect(typeof field.required).toBe('boolean');
      });
    });

    it('has realistic due dates', () => {
      const now = Date.now();
      
      evictionScenario.steps.forEach(step => {
        if (step.dueDate) {
          const dueTime = step.dueDate.getTime();
          
          // Due dates should be within reasonable range (past 7 days to future 30 days)
          const daysDiff = (dueTime - now) / (86400000);
          expect(daysDiff).toBeGreaterThan(-7);
          expect(daysDiff).toBeLessThan(30);
        }
      });
    });
  });

  describe('smallClaimsScenario', () => {
    it('has valid case data', () => {
      expect(smallClaimsScenario.case.id).toBe('DEMO-SMALLCLAIMS-001');
      expect(smallClaimsScenario.case.caseType).toBe('small_claims');
      expect(smallClaimsScenario.case.status).toBe('active');
    });

    it('has 5 journey steps', () => {
      expect(smallClaimsScenario.steps).toHaveLength(5);
    });

    it('steps are in correct order', () => {
      smallClaimsScenario.steps.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
      });
    });

    it('has glossary terms', () => {
      expect(Object.keys(smallClaimsScenario.glossaryTerms).length).toBeGreaterThan(0);
      
      // Check specific terms
      expect(smallClaimsScenario.glossaryTerms['small-claims']).toBeDefined();
      expect(smallClaimsScenario.glossaryTerms['plaintiff']).toBeDefined();
      expect(smallClaimsScenario.glossaryTerms['defendant']).toBeDefined();
    });

    it('has small claims form template', () => {
      expect(smallClaimsScenario.forms.claim).toBeDefined();
      expect(smallClaimsScenario.forms.claim.fields.length).toBeGreaterThan(0);
      
      const fieldIds = smallClaimsScenario.forms.claim.fields.map(f => f.id);
      expect(fieldIds).toContain('plaintiff_name');
      expect(fieldIds).toContain('defendant_name');
      expect(fieldIds).toContain('amount_claimed');
    });
  });

  describe('currentScenario', () => {
    it('exports a valid scenario', () => {
      expect(currentScenario).toBeDefined();
      expect(currentScenario.case).toBeDefined();
      expect(currentScenario.steps).toHaveLength(5);
    });

    it('defaults to eviction scenario', () => {
      // As per architecture doc: locked for public demo
      expect(currentScenario.case.id).toBe('DEMO-EVICTION-001');
    });
  });

  describe('getScenario', () => {
    it('returns eviction scenario', () => {
      const scenario = getScenario('eviction');
      expect(scenario.case.caseType).toBe('eviction');
    });

    it('returns small claims scenario', () => {
      const scenario = getScenario('smallClaims');
      expect(scenario.case.caseType).toBe('small_claims');
    });
  });

  describe('Scenario consistency', () => {
    it('case matches scenario data in steps', () => {
      evictionScenario.steps.forEach(step => {
        expect(step.caseId).toBe(evictionScenario.case.id);
      });

      smallClaimsScenario.steps.forEach(step => {
        expect(step.caseId).toBe(smallClaimsScenario.case.id);
      });
    });

    it('reminders reference correct case', () => {
      evictionScenario.reminders.forEach(reminder => {
        expect(reminder.caseId).toBe(evictionScenario.case.id);
        expect(reminder.userId).toBe(evictionScenario.case.userId);
      });

      smallClaimsScenario.reminders.forEach(reminder => {
        expect(reminder.caseId).toBe(smallClaimsScenario.case.id);
        expect(reminder.userId).toBe(smallClaimsScenario.case.userId);
      });
    });

    it('case progress matches step completion', () => {
      const evictionCompleted = evictionScenario.steps.filter(s => s.isComplete).length;
      expect(evictionScenario.case.completedSteps).toBe(evictionCompleted);
      
      const expectedProgress = Math.round((evictionCompleted / evictionScenario.steps.length) * 100);
      expect(evictionScenario.case.progressPct).toBe(expectedProgress);
    });

    it('all timestamps are Date objects', () => {
      expect(evictionScenario.case.createdAt).toBeInstanceOf(Date);
      expect(evictionScenario.case.updatedAt).toBeInstanceOf(Date);
      
      evictionScenario.reminders.forEach(reminder => {
        expect(reminder.createdAt).toBeInstanceOf(Date);
        expect(reminder.dueDate).toBeInstanceOf(Date);
      });
    });
  });

  describe('Form templates', () => {
    it('have PDF field mappings', () => {
      expect(evictionScenario.forms.appearance.pdfFieldMap).toBeDefined();
      expect(Object.keys(evictionScenario.forms.appearance.pdfFieldMap).length).toBeGreaterThan(0);
      
      expect(smallClaimsScenario.forms.claim.pdfFieldMap).toBeDefined();
      expect(Object.keys(smallClaimsScenario.forms.claim.pdfFieldMap).length).toBeGreaterThan(0);
    });

    it('field mappings match form field IDs', () => {
      const appearanceFieldIds = evictionScenario.forms.appearance.fields.map(f => f.id);
      const appearanceMappingIds = Object.keys(evictionScenario.forms.appearance.pdfFieldMap);
      
      appearanceMappingIds.forEach(mappingId => {
        expect(appearanceFieldIds).toContain(mappingId);
      });
    });

    it('have help text for complex fields', () => {
      evictionScenario.forms.appearance.fields.forEach(field => {
        if (field.required) {
          expect(field.helpText).toBeTruthy();
        }
      });
    });
  });

  describe('Demo script support', () => {
    it('eviction scenario supports 15-minute demo', () => {
      // Check that data is structured for demo waypoints
      
      // Should have urgent step (within 2-3 days)
      const urgentSteps = evictionScenario.steps.filter(step => {
        if (!step.dueDate) return false;
        const daysUntil = (step.dueDate.getTime() - Date.now()) / 86400000;
        return daysUntil <= 3 && !step.isComplete;
      });
      
      expect(urgentSteps.length).toBeGreaterThan(0);
    });

    it('has diverse step statuses for demo', () => {
      // Should have mix of complete and incomplete for realistic demo
      const completed = evictionScenario.steps.filter(s => s.isComplete);
      const incomplete = evictionScenario.steps.filter(s => !s.isComplete);
      
      expect(completed.length).toBeGreaterThan(0);
      expect(incomplete.length).toBeGreaterThan(0);
    });
  });
});

