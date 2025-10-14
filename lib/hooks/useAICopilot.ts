'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  useQuery, 
  useMutation, 
  useInfiniteQuery, 
  useQueryClient
} from '@tanstack/react-query';
import { useAuth } from '@/components/auth/auth-context';
import type { 
  AISession, 
  AIMessage, 
  CreateSessionInput,
  AIPromptContext,
  UserPreferences 
} from '@/lib/ai/types';
import { 
  createSession, 
  getSession, 
  appendMessage, 
  listMessages,
  type ListMessagesOptions,
  type PaginatedMessages 
} from '@/lib/db/aiSessionsRepo';

/**
 * Connection status for AI Copilot
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

/**
 * Options for useAICopilot hook
 */
export interface UseAICopilotOptions {
  sessionId?: string;
  caseId?: string;
  autoCreateSession?: boolean;
  enableStreaming?: boolean;
}

/**
 * Options for creating a new session
 */
export interface CreateSessionOptions {
  caseId?: string;
  context?: Partial<AIPromptContext>;
  preferences?: Partial<UserPreferences>;
}

/**
 * Return type for useAICopilot hook
 */
export interface UseAICopilotReturn {
  // Session management
  session: AISession | null;
  sessionId: string | null;
  createSession: (options?: CreateSessionOptions) => Promise<string>;
  switchSession: (sessionId: string) => Promise<void>;
  
  // Message management
  messages: AIMessage[];
  unreadCount: number;
  hasMoreMessages: boolean;
  loadMoreMessages: () => Promise<void>;
  markAsRead: () => void;
  
  // Message sending
  sendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  
  // Connection status
  connectionStatus: ConnectionStatus;
  reconnect: () => Promise<void>;
  
  // Context awareness
  context: AIPromptContext | null;
  updateContext: (context: Partial<AIPromptContext>) => void;
  
  // Error handling
  error: Error | null;
  clearError: () => void;
  
  // Demo mode
  isDemoMode: boolean;
  
  // Loading states
  isLoading: boolean;
  isCreatingSession: boolean;
  isLoadingMessages: boolean;
}

/**
 * Query keys for React Query
 */
const queryKeys = {
  session: (id: string) => ['aiSession', id] as const,
  messages: (sessionId: string) => ['aiMessages', sessionId] as const,
  context: (caseId?: string) => ['aiContext', caseId ?? 'none'] as const,
  connection: () => ['aiConnection'] as const,
};

/**
 * AI Copilot React Hook
 * 
 * Provides a comprehensive interface for managing AI Copilot sessions,
 * messages, and real-time streaming functionality.
 * 
 * @param options - Configuration options for the hook
 * @returns Hook state and methods for AI Copilot interaction
 */
