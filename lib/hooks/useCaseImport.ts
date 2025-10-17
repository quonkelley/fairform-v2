import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseDemoNotice, isNoticeFileSupported } from '@/lib/demo/importNotice';
import { resetDemoStorage, demoCasesRepo, demoStepsRepo, getDemoStorageState } from '@/lib/demo/demoRepos';
import type { ParseNoticeResult, ParsedNoticeResult } from '@/lib/demo/types';

interface UseCaseImportOptions {
  userId: string;
  onImportSuccess?: (caseId: string) => void;
}

interface ImportState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error: string | null;
  showReplaceConfirmation: boolean;
}

export function useCaseImport({ userId, onImportSuccess }: UseCaseImportOptions) {
  const router = useRouter();
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    progress: 0,
    error: null,
    showReplaceConfirmation: false,
  });

  // Check if there's already an imported case
  const hasExistingCase = useCallback(() => {
    const storageState = getDemoStorageState();
    return storageState.cases.length > 0;
  }, []);

  // Create case from parsed data
  const createImportedCase = useCallback(async (parsedData: ParsedNoticeResult) => {
    // Create the case
    const newCase = await demoCasesRepo.createCase({
      userId,
      caseType: parsedData.case.caseType,
      jurisdiction: parsedData.case.jurisdiction,
      title: parsedData.case.title,
      notes: parsedData.case.notes,
    });

    // Create steps based on timeline
    const steps = [
      {
        caseId: newCase.id,
        name: 'Review Notice',
        order: 1,
        dueDate: parsedData.timeline.noticeDate,
      },
      {
        caseId: newCase.id,
        name: 'File Answer',
        order: 2,
        dueDate: parsedData.timeline.responseDueDate,
      },
      {
        caseId: newCase.id,
        name: 'Prepare for Hearing',
        order: 3,
        dueDate: new Date(parsedData.timeline.hearingDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before hearing
      },
      {
        caseId: newCase.id,
        name: 'Attend Court Hearing',
        order: 4,
        dueDate: parsedData.timeline.hearingDate,
      },
    ];

    // Create all steps
    for (const stepData of steps) {
      await demoStepsRepo.createStep(stepData);
    }

    return newCase;
  }, [userId]);

  // Process file upload
  const processFile = useCallback(async (fileName: string) => {
    setState(prev => ({
      ...prev,
      status: 'processing',
      error: null,
      progress: 0,
    }));

    // Simulate progress
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 150);

    try {
      const startTime = Date.now();
      console.info('case-import:start', { fileName, timestamp: startTime });
      
      // Parse the notice
      const result: ParseNoticeResult = await parseDemoNotice(fileName);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Complete progress
      setState(prev => ({ ...prev, progress: 100 }));
      clearInterval(progressInterval);

      // Check if there's an existing case and show confirmation
      if (hasExistingCase()) {
        setPendingFile(fileName);
        setState(prev => ({
          ...prev,
          status: 'idle',
          showReplaceConfirmation: true,
        }));
        return;
      }

      // Create the case
      await createImportedCase(result.data);
      
      const elapsed = Date.now() - startTime;
      console.info('case-import:success', { 
        fileName, 
        caseId: result.data.case.caseNumber,
        timestamp: Date.now(),
        elapsed
      });

      setState(prev => ({ ...prev, status: 'success' }));
      
      // Navigate to dashboard after a brief success display
      setTimeout(() => {
        router.push('/dashboard');
        onImportSuccess?.(result.data.case.caseNumber);
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      console.info('case-import:error', { 
        fileName, 
        error: errorMessage,
        timestamp: Date.now()
      });

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
    }
  }, [hasExistingCase, createImportedCase, router, onImportSuccess]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    const fileName = file.name;

    // Validate file type
    if (!fileName.endsWith('.json')) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Please select a JSON file',
      }));
      return;
    }

    // Check if file is supported
    if (!isNoticeFileSupported(fileName)) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: `File '${fileName}' is not supported. Please use a supported notice file.`,
      }));
      return;
    }

    await processFile(fileName);
  }, [processFile]);

  // Store the pending file for replace confirmation
  const [pendingFile, setPendingFile] = useState<string | null>(null);

  // Handle replace confirmation
  const handleReplaceConfirm = useCallback(async () => {
    setState(prev => ({ ...prev, showReplaceConfirmation: false }));
    
    // Reset demo storage and proceed with import
    resetDemoStorage();
    
    // Process the pending file
    if (pendingFile) {
      await processFile(pendingFile);
      setPendingFile(null);
    } else {
      setState(prev => ({ ...prev, status: 'idle' }));
    }
  }, [pendingFile, processFile]);

  // Handle replace cancellation
  const handleReplaceCancel = useCallback(() => {
    setState(prev => ({ ...prev, showReplaceConfirmation: false }));
  }, []);

  // Reset to idle state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      showReplaceConfirmation: false,
    });
  }, []);

  return {
    state,
    handleFileSelect,
    handleReplaceConfirm,
    handleReplaceCancel,
    reset,
  };
}
