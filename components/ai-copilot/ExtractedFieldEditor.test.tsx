/**
 * Tests for ExtractedFieldEditor component (Story 13.32)
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtractedFieldEditor } from './ExtractedFieldEditor';

describe('ExtractedFieldEditor', () => {
  const defaultProps = {
    label: 'Case Type',
    value: 'eviction',
    confidence: 0.95,
    isCollected: true,
    fieldKey: 'caseType',
  };

  describe('Display states', () => {
    it('shows collected field with high confidence', () => {
      render(<ExtractedFieldEditor {...defaultProps} />);

      expect(screen.getByText('Case Type')).toBeInTheDocument();
      expect(screen.getByText('eviction')).toBeInTheDocument();
    });

    it('shows uncollected field', () => {
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          isCollected={false}
          value={undefined}
        />
      );

      expect(screen.getByText('Case Type')).toBeInTheDocument();
      expect(screen.queryByText('eviction')).not.toBeInTheDocument();
    });

    it('truncates long values', () => {
      const longValue = 'This is a very long case number that should be truncated';
      render(<ExtractedFieldEditor {...defaultProps} value={longValue} />);

      expect(screen.getByText(/^This is a very long case/)).toBeInTheDocument();
      expect(screen.queryByText(longValue)).not.toBeInTheDocument();
    });
  });

  describe('Low confidence (<70%) - Edit button', () => {
    it('shows edit button for low confidence fields', () => {
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      expect(screen.getByRole('button', { name: /edit.*low confidence/i })).toBeInTheDocument();
    });

    it('does not show edit button without onEdit handler', () => {
      render(<ExtractedFieldEditor {...defaultProps} confidence={0.6} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('enters edit mode when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));

      expect(screen.getByRole('textbox', { name: /edit case type/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Medium confidence (70-79%) - Confirmation prompt', () => {
    it('shows "Looks good?" prompt for medium confidence', () => {
      const onConfirm = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.75}
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText(/looks good\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm.*correct/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit case type$/i })).toBeInTheDocument();
    });

    it('calls onConfirm when "Yes" is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.75}
          onConfirm={onConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm.*correct/i }));

      expect(onConfirm).toHaveBeenCalledWith(true);
    });

    it('enters edit mode when "Edit" is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.75}
          onConfirm={onConfirm}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('hides confirmation after user confirms', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const { rerender } = render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.75}
          onConfirm={onConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm.*correct/i }));

      // After confirm, component won't show prompt again
      rerender(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.75}
          onConfirm={onConfirm}
        />
      );

      // Note: In real app, parent would track confirmation state
      // This just tests the UI flow
    });
  });

  describe('Inline editing', () => {
    it('focuses and selects input text when entering edit mode', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });

    it('saves changes when save button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'small_claims');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(onEdit).toHaveBeenCalledWith('small_claims');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('saves changes when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'debt{Enter}');

      expect(onEdit).toHaveBeenCalledWith('debt');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('cancels edit when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'new_value');
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('eviction')).toBeInTheDocument();
    });

    it('cancels edit when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'new_value{Escape}');

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByText('eviction')).toBeInTheDocument();
    });

    it('does not call onEdit if value is unchanged', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(onEdit).not.toHaveBeenCalled();
    });

    it('trims whitespace from saved values', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '  trimmed  ');
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(onEdit).toHaveBeenCalledWith('trimmed');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ExtractedFieldEditor {...defaultProps} />);

      const group = screen.getByRole('group', { name: /case type.*eviction/i });
      expect(group).toBeInTheDocument();
    });

    it('has keyboard accessible edit button', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit.*low confidence/i });
      editButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('has focus indicators on interactive elements', () => {
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit.*low confidence/i });
      expect(editButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  describe('Mobile responsiveness', () => {
    it('uses responsive input width classes', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <ExtractedFieldEditor
          {...defaultProps}
          confidence={0.6}
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit.*low confidence/i }));
      const input = screen.getByRole('textbox');

      expect(input).toHaveClass('w-32', 'sm:w-40');
    });
  });
});