export function useAICopilot(options: UseAICopilotOptions = {}): UseAICopilotReturn {
  const {
    sessionId: providedSessionId,
    caseId,
    autoCreateSession = true,
    enableStreaming = true
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(providedSessionId || null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [context, setContext] = useState<AIPromptContext | null>(null);

  // Demo mode detection
  const isDemoMode = useMemo(() => {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname.includes('demo') ||
           !user;
  }, [user]);

  // Session query
  const sessionQuery = useQuery({
    queryKey: queryKeys.session(currentSessionId || 'current'),
    queryFn: async () => {
      if (!currentSessionId || !user) return null;
      
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/ai/sessions/${currentSessionId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.status}`);
      }

      return await response.json();
    },
    enabled: !!currentSessionId && !!user && !isDemoMode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Messages query (infinite)
  const messagesQuery = useInfiniteQuery({
    queryKey: queryKeys.messages(currentSessionId || ''),
    queryFn: async ({ pageParam }) => {
      if (!currentSessionId || !user) {
        return { items: [], hasMore: false, total: 0 };
      }

      const idToken = await user.getIdToken();
      const params = new URLSearchParams({
        limit: '20',
      });
      
      if (pageParam && typeof pageParam === 'string') {
        params.set('after', pageParam);
      }

      const response = await fetch(`/api/ai/sessions/${currentSessionId}/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      return await response.json();
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.items || lastPage.items.length === 0) {
        return undefined;
      }
      return lastPage.hasMore ? lastPage.items[lastPage.items.length - 1]?.createdAt : undefined;
    },
    initialPageParam: undefined,
    enabled: !!currentSessionId && !!user && !isDemoMode,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (options: CreateSessionOptions = {}) => {
      if (!user) throw new Error('User not authenticated');

      const idToken = await user.getIdToken();
      const response = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          caseId: options.caseId || caseId,
          context: options.context,
          preferences: options.preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const result = await response.json();
      return result.sessionId;
    },
    onSuccess: (newSessionId) => {
      setCurrentSessionId(newSessionId);
      setError(null);
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: queryKeys.session(newSessionId) });
    },
    onError: (err) => {
      console.error('Create session error:', err);
      setError(err);
    },
  });

  // Auto-create session if needed
  useEffect(() => {
    if (autoCreateSession && !currentSessionId && !isDemoMode && user && !createSessionMutation.isPending) {
      createSessionMutation.mutate({ caseId });
    }
  }, [autoCreateSession, currentSessionId, isDemoMode, user, caseId, createSessionMutation]);

  // Flatten messages from infinite query
  const messages = useMemo(() => {
    if (!messagesQuery.data) return [];
    return messagesQuery.data.pages.flatMap(page => page.items);
  }, [messagesQuery.data]);

  // Connection status management
  useEffect(() => {
    if (currentSessionId && user && !isDemoMode) {
      setConnectionStatus('connected');
    } else if (isDemoMode) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [currentSessionId, user, isDemoMode]);

  // Message sending with SSE streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || !user || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      
      // Optimistic update - add user message immediately
      const userMessage: AIMessage = {
        id: `temp_${Date.now()}`,
        sessionId: currentSessionId,
        author: 'user',
        content,
        createdAt: Date.now(),
        meta: { status: 'sending' }
      };

      // Add optimistic message to cache
      queryClient.setQueryData(
        queryKeys.messages(currentSessionId),
        (old: any) => {
          if (!old) return { pages: [{ items: [userMessage], hasMore: false, total: 1 }] };
          const newPages = [...old.pages];
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              items: [userMessage, ...newPages[0].items]
            };
          }
          return { ...old, pages: newPages };
        }
      );

      if (enableStreaming && typeof EventSource !== 'undefined') {
        // Use SSE streaming
        await handleSSEResponse(content, currentSessionId, idToken);
      } else {
        // Fallback to JSON response
        await handleJSONResponse(content, currentSessionId, idToken);
      }

      // Mark message as sent
      queryClient.setQueryData(
        queryKeys.messages(currentSessionId),
        (old: any) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: AIMessage) =>
              msg.id === userMessage.id
                ? { ...msg, meta: { ...msg.meta, status: 'sent' } }
                : msg
            )
          }));
          return { ...old, pages: newPages };
        }
      );

    } catch (err) {
      console.error('Send message error:', err);
      setError(err as Error);
      
      // Mark message as failed
      queryClient.setQueryData(
        queryKeys.messages(currentSessionId),
        (old: any) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: AIMessage) =>
              msg.id === `temp_${Date.now()}`
                ? { ...msg, meta: { ...msg.meta, status: 'failed' } }
                : msg
            )
          }));
          return { ...old, pages: newPages };
        }
      );
    } finally {
      setIsSending(false);
    }
  }, [currentSessionId, user, isSending, enableStreaming, queryClient]);

  // SSE response handler
  const handleSSEResponse = async (content: string, sessionId: string, idToken: string) => {
    const response = await fetch('/api/ai/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        message: content,
        sessionId,
        caseId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let assistantMessageId = '';
    let assistantContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // Finalize message
              const finalMessage: AIMessage = {
                id: assistantMessageId,
                sessionId,
                author: 'assistant',
                content: assistantContent,
                createdAt: Date.now(),
                meta: { status: 'sent' }
              };

              // Add assistant message to cache
              queryClient.setQueryData(
                queryKeys.messages(sessionId),
                (old: any) => {
                  if (!old) return { pages: [{ items: [finalMessage], hasMore: false, total: 1 }] };
                  const newPages = [...old.pages];
                  if (newPages.length > 0) {
                    newPages[0] = {
                      ...newPages[0],
                      items: [finalMessage, ...newPages[0].items]
                    };
                  }
                  return { ...old, pages: newPages };
                }
              );

              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'meta') {
                assistantMessageId = parsed.messageId;
              } else if (parsed.type === 'content') {
                assistantContent += parsed.content;

                // Update streaming message in cache
                queryClient.setQueryData(
                  queryKeys.messages(sessionId),
                  (old: any) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page: any) => ({
                      ...page,
                      items: page.items.map((msg: AIMessage) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantContent, meta: { ...msg.meta, status: 'streaming' } }
                          : msg
                      )
                    }));
                    return { ...old, pages: newPages };
                  }
                );
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  // JSON response handler (fallback)
  const handleJSONResponse = async (content: string, sessionId: string, idToken: string) => {
    const response = await fetch('/api/ai/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        message: content,
        sessionId,
        caseId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Add assistant response
    const assistantMessage: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      author: 'assistant',
      content: data.message || data.content || 'I understand your question. Please consult with an attorney for legal advice.',
      createdAt: Date.now(),
      meta: { status: 'sent' }
    };

    // Add assistant message to cache
    queryClient.setQueryData(
      queryKeys.messages(sessionId),
      (old: any) => {
        if (!old) return { pages: [{ items: [assistantMessage], hasMore: false, total: 1 }] };
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            items: [assistantMessage, ...newPages[0].items]
          };
        }
        return { ...old, pages: newPages };
      }
    );
  };

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      await messagesQuery.fetchNextPage();
    }
  }, [messagesQuery]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update context
  const updateContext = useCallback((newContext: Partial<AIPromptContext>) => {
    setContext(prev => prev ? { ...prev, ...newContext } : newContext as AIPromptContext);
  }, []);

  // Reconnect
  const reconnect = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      // Invalidate queries to force refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.session(currentSessionId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(currentSessionId || '') });
      setConnectionStatus('connected');
    } catch (err) {
      setError(err as Error);
      setConnectionStatus('disconnected');
    }
  }, [currentSessionId, queryClient]);

  // Switch session
  const switchSession = useCallback(async (newSessionId: string) => {
    setCurrentSessionId(newSessionId);
    setUnreadCount(0);
    setError(null);
  }, []);

  return {
    // Session management
    session: sessionQuery.data || null,
    sessionId: currentSessionId,
    createSession: (options?: CreateSessionOptions) => createSessionMutation.mutateAsync(options || {}),
    switchSession,
    
    // Message management
    messages,
    unreadCount,
    hasMoreMessages: messagesQuery.hasNextPage || false,
    loadMoreMessages,
    markAsRead,
    
    // Message sending
    sendMessage,
    isSending,
    
    // Connection status
    connectionStatus,
    reconnect,
    
    // Context awareness
    context,
    updateContext,
    
    // Error handling
    error,
    clearError,
    
    // Demo mode
    isDemoMode,
    
    // Loading states
    isLoading: sessionQuery.isLoading || messagesQuery.isLoading,
    isCreatingSession: createSessionMutation.isPending,
    isLoadingMessages: messagesQuery.isFetching,
  };
}
