/**
 * Tests for Glossary Service
 * Story: 13.11 - Glossary Integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  GlossaryService,
  createGlossaryService,
  getGlossaryService,
  resetGlossaryService,
  type GlossaryTerm,
} from './glossary';

const mockGlossaryData: Record<string, GlossaryTerm> = {
  'appearance': {
    term: 'Notice of Appearance',
    definition: 'A form that tells the court you\'re participating in the case.',
    context: 'eviction',
    relatedTerms: ['appearance form', 'filing appearance'],
  },
  'default-judgment': {
    term: 'Default Judgment',
    definition: 'When you don\'t respond or appear, the court can rule against you automatically.',
    context: 'general',
    relatedTerms: ['default', 'judgment by default'],
  },
  'evidence': {
    term: 'Evidence',
    definition: 'Documents, photos, or other materials that support your case.',
    context: 'general',
  },
  'eviction': {
    term: 'Eviction',
    definition: 'Legal process to remove a tenant from rental property.',
    context: 'eviction',
    jurisdiction: 'Indiana',
  },
};

describe('GlossaryService', () => {
  let service: GlossaryService;

  beforeEach(() => {
    service = new GlossaryService(mockGlossaryData);
    resetGlossaryService();
  });

  describe('initialization', () => {
    it('initializes with glossary data', () => {
      expect(service.hasTerms()).toBe(true);
      expect(service.getAllTerms().length).toBeGreaterThan(0);
    });

    it('loads all terms from glossary data', () => {
      const allTerms = service.getAllTerms();
      expect(allTerms.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getDefinition', () => {
    it('retrieves definition by term key', () => {
      const def = service.getDefinition('appearance');
      expect(def).toBeTruthy();
      expect(def?.term).toBe('Notice of Appearance');
    });

    it('retrieves definition by term name', () => {
      const def = service.getDefinition('notice of appearance');
      expect(def).toBeTruthy();
      expect(def?.definition).toContain('participating');
    });

    it('returns null for unknown terms', () => {
      const def = service.getDefinition('unknown-term');
      expect(def).toBeNull();
    });

    it('is case-insensitive', () => {
      const def1 = service.getDefinition('APPEARANCE');
      const def2 = service.getDefinition('appearance');
      expect(def1?.term).toBe(def2?.term);
    });
  });

  describe('detectTerms', () => {
    it('detects terms in text', () => {
      const text = 'You need to file a notice of appearance to avoid default judgment.';
      const matches = service.detectTerms(text);

      expect(matches.length).toBeGreaterThan(0);
      const termNames = matches.map(m => m.term.term.toLowerCase());
      expect(termNames).toContain('notice of appearance');
    });

    it('filters terms by case context', () => {
      const text = 'File your appearance for this eviction case.';
      const matches = service.detectTerms(text, { caseType: 'eviction' });

      expect(matches.length).toBeGreaterThan(0);
      
      // Should include eviction-related terms
      const hasEvictionTerms = matches.some(m => 
        m.term.context === 'eviction' || m.term.context === 'general'
      );
      expect(hasEvictionTerms).toBe(true);
    });

    it('includes general terms regardless of context', () => {
      const text = 'You need evidence for your case.';
      const matches = service.detectTerms(text, { caseType: 'small_claims' });

      const hasEvidence = matches.some(m => 
        m.term.term.toLowerCase().includes('evidence')
      );
      expect(hasEvidence).toBe(true);
    });

    it('calculates relevance scores', () => {
      const text = 'File your appearance to avoid default judgment in this eviction.';
      const matches = service.detectTerms(text, { caseType: 'eviction' });

      expect(matches.length).toBeGreaterThan(0);
      matches.forEach(match => {
        expect(match.relevance).toBeGreaterThan(0);
        expect(match.relevance).toBeLessThanOrEqual(1);
      });
    });

    it('sorts matches by relevance', () => {
      const text = 'This eviction case requires you to file appearance and gather evidence.';
      const matches = service.detectTerms(text, { caseType: 'eviction' });

      if (matches.length > 1) {
        for (let i = 1; i < matches.length; i++) {
          expect(matches[i - 1].relevance).toBeGreaterThanOrEqual(matches[i].relevance);
        }
      }
    });

    it('limits results to top matches', () => {
      const text = 'appearance evidence eviction default judgment notice case court file';
      const matches = service.detectTerms(text);

      expect(matches.length).toBeLessThanOrEqual(10);
    });

    it('handles text with no terms', () => {
      const text = 'This text contains no legal terminology at all.';
      const matches = service.detectTerms(text);

      expect(matches).toBeInstanceOf(Array);
      expect(matches.length).toBe(0);
    });

    it('matches whole words only', () => {
      const text = 'The evidence is evident in the case.';
      const matches = service.detectTerms(text);

      // Should match "evidence" but not "evident"
      const evidenceMatches = matches.filter(m => 
        m.term.term.toLowerCase().includes('evidence')
      );
      expect(evidenceMatches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('formatDefinitionsForPrompt', () => {
    it('formats definitions for AI prompt', () => {
      const text = 'File your appearance to avoid default judgment.';
      const matches = service.detectTerms(text);
      const formatted = service.formatDefinitionsForPrompt(matches);

      expect(formatted).toContain('### Legal Terms:');
      expect(formatted).toContain('**');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('limits definitions in prompt', () => {
      const text = 'appearance evidence eviction default judgment case';
      const matches = service.detectTerms(text);
      const formatted = service.formatDefinitionsForPrompt(matches);

      // Should include max 5 terms
      const termCount = (formatted.match(/\*\*/g) || []).length / 2;
      expect(termCount).toBeLessThanOrEqual(5);
    });

    it('returns empty string for no matches', () => {
      const formatted = service.formatDefinitionsForPrompt([]);
      expect(formatted).toBe('');
    });
  });

  describe('context awareness', () => {
    it('boosts relevance for matching jurisdiction', () => {
      const text = 'This eviction case is in Indiana.';
      const matchesWithJurisdiction = service.detectTerms(text, {
        caseType: 'eviction',
        jurisdiction: 'Indiana',
      });
      const matchesWithoutJurisdiction = service.detectTerms(text, {
        caseType: 'eviction',
      });

      // Terms with matching jurisdiction should have higher relevance
      const evictionWithJuris = matchesWithJurisdiction.find(m => 
        m.term.term === 'Eviction'
      );
      const evictionWithoutJuris = matchesWithoutJurisdiction.find(m => 
        m.term.term === 'Eviction'
      );

      if (evictionWithJuris && evictionWithoutJuris) {
        expect(evictionWithJuris.relevance).toBeGreaterThanOrEqual(
          evictionWithoutJuris.relevance
        );
      }
    });
  });
});

describe('createGlossaryService', () => {
  it('creates a new service instance', () => {
    const service = createGlossaryService(mockGlossaryData);
    expect(service).toBeInstanceOf(GlossaryService);
    expect(service.hasTerms()).toBe(true);
  });
});

describe('getGlossaryService', () => {
  beforeEach(() => {
    resetGlossaryService();
  });

  it('creates singleton instance on first call', () => {
    const service1 = getGlossaryService(mockGlossaryData);
    const service2 = getGlossaryService();

    expect(service1).toBe(service2);
  });

  it('throws error if called without data before initialization', () => {
    expect(() => getGlossaryService()).toThrow('Glossary service not initialized');
  });

  it('reuses existing instance', () => {
    const service1 = getGlossaryService(mockGlossaryData);
    const service2 = getGlossaryService();
    const service3 = getGlossaryService();

    expect(service1).toBe(service2);
    expect(service2).toBe(service3);
  });
});

describe('resetGlossaryService', () => {
  it('resets singleton instance', () => {
    getGlossaryService(mockGlossaryData);
    resetGlossaryService();

    expect(() => getGlossaryService()).toThrow();
  });
});

