/**
 * Glossary Service for AI Copilot Integration
 * 
 * Provides legal term definitions for AI responses and chat UI.
 * Integrates with Epic 7 glossary system and demo scenarios.
 * 
 * Story: 13.11 - Glossary Integration
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  context?: string;
  relatedTerms?: string[];
  jurisdiction?: string;
  lastReviewed?: Date;
}

export interface TermMatch {
  term: GlossaryTerm;
  relevance: number;
  position: number;
  matchedText: string;
}

export interface GlossaryContext {
  caseType?: string;
  jurisdiction?: string;
  conversationHistory?: string[];
}

/**
 * Glossary service for term detection and definition retrieval
 */
export class GlossaryService {
  private glossaryTerms: Map<string, GlossaryTerm> = new Map();
  private termVariations: Map<string, string> = new Map();
  private cache: Map<string, string> = new Map();

  constructor(glossaryData: Record<string, GlossaryTerm>) {
    this.initializeGlossary(glossaryData);
  }

  /**
   * Initialize glossary with terms and their variations
   */
  private initializeGlossary(glossaryData: Record<string, GlossaryTerm>): void {
    Object.entries(glossaryData).forEach(([key, term]) => {
      const normalizedTerm = term.term.toLowerCase();
      
      // Store primary term
      this.glossaryTerms.set(normalizedTerm, term);
      this.glossaryTerms.set(key, term); // Also store by key
      
      // Store related term variations
      if (term.relatedTerms) {
        term.relatedTerms.forEach(variation => {
          this.termVariations.set(variation.toLowerCase(), normalizedTerm);
        });
      }
    });

    console.log(`Glossary initialized with ${this.glossaryTerms.size} terms`);
  }

  /**
   * Detect legal terms in text based on context
   */
  detectTerms(text: string, context: GlossaryContext = {}): TermMatch[] {
    const matches: TermMatch[] = [];
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Check each term in the glossary
    for (const [termKey, term] of this.glossaryTerms) {
      // Skip if term doesn't match case context
      if (!this.isRelevantToContext(term, context)) {
        continue;
      }

      // Find positions of this term in text
      const positions = this.findTermPositions(lowerText, termKey);

      positions.forEach(position => {
        const relevance = this.calculateRelevance(term, context, text, position);
        
        if (relevance > 0.3) { // Only include relevant matches
          matches.push({
            term,
            relevance,
            position,
            matchedText: termKey,
          });
        }
      });
    }

    // Sort by relevance and remove duplicates
    return this.deduplicateMatches(matches)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Limit to top 10 terms
  }

  /**
   * Find all positions where a term appears in text
   */
  private findTermPositions(text: string, term: string): number[] {
    const positions: number[] = [];
    let position = 0;

    while (position < text.length) {
      const index = text.indexOf(term, position);
      if (index === -1) break;

      // Check if it's a whole word match (not part of another word)
      const beforeChar = index > 0 ? text[index - 1] : ' ';
      const afterChar = index + term.length < text.length ? text[index + term.length] : ' ';
      
      if (/\s/.test(beforeChar) && /\s/.test(afterChar)) {
        positions.push(index);
      }

      position = index + 1;
    }

    return positions;
  }

  /**
   * Check if a term is relevant to the current context
   */
  private isRelevantToContext(term: GlossaryTerm, context: GlossaryContext): boolean {
    // General terms are always relevant
    if (!term.context || term.context === 'general') {
      return true;
    }

    // If no case type in context, include all terms
    if (!context.caseType) {
      return true;
    }

    // Check if term context matches case type
    const caseType = context.caseType.toLowerCase();
    const termContext = term.context.toLowerCase();

    return termContext === caseType || termContext.includes(caseType);
  }

  /**
   * Calculate relevance score for a term based on context
   */
  private calculateRelevance(
    term: GlossaryTerm,
    context: GlossaryContext,
    text: string,
    position: number
  ): number {
    let relevance = 0.5; // Base relevance

    // Boost relevance for context match
    if (context.caseType && term.context) {
      if (term.context.toLowerCase().includes(context.caseType.toLowerCase())) {
        relevance += 0.3;
      }
    }

    // Boost relevance if jurisdiction matches
    if (context.jurisdiction && term.jurisdiction) {
      if (term.jurisdiction.toLowerCase().includes(context.jurisdiction.toLowerCase())) {
        relevance += 0.2;
      }
    }

    return Math.min(1.0, relevance);
  }

  /**
   * Remove duplicate term matches (same term, different positions)
   */
  private deduplicateMatches(matches: TermMatch[]): TermMatch[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      const key = match.term.term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get definition for a specific term
   */
  getDefinition(termKey: string): GlossaryTerm | null {
    const normalizedKey = termKey.toLowerCase();
    
    // Try direct lookup
    if (this.glossaryTerms.has(normalizedKey)) {
      return this.glossaryTerms.get(normalizedKey)!;
    }

    // Try variation lookup
    if (this.termVariations.has(normalizedKey)) {
      const primaryTerm = this.termVariations.get(normalizedKey)!;
      return this.glossaryTerms.get(primaryTerm)!;
    }

    return null;
  }

  /**
   * Format definitions for AI prompt inclusion
   */
  formatDefinitionsForPrompt(terms: TermMatch[]): string {
    if (terms.length === 0) return '';

    const definitions = terms
      .slice(0, 5) // Limit to top 5 for prompt
      .map(match => {
        const { term } = match;
        return `**${term.term}**: ${term.definition}`;
      })
      .join('\n\n');

    return `\n\n### Legal Terms:\n${definitions}`;
  }

  /**
   * Get all terms (for debugging/admin)
   */
  getAllTerms(): GlossaryTerm[] {
    return Array.from(this.glossaryTerms.values());
  }

  /**
   * Check if service has terms loaded
   */
  hasTerms(): boolean {
    return this.glossaryTerms.size > 0;
  }
}

/**
 * Create glossary service instance from demo scenario data
 */
export function createGlossaryService(glossaryData: Record<string, GlossaryTerm>): GlossaryService {
  return new GlossaryService(glossaryData);
}

/**
 * Singleton instance for the application
 */
let glossaryServiceInstance: GlossaryService | null = null;

/**
 * Get or create glossary service instance
 */
export function getGlossaryService(glossaryData?: Record<string, GlossaryTerm>): GlossaryService {
  if (!glossaryServiceInstance && glossaryData) {
    glossaryServiceInstance = new GlossaryService(glossaryData);
  }

  if (!glossaryServiceInstance) {
    throw new Error('Glossary service not initialized. Provide glossary data on first call.');
  }

  return glossaryServiceInstance;
}

/**
 * Reset glossary service (useful for testing)
 */
export function resetGlossaryService(): void {
  glossaryServiceInstance = null;
}

