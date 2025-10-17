import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { FailureResponseCard } from './FailureResponseCard';
import type { FailureResponse } from '@/lib/ai/gracefulFailure';

describe('FailureResponseCard', () => {
  const mockOnOptionSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rephrase failure response correctly', () => {
    const rephraseResponse: FailureResponse = {
      level: 'rephrase',
      message: 'Just to clarify, are you asking about "test question"?',
    };

    render(
      <FailureResponseCard
        response={rephraseResponse}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    expect(screen.getByText('🤔')).toBeInTheDocument();
    expect(screen.getByText('Just to clarify, are you asking about "test question"?')).toBeInTheDocument();
    expect(screen.getByText('🤔').closest('div')?.parentElement).toHaveClass('border-amber-500');
  });

  it('renders alternatives failure response with options', () => {
    const alternativesResponse: FailureResponse = {
      level: 'alternatives',
      message: "I'm not sure how to help with that. Here's what I can do:",
      options: [
        { text: 'Create a case', action: 'help_with_create_a_case' },
        { text: 'Get help with forms', action: 'help_with_get_help_with_forms' },
      ],
    };

    render(
      <FailureResponseCard
        response={alternativesResponse}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    expect(screen.getByText('💡')).toBeInTheDocument();
    expect(screen.getByText("I'm not sure how to help with that. Here's what I can do:")).toBeInTheDocument();
    expect(screen.getByText('Create a case')).toBeInTheDocument();
    expect(screen.getByText('Get help with forms')).toBeInTheDocument();
  });

  it('renders escalate failure response with support options', () => {
    const escalateResponse: FailureResponse = {
      level: 'escalate',
      message: "I'd like to connect you with our support team.",
      options: [
        { text: 'Talk to Support →', action: 'escalate_support' },
        { text: 'Try Something Else', action: 'show_alternatives' },
      ],
      escalationData: {
        conversationHistory: [],
        context: 'User needs help with test question',
      },
    };

    render(
      <FailureResponseCard
        response={escalateResponse}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    expect(screen.getByText('👋')).toBeInTheDocument();
    expect(screen.getByText("I'd like to connect you with our support team.")).toBeInTheDocument();
    expect(screen.getByText('Talk to Support →')).toBeInTheDocument();
    expect(screen.getByText('Try Something Else')).toBeInTheDocument();
    expect(screen.getByText('👋').closest('div')?.parentElement).toHaveClass('border-blue-500');
  });

  it('calls onOptionSelect when option button is clicked', () => {
    const responseWithOptions: FailureResponse = {
      level: 'alternatives',
      message: 'Here are some options:',
      options: [
        { text: 'Option 1', action: 'action_1' },
        { text: 'Option 2', action: 'action_2' },
      ],
    };

    render(
      <FailureResponseCard
        response={responseWithOptions}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    fireEvent.click(screen.getByText('Option 1'));
    expect(mockOnOptionSelect).toHaveBeenCalledWith('action_1');

    fireEvent.click(screen.getByText('Option 2'));
    expect(mockOnOptionSelect).toHaveBeenCalledWith('action_2');
  });

  it('applies correct styling for escalate level', () => {
    const escalateResponse: FailureResponse = {
      level: 'escalate',
      message: 'Test message',
      options: [
        { text: 'Support', action: 'escalate_support' },
      ],
    };

    render(
      <FailureResponseCard
        response={escalateResponse}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    const supportButton = screen.getByText('Support');
    expect(supportButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('applies correct styling for non-escalate levels', () => {
    const alternativesResponse: FailureResponse = {
      level: 'alternatives',
      message: 'Test message',
      options: [
        { text: 'Option', action: 'test_action' },
      ],
    };

    render(
      <FailureResponseCard
        response={alternativesResponse}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    const optionButton = screen.getByText('Option');
    expect(optionButton).toHaveClass('bg-white', 'border', 'border-gray-300');
  });

  it('applies custom className', () => {
    const response: FailureResponse = {
      level: 'rephrase',
      message: 'Test message',
    };

    render(
      <FailureResponseCard
        response={response}
        onOptionSelect={mockOnOptionSelect}
        className="custom-class"
      />
    );

    expect(screen.getByText('🤔').closest('div')?.parentElement).toHaveClass('custom-class');
  });

  it('handles response without options', () => {
    const responseWithoutOptions: FailureResponse = {
      level: 'rephrase',
      message: 'Just a message with no options.',
    };

    render(
      <FailureResponseCard
        response={responseWithoutOptions}
        onOptionSelect={mockOnOptionSelect}
      />
    );

    expect(screen.getByText('Just a message with no options.')).toBeInTheDocument();
    // Should not render any buttons
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
