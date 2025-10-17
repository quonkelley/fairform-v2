'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormProgressBar } from '@/components/forms/FormProgressBar';
import { FormFieldInput } from '@/components/forms/FormFieldInput';
import { useFormSession } from '@/lib/hooks/useFormSession';
import type { Case } from '@/lib/db/types';
import type { FormTemplate } from '@/lib/forms/types';

interface FormSessionProps {
  formId: string;
  caseId: string;
  caseData?: Case;
  onComplete: (result: FormCompletionResult) => void;
  onCancel: () => void;
}

export interface FormCompletionResult {
  fields: Record<string, unknown>;
  template: FormTemplate | null;
}

export function FormSession({ 
  formId, 
  caseData, 
  onComplete, 
  onCancel 
}: FormSessionProps) {
  const hasCompletedRef = useRef(false);
  const {
    currentField,
    progress,
    fieldValues,
    nextField,
    previousField,
    setFieldValue,
    isComplete,
    isLoading,
    error,
    validationError,
    template
  } = useFormSession(formId, caseData);

  // Handle completion
  useEffect(() => {
    if (!isComplete) {
      hasCompletedRef.current = false;
      return;
    }

    if (hasCompletedRef.current) {
      return;
    }

    const hasValue =
      currentField?.required
        ? currentField.type === 'checkbox'
          ? fieldValues[currentField.id] === true
          : Boolean(fieldValues[currentField.id])
        : true;

    if (!hasValue) {
      return;
    }

    hasCompletedRef.current = true;

    const timer = setTimeout(() => {
      onComplete({
        fields: fieldValues,
        template,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isComplete, fieldValues, currentField, onComplete, template]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Only advance if not in a textarea
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          nextField();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextField, onCancel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading form: {error}</p>
        <Button onClick={onCancel} className="mt-4" variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (!currentField) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="form-session p-4 space-y-4"
    >
      {/* Progress bar */}
      <FormProgressBar 
        current={progress.current} 
        total={progress.total} 
      />

      {/* Question card */}
      <div className="question-card bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {currentField.label}
        </h3>
        
        {currentField.helpText && (
          <p className="text-sm text-gray-600 mb-4">
            {currentField.helpText}
          </p>
        )}

        <FormFieldInput
          field={currentField}
          value={fieldValues[currentField.id]}
          onChange={(value) => setFieldValue(currentField.id, value)}
          error={validationError}
        />
      </div>

      {/* Action buttons */}
      <div className="actions flex items-center justify-between">
        <Button
          onClick={previousField}
          disabled={progress.current === 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={onCancel}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>

        <Button
          onClick={nextField}
          disabled={!fieldValues[currentField.id] && currentField.required}
          className="flex items-center gap-2"
        >
          {progress.current === progress.total ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard hints */}
      <p className="text-xs text-gray-500 text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to continue, 
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs mx-1">Esc</kbd> to cancel
      </p>
    </motion.div>
  );
}
