'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Clock, AlertCircle, ArrowRight, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CaseConfirmationCard } from './CaseConfirmationCard';
import { SuggestionChips } from './SuggestionChips';
import { FormSession } from './FormSession';
import { ProgressIndicator } from './ProgressIndicator';
import { DocumentUpload } from './DocumentUpload';
import { ExtractionResultCard } from './ExtractionResultCard';
import { useAICopilot } from '@/lib/hooks/useAICopilot';
import { useAuth } from '@/components/auth/auth-context';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { useTranslations } from '@/lib/hooks/useTranslations';
import { LanguageSelector } from '@/components/ui/language-selector';
import { getSuggestionsForStage, shouldShowSuggestions } from '@/lib/ai/suggestionGenerator';
import { FailureResponseCard } from './FailureResponseCard';
import { useGracefulFailure } from '@/lib/hooks/useGracefulFailure';
import type { ExtractionResult } from '@/lib/ai/documentExtraction';
import type { Case } from '@/lib/db/types';
import { FormSuccessCard } from '@/components/forms/FormSuccessCard';
import type { FormCompletionResult } from './FormSession';
import { useQueryClient } from '@tanstack/react-query';

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
    formSuggestion?: {
      formId: string;
      reason: string;
    };
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

interface CompletedFormContext {
  formId: string;
  formTitle: string;
  fields: Record<string, unknown>;
  caseNumber?: string;
  hearingDate?: Date | string | null;
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
  const { t } = useTranslations();
  
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
      <span className="text-sm text-gray-600">{t('aiCopilot.typing')}</span>
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
  const { t } = useTranslations();
  
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { color: 'text-green-500', label: t('aiCopilot.connected') };
      case 'connecting':
        return { color: 'text-yellow-500', label: t('aiCopilot.connecting') };
      case 'disconnected':
        return { color: 'text-red-500', label: t('aiCopilot.disconnected') };
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
  const queryClient = useQueryClient();
  const { detectAndSetLanguage } = useLanguage();
  const { t } = useTranslations();
  const gracefulFailure = useGracefulFailure();
  const [inputValue, setInputValue] = useState('');
  const [formSessionActive, setFormSessionActive] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [caseData] = useState<Case | undefined>(undefined);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [completedFormContext, setCompletedFormContext] = useState<CompletedFormContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use the AI Copilot hook for proper authentication and message handling
  // Use initialSessionId if provided, otherwise auto-create a session
  const {
    sessionId,
    messages: aiMessages,
    sendMessage,
    isSending,
    connectionStatus: aiConnectionStatus,
    error,
    isLoading,
    conversationStage,
    collectedInfo,
  } = useAICopilot({
    sessionId: initialSessionId,
    caseId,
    autoCreateSession: !initialSessionId, // Only auto-create if no sessionId provided
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

  // Check for form suggestions in messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Check if the assistant suggested a form
      if (lastMessage.author === 'assistant' && lastMessage.content) {
        // Look for form suggestion pattern in the message
        const formSuggestionPattern = /"formSuggestion":\s*{[^}]+}/;
        const match = lastMessage.content.match(formSuggestionPattern);
        
        if (match) {
          try {
            // Extract and parse the JSON object
            const jsonStr = `{${match[0]}}`;
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.formSuggestion?.formId) {
              // Store the form suggestion for potential activation
              setActiveFormId(parsed.formSuggestion.formId);
              
              // Auto-show form if user just asked for it
              const previousUserMessage = messages[messages.length - 2];
              if (previousUserMessage?.author === 'user' && 
                  previousUserMessage.content.toLowerCase().includes('yes') ||
                  previousUserMessage.content.toLowerCase().includes('help me fill')) {
                setFormSessionActive(true);
              }
            }
          } catch (e) {
            console.log('Could not parse form suggestion:', e);
          }
        }
      }
      
