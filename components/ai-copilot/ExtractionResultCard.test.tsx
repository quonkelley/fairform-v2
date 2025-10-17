import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExtractionResultCard } from './ExtractionResultCard';
import type { ExtractionResult } from '@/lib/ai/documentExtraction';

describe('ExtractionResultCard', () => {
  const mockResult: ExtractionResult = {
    success: true,
    caseNumber: '2024-CV-00123',
    hearingDate: '2024-12-15',
    courtName: 'Marion County Circuit Court',
    jurisdiction: 'Marion County, Indiana',
    caseType: 'small_claims',
    parties: {
      plaintiff: 'John Doe',
      defendant: 'Jane Smith',
    },
    confidence: {
      overall: 0.85,
      caseNumber: 0.9,
      hearingDate: 0.8,
      courtName: 0.95,
      jurisdiction: 0.88,
      caseType: 0.75,
    },
    rawText: 'Small claims court notice for hearing on December 15, 2024',
  };

  it('should render extraction results', () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Document Extraction Results')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-CV-00123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Marion County Circuit Court')).toBeInTheDocument();
  });

  it('should show confidence indicators', () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    // Overall confidence of 85% should be shown
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('should allow editing fields', async () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    // Click edit button for case number
    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]);

    // Should show input field
    const input = screen.getByDisplayValue('2024-CV-00123') as HTMLInputElement;
    expect(input).not.toBeDisabled();

    // Edit the value
    fireEvent.change(input, { target: { value: '2024-CV-99999' } });
    expect(input.value).toBe('2024-CV-99999');
  });

  it('should call onConfirm with edited data', async () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    // Edit case number
    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('2024-CV-00123') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2024-CV-99999' } });

    // Confirm
    const confirmButton = screen.getByText('Confirm & Use');
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        caseNumber: '2024-CV-99999',
      })
    );
  });

  it('should call onReject when reject button is clicked', () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    expect(onReject).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should show parties if available', () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Plaintiff:')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Defendant:')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show document summary if available', () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Document Summary')).toBeInTheDocument();
    expect(
      screen.getByText('Small claims court notice for hearing on December 15, 2024')
    ).toBeInTheDocument();
  });

  it('should show low confidence warning', () => {
    const lowConfidenceResult: ExtractionResult = {
      ...mockResult,
      confidence: {
        overall: 0.3,
      },
    };

    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={lowConfidenceResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    expect(screen.getByText('Low Confidence Extraction')).toBeInTheDocument();
  });

  it('should not show fields with no value', () => {
    const partialResult: ExtractionResult = {
      success: true,
      caseNumber: '2024-CV-00123',
      confidence: {
        overall: 0.8,
      },
    };

    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={partialResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    expect(screen.getByDisplayValue('2024-CV-00123')).toBeInTheDocument();
    expect(screen.queryByText('Hearing Date')).not.toBeInTheDocument();
    expect(screen.queryByText('Court Name')).not.toBeInTheDocument();
  });

  it('should cancel edit on Escape key', async () => {
    const onConfirm = vi.fn();
    const onReject = vi.fn();

    render(
      <ExtractionResultCard
        result={mockResult}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    );

    // Start editing
    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('2024-CV-00123') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2024-CV-99999' } });

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' });

    // Should revert to original value
    await waitFor(() => {
      expect(screen.getByDisplayValue('2024-CV-00123')).toBeInTheDocument();
    });
  });
});
