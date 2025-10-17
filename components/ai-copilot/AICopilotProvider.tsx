'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatWidget, ChatPanel } from './index';
import { useAICopilot } from '@/lib/hooks/useAICopilot';

interface AICopilotContextType {
  isOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

export function useAICopilotContext() {
  const context = useContext(AICopilotContext);
  if (!context) {
    throw new Error('useAICopilotContext must be used within an AICopilotProvider');
  }
  return context;
}

interface AICopilotProviderProps {
  children: React.ReactNode;
  caseId?: string;
  hideWidget?: boolean; // Hide the floating chat button
}

export function AICopilotProvider({ children, caseId, hideWidget = false }: AICopilotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize AI Copilot hook
  const {
    sessionId,
    unreadCount,
    connectionStatus
  } = useAICopilot({
    caseId,
    autoCreateSession: true,
    enableStreaming: true
  });

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle chat
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        toggleChat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleChat]);

  const contextValue: AICopilotContextType = {
    isOpen,
    toggleChat,
    closeChat,
    openChat
  };

  return (
    <AICopilotContext.Provider value={contextValue}>
      {children}

      {/* AI Copilot UI Components - only show if not hidden */}
      {!hideWidget && (
        <>
          <ChatWidget
            isOpen={isOpen}
            onToggle={toggleChat}
            unreadCount={unreadCount}
            connectionStatus={connectionStatus}
          />

          <ChatPanel
            isOpen={isOpen}
            onClose={closeChat}
            sessionId={sessionId || undefined}
            caseId={caseId}
          />
        </>
      )}
    </AICopilotContext.Provider>
  );
}
