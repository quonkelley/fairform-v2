'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CaseConfirmationCard } from './CaseConfirmationCard';
import { SuggestionChips, type SuggestionChip } from './SuggestionChips';
import { useAICopilot } from '@/lib/hooks/useAICopilot';
import { useAuth } from '@/components/auth/auth-context';

export type Message = {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed';
  type?: 'normal' | 'confirmation';
  meta?: {
    tokensIn?: number;
    tokensOut?: number;
    latencyMs?: number;
    model?: string;
    blocked?: boolean;
    caseType?: string;
    details?: Record<string, string | undefined>;
    readinessScore?: number;
  };
};

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  caseId?: string;
  className?: string;
}

// Animation variants for the panel
const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};

// Animation variants for the backdrop
const backdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Animation variants for messages
const messageVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

// Animation variants for typing indicator
const typingVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.15,
    },
  },
};

// Helper function to render message content with case links
const renderMessageContent = (content: string) => {
  // Check for case link pattern: [View your case →](/cases/[caseId]) or **[View your case →](/cases/[caseId])**
  const linkPattern = /\*?\*?\[([^\]]+)\]\((\/cases\/[^)]+)\)\*?\*?/g;
  const matches = Array.from(content.matchAll(linkPattern));

  if (matches.length === 0) {
    // No links found, render as plain text with line breaks preserved
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }

  // Split content and render links as buttons
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, idx) => {
    const [fullMatch, linkText, href] = match;
    const matchIndex = match.index || 0;

    // Add text before the link
    if (matchIndex > lastIndex) {
      const textBefore = content.substring(lastIndex, matchIndex);
      parts.push(
        <span key={`text-${idx}`} className="whitespace-pre-wrap break-words">
          {textBefore}
        </span>
      );
    }

    // Add the link as a button
    parts.push(
      <Link
        key={`link-${idx}`}
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 my-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        {linkText}
        <ArrowRight className="w-4 h-4" />
      </Link>
    );

    lastIndex = matchIndex + fullMatch.length;
  });

  // Add any remaining text after the last link
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    parts.push(
      <span key="text-end" className="whitespace-pre-wrap break-words">
        {textAfter}
      </span>
    );
  }

  return <div className="flex flex-col items-start gap-1">{parts}</div>;
};

// Typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      variants={typingVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg max-w-xs"
    >
      <Bot className="w-5 h-5 text-blue-600" />
      <div className="flex space-x-1">
        <motion.div
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-sm text-gray-600">AI is typing...</span>
    </motion.div>
  );
};

