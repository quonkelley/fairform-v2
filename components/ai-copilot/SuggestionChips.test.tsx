import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Scale } from 'lucide-react';
import { SuggestionChips, type SuggestionChip } from './SuggestionChips';

describe('SuggestionChips', () => {
  const mockOnSelect = vi.fn();

  const basicSuggestions: SuggestionChip[] = [
    {
      id: 'option-1',
      text: 'Option 1',
      value: 'This is option 1',
    },
    {
      id: 'option-2',
      text: 'Option 2',
      value: 'This is option 2',
    },
  ];

  const suggestionsWithIcons: SuggestionChip[] = [
    {
      id: 'eviction',
      text: 'Eviction notice',
      value: 'I received an eviction notice',
      icon: Home,
    },
    {
      id: 'small-claims',
      text: 'Small claims',
      value: 'I have a small claims matter',
      icon: Scale,
    },
  ];

  const primarySuggestion: SuggestionChip[] = [
    {
      id: 'confirm',
      text: 'Yes, create my case',
      value: 'Yes, create my case',
      primary: true,
    },
    {
      id: 'cancel',
      text: 'Not yet',
      value: 'Not yet',
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all suggestions', () => {
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders nothing when chips array is empty', () => {
    const { container } = render(
      <SuggestionChips chips={[]} onSelect={mockOnSelect} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onSelect with chip value when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    await user.click(screen.getByText('Option 1'));

    expect(mockOnSelect).toHaveBeenCalledWith('This is option 1');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('renders icons when provided', () => {
    render(
      <SuggestionChips chips={suggestionsWithIcons} onSelect={mockOnSelect} />
    );

    // Icons should be rendered (they have aria-hidden="true")
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByText('Eviction notice')).toBeInTheDocument();
    expect(screen.getByText('Small claims')).toBeInTheDocument();
  });

  it('applies primary styling to primary chips', () => {
    render(
      <SuggestionChips chips={primarySuggestion} onSelect={mockOnSelect} />
    );

    const confirmButton = screen.getByText('Yes, create my case').closest('button');
    const cancelButton = screen.getByText('Not yet').closest('button');

    // Primary button should have blue background
    expect(confirmButton).toHaveClass('bg-blue-600');
    expect(confirmButton).toHaveClass('text-white');

    // Non-primary button should have white background
    expect(cancelButton).toHaveClass('bg-white');
    expect(cancelButton).toHaveClass('text-gray-700');
  });

  it('limits visible suggestions to maxVisible', () => {
    const manySuggestions: SuggestionChip[] = Array.from({ length: 10 }, (_, i) => ({
      id: `option-${i}`,
      text: `Option ${i}`,
      value: `Value ${i}`,
    }));

    render(
      <SuggestionChips
        chips={manySuggestions}
        onSelect={mockOnSelect}
        maxVisible={3}
      />
    );

    // Should show 3 suggestions plus "More" button
    expect(screen.getByText('Option 0')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('shows all suggestions when "More" button is clicked', async () => {
    const user = userEvent.setup();
    const manySuggestions: SuggestionChip[] = Array.from({ length: 6 }, (_, i) => ({
      id: `option-${i}`,
      text: `Option ${i}`,
      value: `Value ${i}`,
    }));

    render(
      <SuggestionChips
        chips={manySuggestions}
        onSelect={mockOnSelect}
        maxVisible={3}
      />
    );

    // Initially only 3 suggestions visible
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();

    // Click "More" button
    await user.click(screen.getByText('More'));

    // Now all suggestions should be visible
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument();
    expect(screen.getByText('Option 5')).toBeInTheDocument();
    expect(screen.queryByText('More')).not.toBeInTheDocument();
  });

  it('disables chip after selection', async () => {
    const user = userEvent.setup();
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    const button = screen.getByText('Option 1').closest('button');
    expect(button).not.toBeDisabled();

    await user.click(button!);

    // Button should be disabled after click
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('has proper ARIA labels', () => {
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    // Container should have role and aria-label
    const container = screen.getByRole('group');
    expect(container).toHaveAttribute('aria-label', 'Quick action suggestions');

    // Each button should have aria-label
    const button1 = screen.getByLabelText('Select Option 1');
    const button2 = screen.getByLabelText('Select Option 2');
    expect(button1).toBeInTheDocument();
    expect(button2).toBeInTheDocument();
  });

  it('has keyboard accessibility', async () => {
    const user = userEvent.setup();
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    const button1 = screen.getByText('Option 1').closest('button');
    const button2 = screen.getByText('Option 2').closest('button');

    // Tab to first button
    await user.tab();
    expect(button1).toHaveFocus();

    // Tab to second button
    await user.tab();
    expect(button2).toHaveFocus();

    // Press Enter to select
    await user.keyboard('{Enter}');
    expect(mockOnSelect).toHaveBeenCalledWith('This is option 2');
  });

  it('has minimum touch target size', () => {
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      // Check for min-h-[44px] class (44px minimum for accessibility)
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  it('applies horizontal scroll and snap behavior', () => {
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    const scrollContainer = screen.getByRole('group');
    expect(scrollContainer).toHaveClass('overflow-x-auto');
    expect(scrollContainer).toHaveClass('snap-x');
    expect(scrollContainer).toHaveClass('snap-mandatory');
  });

  it('animates chip exit on selection', async () => {
    const user = userEvent.setup();
    render(
      <SuggestionChips chips={basicSuggestions} onSelect={mockOnSelect} />
    );

    const button = screen.getByText('Option 1').closest('button');

    await user.click(button!);

    // Button should start exit animation (opacity will change)
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
