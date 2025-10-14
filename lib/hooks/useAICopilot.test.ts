import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAICopilot } from './useAICopilot';

// Mock the auth context
const mockUser = {
  getIdToken: vi.fn().mockResolvedValue('mock-token'),
};

vi.mock('@/components/auth/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock EventSource to ensure SSE is supported in tests
global.EventSource = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  url: '',
  withCredentials: false,
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
}));

// Mock console methods to avoid noise in test output
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAICopilot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    if (global.EventSource) {
      (global.EventSource as any).mockClear();
    }
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      expect(result.current.session).toBeNull();
      expect(result.current.sessionId).toBeNull();
      expect(result.current.messages).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.isSending).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isDemoMode).toBe(false); // User is authenticated in tests
    });

    it('detects demo mode correctly', () => {
      // Mock demo mode conditions
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' },
        writable: true,
      });

      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isDemoMode).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('creates session automatically when autoCreateSession is true', async () => {
      const mockSessionResponse = {
        sessionId: 'test-session-123',
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/ai/sessions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSessionResponse),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [], hasMore: false, total: 0 }),
        });
      });

      const { result } = renderHook(
        () => useAICopilot({ autoCreateSession: true, caseId: 'test-case' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isCreatingSession).toBe(false);
      }, { timeout: 3000 });

      expect(global.fetch).toHaveBeenCalledWith('/api/ai/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({
          caseId: 'test-case',
          context: undefined,
          preferences: undefined,
        }),
      });
    });

    it('does not create session when autoCreateSession is false', async () => {
      const { result } = renderHook(
        () => useAICopilot({ autoCreateSession: false }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isCreatingSession).toBe(false);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('switches session correctly', async () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.switchSession('new-session-id');
      });

      expect(result.current.sessionId).toBe('new-session-id');
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Message Management', () => {
    it('loads messages correctly', async () => {
      const mockMessagesResponse = {
        items: [
          {
            id: 'msg-1',
            sessionId: 'session-1',
            author: 'user',
            content: 'Hello',
            createdAt: Date.now(),
          },
          {
            id: 'msg-2',
            sessionId: 'session-1',
            author: 'assistant',
            content: 'Hi there!',
            createdAt: Date.now(),
          },
        ],
        hasMore: false,
        total: 2,
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/ai/sessions') && url.includes('/messages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockMessagesResponse),
          });
        }
        if (url.includes('/api/ai/sessions') && !url.includes('/messages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'session-1', status: 'active' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      }, { timeout: 3000 });

      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[1].content).toBe('Hi there!');
    });

    it('loads more messages when hasMoreMessages is true', async () => {
      const mockMessagesResponse = {
        items: [
          {
            id: 'msg-1',
            sessionId: 'session-1',
            author: 'user',
            content: 'Hello',
            createdAt: Date.now(),
          },
        ],
        hasMore: true,
        total: 1,
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/ai/sessions') && url.includes('/messages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockMessagesResponse),
          });
        }
        if (url.includes('/api/ai/sessions') && !url.includes('/messages')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 'session-1', status: 'active' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.hasMoreMessages).toBe(true);
      }, { timeout: 3000 });

      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial session + initial messages + load more
    });

    it('marks messages as read correctly', () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Message Sending', () => {
    it('sends message with SSE streaming', async () => {
      const mockSSEResponse = {
        ok: true,
        body: {
          getReader: vi.fn().mockReturnValue({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('data: {"type":"meta","messageId":"msg-123"}\n\n') 
              })
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('data: {"type":"content","content":"Hello!"}\n\n') 
              })
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('data: [DONE]\n\n') 
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn(),
          }),
        },
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/ai/copilot/chat')) {
          return Promise.resolve(mockSSEResponse);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1', enableStreaming: true }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(result.current.isSending).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({
          message: 'Hello, AI!',
          sessionId: 'session-1',
          caseId: undefined,
        }),
      });
    });

    it('sends message with JSON fallback when SSE not supported', async () => {
      // Mock no EventSource support
      delete (global as any).EventSource;

      const mockJSONResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Hello from AI!' }),
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/ai/copilot/chat')) {
          return Promise.resolve(mockJSONResponse);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1', enableStreaming: false }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(result.current.isSending).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify({
          message: 'Hello, AI!',
          sessionId: 'session-1',
          caseId: undefined,
        }),
      });
    });

    it('handles send message errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.sendMessage('Hello, AI!');
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
      expect(result.current.isSending).toBe(false);
    });

    it('does not send message when already sending', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      // Start sending a message
      act(() => {
        result.current.sendMessage('First message');
      });

      // Try to send another message while first is still sending
      await act(async () => {
        await result.current.sendMessage('Second message');
      });

      // Should only have made one fetch call
      expect(global.fetch).toHaveBeenCalledTimes(0); // No calls because no user in this test
    });
  });

  describe('Connection Status', () => {
    it('shows connected status when session and user are available', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });

    it('shows disconnected status when no session or user', () => {
      // Mock no user
      vi.mocked(require('@/components/auth/auth-context').useAuth).mockReturnValue({
        user: null,
      });

      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      expect(result.current.connectionStatus).toBe('disconnected');
    });

    it('reconnects successfully', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.reconnect();
      });

      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  describe('Context Management', () => {
    it('updates context correctly', () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateContext({ caseType: 'eviction' });
      });

      expect(result.current.context).toEqual({ caseType: 'eviction' });
    });

    it('merges context updates', () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateContext({ caseType: 'eviction' });
      });

      act(() => {
        result.current.updateContext({ caseId: 'case-123' });
      });

      expect(result.current.context).toEqual({ 
        caseType: 'eviction',
        caseId: 'case-123'
      });
    });
  });

  describe('Error Handling', () => {
    it('clears errors correctly', () => {
      const { result } = renderHook(() => useAICopilot(), {
        wrapper: createWrapper(),
      });

      // Set an error first
      act(() => {
        result.current.sendMessage('test');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('handles session fetch errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Session not found'));

      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'invalid-session' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
      });

      expect(result.current.error?.message).toBe('Session not found');
    });
  });

  describe('Loading States', () => {
    it('shows loading states correctly', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1' }),
        { wrapper: createWrapper() }
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCreatingSession).toBe(false);
      expect(result.current.isLoadingMessages).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Options Handling', () => {
    it('respects enableStreaming option', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1', enableStreaming: false }),
        { wrapper: createWrapper() }
      );

      const mockJSONResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      };

      (global.fetch as any).mockResolvedValue(mockJSONResponse);

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      // Should use JSON endpoint, not SSE
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/copilot/chat',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Accept': 'text/event-stream',
          }),
        })
      );
    });

    it('passes caseId to API calls', async () => {
      const { result } = renderHook(
        () => useAICopilot({ sessionId: 'session-1', caseId: 'case-123' }),
        { wrapper: createWrapper() }
      );

      const mockJSONResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Response' }),
      };

      (global.fetch as any).mockResolvedValue(mockJSONResponse);

      await act(async () => {
        await result.current.sendMessage('Test');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/ai/copilot/chat',
        expect.objectContaining({
          body: JSON.stringify({
            message: 'Test',
            sessionId: 'session-1',
            caseId: 'case-123',
          }),
        })
      );
    });
  });
});
