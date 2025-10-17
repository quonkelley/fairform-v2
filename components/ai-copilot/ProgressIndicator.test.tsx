import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressIndicator } from './ProgressIndicator';
import type { MinimumCaseInfo } from '@/lib/ai/types';

describe('ProgressIndicator', () => {
  describe('Visibility', () => {
    it('should not render when isVisible is false', () => {
      const { container } = render(
        <ProgressIndicator
          collectedInfo={{}}
          isVisible={false}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('should render when isVisible is true', () => {
      render(
        <ProgressIndicator
          collectedInfo={{}}
          isVisible={true}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Case Information')).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should show all items as incomplete initially', () => {
      render(
        <ProgressIndicator
          collectedInfo={{}}
          isVisible={true}
        />
      );

      // Check progress counter
      expect(screen.getByText('0/3')).toBeInTheDocument();

      // All items should be in incomplete state (gray text)
      const caseTypeRow = screen.getByText('Case Type').closest('div');
      const locationRow = screen.getByText('Location').closest('div');
      const identifierRow = screen.getByText('Case # or Hearing Date').closest('div');

      expect(caseTypeRow).toHaveClass('text-gray-500');
      expect(locationRow).toHaveClass('text-gray-500');
      expect(identifierRow).toHaveClass('text-gray-500');
    });

    it('should have proper ARIA labels for screen readers', () => {
      render(
        <ProgressIndicator
          collectedInfo={{}}
          isVisible={true}
        />
      );

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Case information: 0 of 3 items collected');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Progress Tracking', () => {
    it('should update when case type is collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Progress counter should update
      expect(screen.getByText('1/3')).toBeInTheDocument();

      // Case type should be in completed state (green text)
      const caseTypeRow = screen.getByText('Case Type').closest('div');
      expect(caseTypeRow).toHaveClass('text-green-700');
      expect(caseTypeRow).toHaveTextContent('eviction');
    });

    it('should update when jurisdiction is collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        jurisdiction: 'Marion County',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Progress counter should update
      expect(screen.getByText('1/3')).toBeInTheDocument();

      // Location should be in completed state
      const locationRow = screen.getByText('Location').closest('div');
      expect(locationRow).toHaveClass('text-green-700');
      expect(locationRow).toHaveTextContent('Marion County');
    });

    it('should update when case number is collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseNumber: 'ABC-123-456',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Progress counter should update
      expect(screen.getByText('1/3')).toBeInTheDocument();

      // Identifier should be in completed state
      const identifierRow = screen.getByText('Case # or Hearing Date').closest('div');
      expect(identifierRow).toHaveClass('text-green-700');
      expect(identifierRow).toHaveTextContent('ABC-123-456');
    });

    it('should update when hearing date is collected (instead of case number)', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        hearingDate: 'January 15, 2024',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Identifier should show hearing date
      const identifierRow = screen.getByText('Case # or Hearing Date').closest('div');
      expect(identifierRow).toHaveClass('text-green-700');
      expect(identifierRow).toHaveTextContent('January 15, 2024');
    });

    it('should show all complete state when all items collected', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        caseNumber: 'ABC-123-456',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Progress counter should be 3/3
      expect(screen.getByText('3/3')).toBeInTheDocument();

      // Should show completion message
      expect(screen.getByText('All required information collected')).toBeInTheDocument();

      // All items should be green
      const caseTypeRow = screen.getByText('Case Type').closest('div');
      const locationRow = screen.getByText('Location').closest('div');
      const identifierRow = screen.getByText('Case # or Hearing Date').closest('div');

      expect(caseTypeRow).toHaveClass('text-green-700');
      expect(locationRow).toHaveClass('text-green-700');
      expect(identifierRow).toHaveClass('text-green-700');
    });
  });

  describe('Confidence Indicators', () => {
    it('should show warning icon for low confidence items', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.6 }}
          isVisible={true}
        />
      );

      // Should show amber alert icon instead of green checkmark
      const alertIcon = screen.getByLabelText('Low confidence - may need verification');
      expect(alertIcon).toBeInTheDocument();
    });

    it('should show edit button for low confidence items when onEdit provided', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.6 }}
          onEdit={onEdit}
          isVisible={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit case type/i });
      expect(editButton).toBeInTheDocument();

      await user.click(editButton);
      expect(onEdit).toHaveBeenCalledWith('caseType', 'eviction');
    });

    it('should not show edit button when confidence is high', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.9 }}
          onEdit={vi.fn()}
          isVisible={true}
        />
      );

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should not show edit button when onEdit not provided', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.6 }}
          isVisible={true}
        />
      );

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should truncate long values', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'This is a very long case type name that exceeds twenty characters',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      // Should show truncated value (matches "..." pattern)
      expect(screen.getByText(/This is a very long \.\.\./)).toBeInTheDocument();
    });

    it('should show full value in title attribute', () => {
      const longValue = 'This is a very long case type name that exceeds twenty characters';
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: longValue,
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      const valueElement = screen.getByText(/This is a very long \.\.\./);
      expect(valueElement).toHaveAttribute('title', longValue);
    });
  });

  describe('Accessibility', () => {
    it('should have proper keyboard navigation for edit buttons', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.6, jurisdiction: 0.5 }}
          onEdit={onEdit}
          isVisible={true}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(2);

      // Should be keyboard accessible
      editButtons[0].focus();
      expect(editButtons[0]).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onEdit).toHaveBeenCalledWith('caseType', 'eviction');
    });

    it('should have visible focus rings on interactive elements', () => {
      const onEdit = vi.fn();
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
      };

      render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          confidence={{ caseType: 0.6 }}
          onEdit={onEdit}
          isVisible={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Animations', () => {
    it('should have collapse animation when all complete', () => {
      const collectedInfo: Partial<MinimumCaseInfo> = {
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        caseNumber: 'ABC-123',
      };

      const { container } = render(
        <ProgressIndicator
          collectedInfo={collectedInfo}
          isVisible={true}
        />
      );

      const progressContainer = container.firstChild as HTMLElement;
      expect(progressContainer).toHaveClass('scale-95', 'opacity-75');
    });
  });
});
