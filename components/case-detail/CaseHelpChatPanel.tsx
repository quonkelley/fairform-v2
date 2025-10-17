'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAICopilot } from '@/lib/hooks/useAICopilot';
import { useAuth } from '@/components/auth/auth-context';
import type { CaseStep } from '@/lib/validation';

export interface CaseHelpChatPanelProps {
  caseId: string;
  currentStep?: CaseStep;
  className?: string;
  initialMessage?: string;
  onMessageSent?: () => void;
}

type Message = {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'failed';
};

// Typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg max-w-xs"
    >
      <Bot className="w-4 h-4 text-primary" />
      <div className="flex space-x-1">
        <motion.div
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-muted-foreground">AI is typing...</span>
    </motion.div>
  );
};

// Message component
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.author === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('flex mb-3', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex items-start space-x-2 max-w-[85%]',
          isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
        </div>

        {/* Message content */}
        <div className="flex flex-col space-y-1">
          <div
            className={cn(
              'px-3 py-2 rounded-lg text-sm',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            )}
          >
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          </div>

          {/* Timestamp */}
          <div
            className={cn(
              'flex items-center space-x-1 text-xs text-muted-foreground px-1',
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Context-aware suggestions based on current step
const getStepSuggestions = (step?: CaseStep): string[] => {
  if (!step) return [
    "What should I do first?",
    "Help me understand this step",
    "What documents do I need?"
  ];

  const stepName = step.name.toLowerCase();

  if (stepName.includes('file') || stepName.includes('claim')) {
    return [
      "How do I file my claim?",
      "What forms do I need?",
      "Where do I file?",
      "What's the filing fee?"
    ];
  } else if (stepName.includes('serve') || stepName.includes('defendant')) {
    return [
      "How do I serve the defendant?",
      "Who can serve papers?",
      "What is proof of service?",
      "Can I mail the papers?"
    ];
  } else if (stepName.includes('prepare') || stepName.includes('hearing')) {
    return [
      "How should I prepare?",
      "What evidence do I need?",
      "Can I bring witnesses?",
      "What should I wear?"
    ];
  } else if (stepName.includes('court') || stepName.includes('attend')) {
    return [
      "What happens at the hearing?",
      "How do I present my case?",
      "What if I'm nervous?",
      "Can I record it?"
    ];
  } else if (stepName.includes('collect') || stepName.includes('judgment')) {
    return [
      "How do I collect my judgment?",
      "What if they won't pay?",
      "Can I garnish wages?",
      "How long do I have?"
    ];
  }

  return [
    `Help me with: ${step.name}`,
    "What do I need to do?",
    "What documents are required?",
    "How long will this take?"
  ];
};

export function CaseHelpChatPanel({ caseId, currentStep, className, initialMessage, onMessageSent }: CaseHelpChatPanelProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState(initialMessage || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    sessionId,
    messages: aiMessages,
    sendMessage,
    isSending,
  } = useAICopilot({
    caseId,
    autoCreateSession: true,
    enableStreaming: true,
  });

  // Convert AI messages to ChatPanel message format
  const messages: Message[] = aiMessages
    .filter(msg => msg.author === 'user' || msg.author === 'assistant')
    .map(msg => ({
      id: msg.id,
      author: msg.author as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
      status: msg.meta?.status === 'sending' ? 'sending' :
              msg.meta?.status === 'failed' ? 'failed' : 'sent',
    }));

  // Get context-aware suggestions
  const suggestions = getStepSuggestions(currentStep);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Send initial context message when current step changes
  useEffect(() => {
    if (currentStep && sessionId && messages.length === 0) {
      // Context is established via the caseId and will be handled by the AI copilot
      // No need to send an explicit welcome message
    }
  }, [currentStep, sessionId, messages.length]);

  // Auto-send initial message if provided
  useEffect(() => {
    if (initialMessage && sessionId && !isSending && messages.length === 0) {
      // Auto-send the initial message
      const sendInitialMessage = async () => {
        if (!initialMessage.trim() || isSending || !user) return;
        
        try {
          await sendMessage(initialMessage);
          onMessageSent?.(); // Notify parent that message was sent
        } catch (error) {
          console.error('Failed to send initial message:', error);
        }
      };
      sendInitialMessage();
    }
  }, [initialMessage, sessionId, isSending, messages.length, sendMessage, user, onMessageSent]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || !user) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    try {
      // Add context about current step to the message
      const contextualMessage = currentStep
        ? `[Current step: ${currentStep.name}] ${messageContent}`
        : messageContent;

      await sendMessage(contextualMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle Enter key (send) vs Shift+Enter (new line)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle suggestion chip click
  const handleSuggestionClick = async (suggestion: string) => {
    if (isSending) return;
    setInputValue(suggestion);
    // Optionally auto-send
    await sendMessage(currentStep ? `[Current step: ${currentStep.name}] ${suggestion}` : suggestion);
  };

  return (
    <div
      className={cn('flex flex-col h-full bg-card border border-border rounded-2xl shadow-sm', className)}
      aria-label="AI Help chat panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">AI Help</h2>
            <p className="text-xs text-muted-foreground">
              {currentStep ? `Helping with: ${currentStep.name}` : 'Ask me anything about your case'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              How can I help?
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {currentStep
                ? `Ask me about "${currentStep.name}" or choose a suggestion below.`
                : 'Ask me anything about your case.'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </>
        )}

        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips - show when no messages or after assistant responds */}
      {(messages.length === 0 || messages[messages.length - 1]?.author === 'assistant') && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 4).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isSending}
                className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this step..."
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={1}
              disabled={isSending}
              style={{
                minHeight: '36px',
                maxHeight: '96px',
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
