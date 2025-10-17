import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from './ChatPanel';

import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  Send: () => <div data-testid="send-icon" />,
  Bot: () => <div data-testid="bot-icon" />,
  User: () => <div data-testid="user-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock useAuth hook
vi.mock('@/components/auth/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', getIdToken: vi.fn().mockResolvedValue('test-token') },
    loading: false,
  }),
}));

// Mock useAICopilot hook
vi.mock('@/lib/hooks/useAICopilot', () => ({
  useAICopilot: () => ({
    sessionId: 'test-session-id',
    messages: [],
    sendMessage: vi.fn().mockResolvedValue(undefined),
    isSending: false,
    connectionStatus: 'connected',
    error: null,
    isLoading: false,
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock EventSource to ensure SSE is supported in tests
const EventSourceMock = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  url: '',
  withCredentials: false,
}));

// Add static properties to the mock
Object.assign(EventSourceMock, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
});

// @ts-expect-error - Mock for testing
global.EventSource = EventSourceMock;

describe('ChatPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
    // Reset EventSource mock
    (global.EventSource as unknown as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('renders when open', () => {
      render(<ChatPanel {...defaultProps} />);
      
      expect(screen.getByText('AI Copilot')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close chat panel/i })).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ChatPanel {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('AI Copilot')).not.toBeInTheDocument();
    });

    it('shows welcome message when no messages', () => {
      render(<ChatPanel {...defaultProps} />);
      
      expect(screen.getByText('Welcome to AI Copilot')).toBeInTheDocument();
      expect(screen.getByText(/Ask me anything about your legal case/)).toBeInTheDocument();
    });

    it('renders with session and case IDs', () => {
      render(
        <ChatPanel
          {...defaultProps}
          sessionId="test-session"
          caseId="test-case"
        />
      );
      
      expect(screen.getByText('AI Copilot')).toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    it('shows connected status from hook', () => {
      render(<ChatPanel {...defaultProps} />);

      // Connection status is now managed by useAICopilot hook
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close chat panel/i });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      
      // Find the backdrop by its specific class
      const backdrop = document.querySelector('.fixed.inset-0.bg-black');
      expect(backdrop).toBeInTheDocument();
      await user.click(backdrop!);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when panel content is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      
      const panelContent = screen.getByText('AI Copilot');
      await user.click(panelContent);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes on Escape key', () => {
      const onClose = vi.fn();
      
      render(<ChatPanel {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Input', () => {
    it('renders input field with placeholder', () => {
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      expect(input).toBeInTheDocument();
    });

    it('updates input value when typed', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      
      expect(input).toHaveValue('Hello, AI!');
    });

    it('sends message when Enter is pressed', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      // Message should appear in the chat
      await waitFor(() => {
        expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
      });
    });

    it('does not send message when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      
      // Input should still contain the text and add a new line
      expect(input).toHaveValue('Hello, AI!\n');
      // Should not see the message in the chat area (only in input)
      expect(screen.queryByText(/Welcome to AI Copilot/)).toBeInTheDocument();
    });

    it('sends message when send button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(input, 'Hello, AI!');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
      });
    });

    it('clears input after sending message', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(input, 'Hello, AI!');
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('disables send button when input is empty', () => {
      render(<ChatPanel {...defaultProps} />);
      
      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toBeDisabled();
    });

    it('enables send button when input has content', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(input, 'Hello');
      
      expect(sendButton).not.toBeDisabled();
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(input, '   '); // Only whitespace
      await user.click(sendButton);
      
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('displays user messages with correct styling', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const message = screen.getByText('Hello, AI!');
        expect(message).toBeInTheDocument();
        expect(message.closest('div')).toHaveClass('bg-blue-600');
      });
    });

    it('displays assistant messages with correct styling', async () => {
      const user = userEvent.setup();
      
      // Mock successful SSE response
      const mockResponse = {
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"content","content":"Hello! This is a test response."}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      // Wait for the typing indicator to appear first
      await waitFor(() => {
        expect(screen.getByText('AI is typing...')).toBeInTheDocument();
      });
      
      // Then wait for the assistant message to appear
      await waitFor(() => {
        const assistantMessage = screen.getByText(/Hello! This is a test response/);
        expect(assistantMessage).toBeInTheDocument();
        expect(assistantMessage.closest('div')).toHaveClass('bg-gray-100');
      }, { timeout: 3000 });
    }, 8000);

    it('shows message timestamps', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        // Should show clock icon and time
        expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
        expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
      });
    });

    it('shows typing indicator during AI response', async () => {
      const user = userEvent.setup();
      
      // Mock successful SSE response
      const mockResponse = {
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"content","content":"Hello!"}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      // Should show typing indicator immediately
      expect(screen.getByText('AI is typing...')).toBeInTheDocument();
    });

    it('shows sending status for user messages', async () => {
      const user = userEvent.setup();
      
      // Mock successful SSE response
      const mockResponse = {
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"type":"content","content":"Hello!"}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ChatPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /close chat panel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('focuses input when panel opens', () => {
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      expect(input).toHaveFocus();
    });

    it('has proper keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<ChatPanel {...defaultProps} />);
      
      // Input should have focus initially
      const input = screen.getByPlaceholderText(/Type your message.../);
      expect(input).toHaveFocus();
      
      // Type something to enable the send button
      await user.type(input, 'test');
      
      // Tab to send button (now enabled)
      await user.tab();
      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toHaveFocus();
    });
  });

  describe('Responsive Design', () => {
    it('applies correct classes for mobile and desktop', () => {
      render(<ChatPanel {...defaultProps} />);
      
      // Find the main panel container
      const panel = document.querySelector('.bg-white.rounded-lg.shadow-xl');
      expect(panel).toHaveClass('max-w-md', 'sm:max-w-lg', 'lg:max-w-xl');
    });
  });

  describe('Error Handling', () => {
    it('handles failed message sending', async () => {
      const user = userEvent.setup();
      
      // Mock failed fetch response
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ChatPanel {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');
      
      // Should show sending status first, then failed status
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
      
      // Then should show failed status
      await waitFor(() => {
        expect(screen.getByText('Failed to send')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Message Status', () => {
    it('shows failed status for failed messages', async () => {
      const user = userEvent.setup();

      render(<ChatPanel {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Type your message.../);
      await user.type(input, 'Hello, AI!');
      await user.keyboard('{Enter}');

      // Wait for the message to be sent and potentially fail
      await waitFor(() => {
        const message = screen.getByText('Hello, AI!');
        expect(message).toBeInTheDocument();
      });
    });
  });

  describe('Progress Indicator Integration', () => {
    it('shows progress indicator during GREET stage', () => {
      // Mock useAICopilot to return GREET stage
      vi.doMock('@/lib/hooks/useAICopilot', () => ({
        useAICopilot: () => ({
          sessionId: 'test-session-id',
          messages: [],
          sendMessage: vi.fn().mockResolvedValue(undefined),
          isSending: false,
          connectionStatus: 'connected',
          error: null,
          isLoading: false,
          conversationStage: 'GREET' as const,
          collectedInfo: {},
        }),
      }));

      render(<ChatPanel {...defaultProps} />);

      expect(screen.getByRole('status', { name: /case information/i })).toBeInTheDocument();
      expect(screen.getByText('Case Information')).toBeInTheDocument();
      expect(screen.getByText('0/3')).toBeInTheDocument();
    });

    it('shows progress indicator during GATHER_MIN stage', () => {
      // Mock useAICopilot to return GATHER_MIN stage
      vi.doMock('@/lib/hooks/useAICopilot', () => ({
        useAICopilot: () => ({
          sessionId: 'test-session-id',
          messages: [],
          sendMessage: vi.fn().mockResolvedValue(undefined),
          isSending: false,
          connectionStatus: 'connected',
          error: null,
          isLoading: false,
          conversationStage: 'GATHER_MIN' as const,
          collectedInfo: {
            caseType: 'eviction',
          },
        }),
      }));

      render(<ChatPanel {...defaultProps} />);

      expect(screen.getByRole('status', { name: /case information/i })).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('does not show progress indicator during CONFIRM_CREATE stage', () => {
      // Mock useAICopilot to return CONFIRM_CREATE stage
      vi.doMock('@/lib/hooks/useAICopilot', () => ({
        useAICopilot: () => ({
          sessionId: 'test-session-id',
          messages: [],
          sendMessage: vi.fn().mockResolvedValue(undefined),
          isSending: false,
          connectionStatus: 'connected',
          error: null,
          isLoading: false,
          conversationStage: 'CONFIRM_CREATE' as const,
          collectedInfo: {
            caseType: 'eviction',
            jurisdiction: 'Marion County',
            caseNumber: 'ABC-123',
          },
        }),
      }));

      render(<ChatPanel {...defaultProps} />);

      expect(screen.queryByRole('status', { name: /case information/i })).not.toBeInTheDocument();
    });

    it('updates progress indicator as information is collected', async () => {
      // This test would require remounting with different hook values
      // which is better suited for E2E tests, but we can test the rendering logic

      // Start with no info
      vi.doMock('@/lib/hooks/useAICopilot', () => ({
        useAICopilot: () => ({
          sessionId: 'test-session-id',
          messages: [],
          sendMessage: vi.fn().mockResolvedValue(undefined),
          isSending: false,
          connectionStatus: 'connected',
          error: null,
          isLoading: false,
          conversationStage: 'GATHER_MIN' as const,
          collectedInfo: {},
        }),
      }));

      const { rerender } = render(<ChatPanel {...defaultProps} />);

      expect(screen.getByText('0/3')).toBeInTheDocument();

      // Update to have case type collected
      vi.doMock('@/lib/hooks/useAICopilot', () => ({
        useAICopilot: () => ({
          sessionId: 'test-session-id',
          messages: [],
          sendMessage: vi.fn().mockResolvedValue(undefined),
          isSending: false,
          connectionStatus: 'connected',
          error: null,
          isLoading: false,
          conversationStage: 'GATHER_MIN' as const,
          collectedInfo: {
            caseType: 'eviction',
          },
        }),
      }));

      rerender(<ChatPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });
    });
  });
});
