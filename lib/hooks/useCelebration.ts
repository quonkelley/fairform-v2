'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { celebrateCaseCreation, isFirstCase } from '@/lib/celebration/celebrationUtils';
import { NextStep } from '@/components/celebration/CelebrationModal';

export interface CelebrationState {
  isOpen: boolean;
  caseId: string | null;
  caseTitle: string | null;
  nextSteps: NextStep[];
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>({
    isOpen: false,
    caseId: null,
    caseTitle: null,
    nextSteps: []
  });
  
  const router = useRouter();

  const showCelebration = useCallback(async (
    caseId: string,
    caseTitle: string,
    userId: string
  ) => {
    try {
      // Check if this is the user's first case
      const isFirst = await isFirstCase(userId);
      
      // Show confetti only on first case
      if (isFirst) {
        celebrateCaseCreation();
      }

      // Prepare next steps
      const nextSteps: NextStep[] = [
        {
          title: 'View My Case',
          action: () => {
            router.push(`/cases/${caseId}`);
            setState(prev => ({ ...prev, isOpen: false }));
          }
        },
        {
          title: 'Start First Step',
          action: () => {
            router.push(`/cases/${caseId}/steps/1`);
            setState(prev => ({ ...prev, isOpen: false }));
          }
        },
        {
          title: 'Learn About FairForm',
          action: () => {
            router.push('/docs');
            setState(prev => ({ ...prev, isOpen: false }));
          }
        }
      ];

      setState({
        isOpen: true,
        caseId,
        caseTitle,
        nextSteps
      });
    } catch (error) {
      console.error('Error showing celebration:', error);
      // Still show the modal even if confetti fails
      setState({
        isOpen: true,
        caseId,
        caseTitle,
        nextSteps: [
          {
            title: 'View My Case',
            action: () => {
              router.push(`/cases/${caseId}`);
              setState(prev => ({ ...prev, isOpen: false }));
            }
          }
        ]
      });
    }
  }, [router]);

  const hideCelebration = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    showCelebration,
    hideCelebration
  };
}