// Message component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.author === 'user';
  const isFailed = message.status === 'failed';
  const isConfirmation = message.type === 'confirmation' && message.meta?.caseType && message.meta?.details;

  // Render confirmation card for confirmation type messages
  if (isConfirmation && message.meta && message.meta.caseType && message.meta.details) {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className="flex justify-start mb-4"
      >
        <div className="flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg w-full">
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">
            <Bot className="w-4 h-4" />
          </div>

          {/* Confirmation card */}
          <div className="flex-1">
            <CaseConfirmationCard
              caseType={message.meta.caseType}
              details={message.meta.details}
            />
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500 px-2">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Regular message rendering
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className={cn(
        'flex mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg',
          isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <div
            className={cn(
              'px-4 py-2 rounded-lg',
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900',
              isFailed && 'bg-red-100 text-red-900 border border-red-200'
            )}
          >
            <div className="text-sm">
              {renderMessageContent(message.content)}
            </div>
          </div>

          {/* Message metadata */}
          <div
            className={cn(
              'flex items-center space-x-1 mt-1 text-xs text-gray-500',
              isUser ? 'justify-end' : 'justify-start'
            )}
          >
            <Clock className="w-3 h-3" />
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isFailed && (
              <>
                <span>•</span>
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-red-500">Failed to send</span>
              </>
            )}
            {message.status === 'sending' && (
              <>
                <span>•</span>
                <span className="text-blue-500">Sending...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Connection status indicator
const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'text-green-500', label: 'Connected' };
      case 'connecting':
        return { color: 'text-yellow-500', label: 'Connecting...' };
      case 'disconnected':
        return { color: 'text-red-500', label: 'Disconnected' };
      default:
        return { color: 'text-gray-500', label: 'Unknown' };
    }
  };

  const { color, label } = getStatusInfo();

  return (
    <div className="flex items-center space-x-2">
      <div className={cn('w-2 h-2 rounded-full', color.replace('text-', 'bg-'))} />
      <span className={cn('text-xs', color)}>{label}</span>
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  sessionId: initialSessionId,
  caseId,
  className,
}) => {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestionChips, setShowSuggestionChips] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use the AI Copilot hook for proper authentication and message handling
  // Don't auto-create session here - let the provider handle that
  const {
    sessionId,
    messages: aiMessages,
    sendMessage,
    isSending,
    connectionStatus: aiConnectionStatus,
    error,
    isLoading,
  } = useAICopilot({
    sessionId: initialSessionId,
    caseId,
    autoCreateSession: false, // Disable auto-creation to avoid duplicate sessions
    enableStreaming: true,
  });

  // Debug logging for hook state
  useEffect(() => {
    console.log('🔍 useAICopilot hook state:', {
      sessionId,
      user: user?.uid,
      isSending,
      connectionStatus: aiConnectionStatus,
      error: error?.message,
      isLoading,
      messagesCount: aiMessages.length
    });
  }, [sessionId, user, isSending, aiConnectionStatus, error, isLoading, aiMessages.length]);

  // Convert AI messages to ChatPanel message format
  const messages: Message[] = aiMessages
    .filter(msg => msg.author === 'user' || msg.author === 'assistant') // Filter out system messages
    .map(msg => ({
      id: msg.id,
      author: msg.author as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
      status: msg.meta?.status === 'sending' ? 'sending' :
              msg.meta?.status === 'failed' ? 'failed' : 'sent',
      type: 'normal' as const,
      meta: msg.meta,
    }));

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Add proactive greeting with suggestion chips
  useEffect(() => {
    if (isOpen && messages.length === 0 && !sessionStorage.getItem('ff_greeted')) {
      setShowSuggestionChips(true);
      sessionStorage.setItem('ff_greeted', '1');
    }
  }, [isOpen, messages.length]);

  // Suggestion chips data
  const suggestionChips: SuggestionChip[] = [
    {
      id: 'eviction',
      text: 'I got an eviction notice',
      onClick: () => {
        setInputValue('I got an eviction notice');
        setShowSuggestionChips(false);
      }
    },
    {
      id: 'hearing',
      text: 'My hearing is next week',
      onClick: () => {
        setInputValue('My hearing is next week');
        setShowSuggestionChips(false);
      }
    },
    {
      id: 'appearance',
      text: 'I need to file an appearance',
      onClick: () => {
        setInputValue('I need to file an appearance');
        setShowSuggestionChips(false);
      }
    }
  ];

  // Handle sending messages
  const handleSendMessage = async () => {
    console.log('🔍 handleSendMessage called', {
      inputValue: inputValue.trim(),
      isSending,
      user: user?.uid,
      hasSendMessage: typeof sendMessage,
      sessionId
    });

    if (!inputValue.trim()) {
      console.log('❌ No input value');
      return;
    }
    if (isSending) {
      console.log('❌ Already sending');
      return;
    }
    if (!user) {
      console.log('❌ No user');
      return;
    }

    const messageContent = inputValue.trim();
    setInputValue('');
    setShowSuggestionChips(false); // Hide chips on first user interaction

    try {
      console.log('📤 Calling sendMessage with:', messageContent);
      await sendMessage(messageContent);
      console.log('✅ sendMessage completed');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };


  // Handle Enter key (send) vs Shift+Enter (new line)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          className={cn(
            'bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-xl h-[80vh] sm:h-[600px] flex flex-col',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  AI Copilot
                </h2>
                <ConnectionStatusIndicator status={aiConnectionStatus} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close chat panel"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div>
                  <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to AI Copilot
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Hi! I&apos;m FairForm. Tell me what happened or upload a photo of your court notice. I&apos;ll create your case and show next steps in under 2 minutes.
                  </p>
                  {showSuggestionChips && (
                    <SuggestionChips 
                      chips={suggestionChips}
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {showSuggestionChips && (
                  <SuggestionChips 
                    chips={suggestionChips}
                  />
                )}
              </>
            )}
            
            {isSending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  disabled={isSending}
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                  }}
                />
              </div>
              <button
                onClick={() => {
                  console.log('🔘 Send button clicked');
                  handleSendMessage();
                }}
                disabled={!inputValue.trim() || isSending}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPanel;
