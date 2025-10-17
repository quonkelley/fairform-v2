'use client';

import { useState, useCallback } from 'react';
import { 
  FailureResponse, 
  FailureContext, 
  determineFailureLevel, 
  buildFailureResponse, 
  DEFAULT_CAPABILITIES 
} from '@/lib/ai/gracefulFailure';
import type { AIMessage } from '@/lib/ai/types';

export interface FailureAttempt {
  userMessage: string;
  timestamp: number;
  errorType: 'misunderstanding' | 'out_of_scope' | 'technical_error';
}

export function useGracefulFailure() {
  const [failureAttempts, setFailureAttempts] = useState<FailureAttempt[]>([]);
  const [currentFailureResponse, setCurrentFailureResponse] = useState<FailureResponse | null>(null);

  const trackFailureAttempt = useCallback((
    userMessage: string,
    errorType: 'misunderstanding' | 'out_of_scope' | 'technical_error' = 'misunderstanding'
  ) => {
    const attempt: FailureAttempt = {
      userMessage,
      timestamp: Date.now(),
      errorType
    };

    setFailureAttempts(prev => [...prev, attempt]);
  }, []);

  const generateFailureResponse = useCallback((
    userMessage: string,
    conversationHistory: AIMessage[],
    capabilities: string[] = DEFAULT_CAPABILITIES
  ): FailureResponse => {
    // Count attempts for this specific message
    const messageAttempts = failureAttempts.filter(
      attempt => attempt.userMessage === userMessage
    );
    
    const attemptCount = messageAttempts.length + 1;
    
    // Determine failure level
    const level = determineFailureLevel(attemptCount, 'misunderstanding');
    
    // Build context
    const context: FailureContext = {
      userMessage,
      conversationHistory,
      capabilities,
      attemptCount
    };
    
    // Generate response
    const response = buildFailureResponse(level, context);
    
    // Track this attempt
    trackFailureAttempt(userMessage, 'misunderstanding');
    
    return response;
  }, [failureAttempts, trackFailureAttempt]);

  const handleFailureOption = useCallback((action: string) => {
    switch (action) {
      case 'escalate_support':
        // TODO: Implement support escalation
        console.log('Escalating to support...');
        setCurrentFailureResponse(null);
        break;
        
      case 'show_alternatives':
        // Show alternatives menu
        const alternativesResponse = buildFailureResponse('alternatives', {
          userMessage: '',
          conversationHistory: [],
          capabilities: DEFAULT_CAPABILITIES,
          attemptCount: 1
        });
        setCurrentFailureResponse(alternativesResponse);
        break;
        
      default:
        if (action.startsWith('help_with_')) {
          // Handle capability selection
          const capability = action.replace('help_with_', '').replace(/_/g, ' ');
          console.log(`User selected help with: ${capability}`);
          setCurrentFailureResponse(null);
        }
        break;
    }
  }, []);

  const clearFailureState = useCallback(() => {
    setFailureAttempts([]);
    setCurrentFailureResponse(null);
  }, []);

  return {
    failureAttempts,
    currentFailureResponse,
    generateFailureResponse,
    handleFailureOption,
    clearFailureState,
    trackFailureAttempt
  };
}