      // Check if user is accepting a form suggestion
      if (lastMessage.author === 'user' && activeFormId && !formSessionActive) {
        const userResponse = lastMessage.content.toLowerCase();
        if (userResponse.includes('yes') || 
            userResponse.includes('sure') || 
            userResponse.includes('ok') ||
            userResponse.includes('help me') ||
            userResponse.includes('fill it out')) {
          setFormSessionActive(true);
        }
      }
    }
  }, [messages, activeFormId, formSessionActive]);

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

  useEffect(() => {
    if (formSessionActive) {
      setCompletedFormContext(null);
    }
  }, [formSessionActive]);

  // Get context-aware suggestion chips based on conversation state
  const suggestions = getSuggestionsForStage(
    conversationStage || 'GREET',
    collectedInfo || {}
  );
  const showSuggestions = shouldShowSuggestions(
    conversationStage || 'GREET',
    collectedInfo || {}
  );

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

    // Check for graceful failure test command
    if (messageContent.toLowerCase().includes('test failure')) {
        // Generate failure response for testing
        gracefulFailure.generateFailureResponse(
        messageContent,
        messages.map(msg => ({
          id: msg.id,
          sessionId: sessionId || '',
          author: msg.author,
          content: msg.content,
          createdAt: msg.timestamp,
          meta: { status: 'sent' }
        }))
      );
      return; // Don't send the actual message
    }

    try {
      // Story 13.35: Detect language from user message
      await detectAndSetLanguage(messageContent);
      
      console.log('📤 Calling sendMessage with:', messageContent);
      await sendMessage(messageContent);
      console.log('✅ sendMessage completed');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      // For now, we'll implement graceful failure as a manual trigger
      // In a real implementation, this would be triggered by AI response analysis
      // TODO: Integrate with AI response content analysis
    }
  };

  const handleDownloadComplete = useCallback((
    _info?: { downloadUrl: string; fileName: string }
  ) => {
    if (!caseId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["completedForms", caseId] });
  }, [caseId, queryClient]);


  // Handle document upload and extraction
  const handleFileSelect = async (file: File) => {
    if (!user) return;

    setIsProcessingDocument(true);
    setShowDocumentUpload(false);

    try {
      // Get auth token
      const idToken = await user.getIdToken();

      // Create FormData to send file
      const formData = new FormData();
      formData.append('file', file);

      // Call extraction API
      const response = await fetch('/api/ai/extract-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.status}`);
      }

      const result: ExtractionResult = await response.json();

      if (result.success) {
        setExtractionResult(result);
      } else {
        console.error('Extraction failed:', result.error);
        await sendMessage(
          `I tried to extract information from your document, but encountered an error: ${result.error || 'Unknown error'}. Please try uploading a clearer image or typing the information manually.`
        );
      }
    } catch (error) {
      console.error('Document processing error:', error);
      await sendMessage(
        'Sorry, I had trouble processing your document. Please try again or type the information manually.'
      );
    } finally {
      setIsProcessingDocument(false);
    }
  };

  // Handle extraction confirmation
  const handleExtractionConfirm = async (data: Partial<ExtractionResult>) => {
    setExtractionResult(null);

    // Build a message summarizing the extracted data
    const parts: string[] = [];
    if (data.caseType) parts.push(`Case Type: ${data.caseType}`);
    if (data.caseNumber) parts.push(`Case Number: ${data.caseNumber}`);
    if (data.hearingDate) parts.push(`Hearing Date: ${data.hearingDate}`);
    if (data.courtName) parts.push(`Court: ${data.courtName}`);
    if (data.jurisdiction) parts.push(`Jurisdiction: ${data.jurisdiction}`);

    const summary = parts.join('\n');
    await sendMessage(
      `I extracted the following information from your document:\n\n${summary}\n\nPlease confirm this is correct, and I'll help you create your case.`
    );
  };

  // Handle extraction rejection
  const handleExtractionReject = async () => {
    setExtractionResult(null);
    await sendMessage(
      'No problem. Please tell me about your case, and I\'ll help you get started.'
    );
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
                  {t('aiCopilot.title')}
                </h2>
                <ConnectionStatusIndicator status={aiConnectionStatus} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector variant="dropdown" showLabel={false} className="text-sm" />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close chat panel"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages area or Form Session */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {formSessionActive && activeFormId ? (
              <FormSession
                formId={activeFormId}
                caseId={caseId || ''}
                caseData={caseData}
                onComplete={async ({ fields, template }: FormCompletionResult) => {
                  setFormSessionActive(false);

                  const completedFormId = activeFormId ?? template?.formId ?? 'form';
                  const resolvedTitle = template?.title || formatFormTitle(completedFormId);
                  const caseNumberValue = extractCaseNumberFromFields(fields);
                  const hearingDateValue = extractHearingDateFromFields(fields);

                  setCompletedFormContext({
                    formId: completedFormId,
                    formTitle: resolvedTitle,
                    fields,
                    caseNumber: caseNumberValue,
                    hearingDate: hearingDateValue,
                  });

                  await sendMessage(
                    `Form completed! The ${resolvedTitle} form is ready. Use the download button above to get your PDF.`
                  );

                  setActiveFormId(null);
                }}
                onCancel={() => {
                  setFormSessionActive(false);
                  // Optionally send a message that form was cancelled
                  sendMessage('Form filling cancelled. How else can I help you?');
                }}
              />
            ) : (
              <>
                {completedFormContext && caseId && (
                  <FormSuccessCard
                    formId={completedFormContext.formId}
                    formTitle={completedFormContext.formTitle}
                    caseId={caseId}
                    fields={completedFormContext.fields}
                    caseNumber={completedFormContext.caseNumber}
                    hearingDate={completedFormContext.hearingDate ?? null}
                    onDownloadComplete={handleDownloadComplete}
                  />
                )}

                {/* Progress Indicator - show during gathering stages */}
                {conversationStage &&
                 (conversationStage === 'GREET' || conversationStage === 'GATHER_MIN') && (
                  <ProgressIndicator
                    collectedInfo={collectedInfo || {}}
                    isVisible={true}
                  />
                )}

                {/* Show extraction result card if available */}
                {extractionResult && (
                  <ExtractionResultCard
                    result={extractionResult}
                    onConfirm={handleExtractionConfirm}
                    onReject={handleExtractionReject}
                    className="mb-4"
                  />
                )}

                {/* Show document upload UI if toggled */}
                {showDocumentUpload && (
                  <DocumentUpload
                    onFileSelect={handleFileSelect}
                    isProcessing={isProcessingDocument}
                    disabled={isSending}
                    className="mb-4"
                  />
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div>
                      <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('aiCopilot.welcome')}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {t('aiCopilot.welcomeMessage')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </>
                )}

                {isSending && <TypingIndicator />}
                
                {/* Graceful Failure Response */}
                {gracefulFailure.currentFailureResponse && (
                  <div className="mt-4">
                    <FailureResponseCard
                      response={gracefulFailure.currentFailureResponse}
                      onOptionSelect={gracefulFailure.handleFailureOption}
                    />
                  </div>
                )}
                {isProcessingDocument && (
                  <motion.div
                    variants={typingVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg max-w-xs"
                  >
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600">{t('aiCopilot.processingDocument')}</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area - hide when form session is active */}
          {!formSessionActive && (
            <div className="border-t border-gray-200 p-4">
              {/* Context-aware suggestion chips */}
              {showSuggestions && suggestions.length > 0 && (
                <SuggestionChips
                  chips={suggestions}
                  onSelect={async (value: string) => {
                    // Send the suggested message
                    await sendMessage(value);
                  }}
                  maxVisible={5}
                />
              )}

              <div className="flex items-end space-x-2 mt-2">
                <button
                  onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                  disabled={isSending || isProcessingDocument}
                  className={cn(
                    'p-2 border border-gray-300 rounded-lg transition-colors',
                    showDocumentUpload
                      ? 'bg-blue-50 text-blue-600 border-blue-300'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                  aria-label={t('aiCopilot.uploadDocument')}
                  title={t('aiCopilot.uploadDocument')}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('aiCopilot.placeholder')}
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
                aria-label={t('aiCopilot.sendMessage')}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPanel;

function formatFormTitle(identifier: string): string {
  return identifier
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractCaseNumberFromFields(fields: Record<string, unknown>): string | undefined {
  const candidateKeys = [
    'case_number',
    'caseNumber',
    'case_num',
    'caseNum',
    'CaseNumber',
  ];

  for (const key of candidateKeys) {
    const value = fields[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function extractHearingDateFromFields(fields: Record<string, unknown>): Date | null {
  const candidateKeys = [
    'hearing_date',
    'hearingDate',
    'next_hearing_date',
    'nextHearingDate',
  ];

  for (const key of candidateKeys) {
    const value = fields[key];
    const asDate = coerceDate(value);
    if (asDate) {
      return asDate;
    }
  }

  return null;
}

function coerceDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    try {
      const derived = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(derived.getTime()) ? null : derived;
    } catch {
      return null;
    }
  }

  return null;
}
