import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExtractionResultCard } from '../../../components/ai-copilot/ExtractionResultCard';
import type { ExtractionResult } from '@/lib/ai/documentExtraction';

describe('ExtractionResultCard Marion County Features', () => {
  const mockOnConfirm = vi.fn();
  const mockOnReject = vi.fn();

  describe('Marion County Context Display', () => {
    it('should display Marion County court information for valid case numbers', () => {
      const marionResult: ExtractionResult = {
        success: true,
        caseNumber: '49K01-2510-EV-001234',
        hearingDate: '2025-11-06',
        courtName: 'Center Township Small Claims Court',
        jurisdiction: 'Marion County, IN - Center Township Small Claims Court',
        caseType: 'eviction',
        parties: {
          plaintiff: 'ABC Property Management LLC',
          defendant: 'Maria Rodriguez'
        },
        confidence: {
          overall: 0.9,
          caseNumber: 0.95,
          hearingDate: 0.9,
          courtName: 0.95,
          jurisdiction: 0.9,
          caseType: 0.85
        },
        rawText: 'Eviction notice for case 49K01-2510-EV-001234'
      };

      render(
        <ExtractionResultCard
          result={marionResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Check Marion County context is displayed
      expect(screen.getByText('Marion County Court Information')).toBeInTheDocument();
      
      // Use more specific selectors to avoid conflicts with form inputs
      const marionSection = screen.getByText('Marion County Court Information').closest('div');
      expect(marionSection).toBeInTheDocument();
      expect(marionSection).toHaveTextContent('Center Township Small Claims Court');
      expect(marionSection).toHaveTextContent('Marion County, IN - Center Township Small Claims Court');
      expect(marionSection).toHaveTextContent('Eviction');
      expect(marionSection).toHaveTextContent('Center Township');
      
      // Check court details
      expect(screen.getByText('7201 E. 75th Street, Indianapolis, IN 46256')).toBeInTheDocument();
      expect(screen.getByText('(317) 595-5000')).toBeInTheDocument();
      expect(screen.getByText('Monday-Friday 8:00 AM - 4:30 PM')).toBeInTheDocument();
    });

    it('should display timeline information for Marion County cases', () => {
      const marionResult: ExtractionResult = {
        success: true,
        caseNumber: '49K01-2510-EV-001234',
        hearingDate: '2025-10-10', // Notice date for timeline calculation
        courtName: 'Center Township Small Claims Court',
        jurisdiction: 'Marion County, IN - Center Township Small Claims Court',
        caseType: 'eviction',
        confidence: { overall: 0.9 },
        rawText: 'Eviction notice'
      };

      render(
        <ExtractionResultCard
          result={marionResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Check timeline information is displayed
      expect(screen.getByText('Marion County Timeline')).toBeInTheDocument();
      expect(screen.getByText('Response Due:')).toBeInTheDocument();
      expect(screen.getByText('Hearing Scheduled:')).toBeInTheDocument();
      expect(screen.getByText('Writ Execution:')).toBeInTheDocument();
    });

    it('should not display Marion County context for non-Marion County cases', () => {
      const nonMarionResult: ExtractionResult = {
        success: true,
        caseNumber: '12-3456-CV',
        hearingDate: '2025-11-06',
        courtName: 'Some Other Court',
        jurisdiction: 'Some Other County, State',
        caseType: 'civil',
        confidence: { overall: 0.9 },
        rawText: 'Some other court document'
      };

      render(
        <ExtractionResultCard
          result={nonMarionResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Check Marion County context is NOT displayed
      expect(screen.queryByText('Marion County Court Information')).not.toBeInTheDocument();
      expect(screen.queryByText('Marion County Timeline')).not.toBeInTheDocument();
    });

    it('should handle small claims cases correctly', () => {
      const smallClaimsResult: ExtractionResult = {
        success: true,
        caseNumber: '49K02-2510-SC-001235',
        hearingDate: '2025-10-10',
        courtName: 'Decatur Township Small Claims Court',
        jurisdiction: 'Marion County, IN - Decatur Township Small Claims Court',
        caseType: 'small_claims',
        confidence: { overall: 0.9 },
        rawText: 'Small claims notice'
      };

      render(
        <ExtractionResultCard
          result={smallClaimsResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Check small claims specific information
      const marionSection = screen.getByText('Marion County Court Information').closest('div');
      expect(marionSection).toHaveTextContent('Small Claims');
      expect(marionSection).toHaveTextContent('Decatur Township');
      expect(marionSection).toHaveTextContent('Decatur Township Small Claims Court');
      
      // Check timeline doesn't include writ execution for small claims
      expect(screen.getByText('Marion County Timeline')).toBeInTheDocument();
      expect(screen.queryByText('Writ Execution:')).not.toBeInTheDocument();
    });
  });

  describe('Different Township Courts', () => {
    const townships = [
      { code: 'K01', name: 'Center Township' },
      { code: 'K02', name: 'Decatur Township' },
      { code: 'K03', name: 'Franklin Township' },
      { code: 'K04', name: 'Lawrence Township' },
      { code: 'K05', name: 'Perry Township' },
      { code: 'K06', name: 'Pike Township' },
      { code: 'K07', name: 'Warren Township' },
      { code: 'K08', name: 'Washington Township' },
      { code: 'K09', name: 'Wayne Township' }
    ];

    townships.forEach(({ code, name }) => {
      it(`should display correct information for ${name} (${code})`, () => {
        const result: ExtractionResult = {
          success: true,
          caseNumber: `49${code}-2510-EV-001234`,
          hearingDate: '2025-10-10',
          courtName: `${name} Small Claims Court`,
          jurisdiction: `Marion County, IN - ${name} Small Claims Court`,
          caseType: 'eviction',
          confidence: { overall: 0.9 },
          rawText: 'Eviction notice'
        };

        render(
          <ExtractionResultCard
            result={result}
            onConfirm={mockOnConfirm}
            onReject={mockOnReject}
          />
        );

        const marionSection = screen.getByText('Marion County Court Information').closest('div');
        expect(marionSection).toHaveTextContent(`${name} Small Claims Court`);
        expect(marionSection).toHaveTextContent(name);
        expect(marionSection).toHaveTextContent(`Marion County, IN - ${name} Small Claims Court`);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid Marion County case numbers gracefully', () => {
      const invalidResult: ExtractionResult = {
        success: true,
        caseNumber: '49K01-2510-EV-1234', // Invalid - too few digits
        hearingDate: '2025-10-10',
        courtName: 'Some Court',
        jurisdiction: 'Some Jurisdiction',
        caseType: 'eviction',
        confidence: { overall: 0.9 },
        rawText: 'Document with invalid case number'
      };

      render(
        <ExtractionResultCard
          result={invalidResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Should not display Marion County context for invalid case numbers
      expect(screen.queryByText('Marion County Court Information')).not.toBeInTheDocument();
    });

    it('should handle missing hearing date for timeline calculation', () => {
      const noDateResult: ExtractionResult = {
        success: true,
        caseNumber: '49K01-2510-EV-001234',
        courtName: 'Center Township Small Claims Court',
        jurisdiction: 'Marion County, IN - Center Township Small Claims Court',
        caseType: 'eviction',
        confidence: { overall: 0.9 },
        rawText: 'Eviction notice without hearing date'
      };

      render(
        <ExtractionResultCard
          result={noDateResult}
          onConfirm={mockOnConfirm}
          onReject={mockOnReject}
        />
      );

      // Should display court info but not timeline
      expect(screen.getByText('Marion County Court Information')).toBeInTheDocument();
      expect(screen.queryByText('Marion County Timeline')).not.toBeInTheDocument();
    });
  });
});
