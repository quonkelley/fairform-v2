import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { CelebrationModal } from './CelebrationModal';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('CelebrationModal', () => {
  const defaultProps = {
    caseId: 'case-123',
    caseTitle: 'Test Case',
    nextSteps: [
      {
        title: 'View My Case',
        action: vi.fn(),
      },
      {
        title: 'Start First Step',
        action: vi.fn(),
      },
      {
        title: 'Learn About FairForm',
        action: vi.fn(),
      },
    ],
    onClose: vi.fn(),
    isOpen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders celebration modal with correct content', () => {
    render(<CelebrationModal {...defaultProps} />);

    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('Case Created Successfully!')).toBeInTheDocument();
    expect(screen.getByText('Your case "Test Case" is ready. Here\'s what you can do next:')).toBeInTheDocument();
  });

  it('renders all next step buttons', () => {
    render(<CelebrationModal {...defaultProps} />);

    expect(screen.getByText('View My Case')).toBeInTheDocument();
    expect(screen.getByText('Start First Step')).toBeInTheDocument();
    expect(screen.getByText('Learn About FairForm')).toBeInTheDocument();
  });

  it('calls action when next step button is clicked', () => {
    const mockAction = vi.fn();
    const propsWithMockAction = {
      ...defaultProps,
      nextSteps: [
        {
          title: 'Test Action',
          action: mockAction,
        },
      ],
    };

    render(<CelebrationModal {...propsWithMockAction} />);

    fireEvent.click(screen.getByText('Test Action'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('shows onboarding tip', () => {
    render(<CelebrationModal {...defaultProps} />);

    expect(screen.getByText('💡 Tip')).toBeInTheDocument();
    expect(screen.getByText(/FairForm will guide you through each step/)).toBeInTheDocument();
  });

  it('calls onClose when dismiss button is clicked', () => {
    render(<CelebrationModal {...defaultProps} />);

    fireEvent.click(screen.getByText("I'll explore on my own"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct button variants', () => {
    const propsWithVariants = {
      ...defaultProps,
      nextSteps: [
        {
          title: 'Primary Action',
          action: vi.fn(),
          variant: 'default' as const,
        },
        {
          title: 'Secondary Action',
          action: vi.fn(),
          variant: 'outline' as const,
        },
      ],
    };

    render(<CelebrationModal {...propsWithVariants} />);

    const primaryButton = screen.getByText('Primary Action');
    const secondaryButton = screen.getByText('Secondary Action');

    expect(primaryButton).toHaveClass('bg-primary');
    expect(secondaryButton).toHaveClass('border-border');
  });

  it('does not render when isOpen is false', () => {
    render(<CelebrationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Case Created Successfully!')).not.toBeInTheDocument();
  });
});
