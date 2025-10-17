'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadFormTemplate } from '@/lib/forms/formLoader';
import { prefillFromCase } from '@/lib/forms/prefillData';
import type { FormTemplate, FormField, FieldValue } from '@/lib/forms/types';
import type { Case } from '@/lib/db/types';

interface FormSessionState {
  template: FormTemplate | null;
  currentFieldIndex: number;
  fieldValues: Record<string, FieldValue>;
  validationError?: string;
  isLoading: boolean;
  error?: string;
}

interface UseFormSessionReturn {
  currentField: FormField | undefined;
  progress: {
    current: number;
    total: number;
  };
  fieldValues: Record<string, FieldValue>;
  nextField: () => void;
  previousField: () => void;
  setFieldValue: (fieldId: string, value: FieldValue) => void;
  isComplete: boolean;
  isLoading: boolean;
  error?: string;
  validationError?: string;
}

export function useFormSession(
  formId: string, 
  caseData?: Case
): UseFormSessionReturn {
  const [state, setState] = useState<FormSessionState>({
    template: null,
    currentFieldIndex: 0,
    fieldValues: {},
    isLoading: true,
    error: undefined,
    validationError: undefined
  });

  // Load form template on mount
  useEffect(() => {
    async function loadTemplate() {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      try {
        const result = await loadFormTemplate(formId);
        
        if (!result.success) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: result.error 
          }));
          return;
        }

        const template = result.data;
        
        // Pre-fill from case data if available
        let initialValues = {};
        if (caseData) {
          initialValues = prefillFromCase(caseData, template);
        }

        setState(prev => ({
          ...prev,
          template,
          fieldValues: initialValues,
          isLoading: false,
          error: undefined
        }));
      } catch (error) {
        console.error('Error loading form template:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load form template'
        }));
      }
    }

    loadTemplate();
  }, [formId, caseData]);

  // Validate current field
  const validateCurrentField = useCallback((): boolean => {
    if (!state.template) return false;
    
    const currentField = state.template.fields[state.currentFieldIndex];
    if (!currentField) return false;

    const value = state.fieldValues[currentField.id];

    // Check required fields
    if (currentField.required && !value) {
      setState(prev => ({
        ...prev,
        validationError: `${currentField.label} is required`
      }));
      return false;
    }

    // Type-specific validation
    if (currentField.type === 'date' && value) {
      const date = value instanceof Date ? value : new Date(value as string);
      if (isNaN(date.getTime())) {
        setState(prev => ({
          ...prev,
          validationError: 'Please enter a valid date'
        }));
        return false;
      }
    }

    // Clear validation error if valid
    setState(prev => ({
      ...prev,
      validationError: undefined
    }));
    return true;
  }, [state.template, state.currentFieldIndex, state.fieldValues]);

  // Navigate to next field
  const nextField = useCallback(() => {
    if (!state.template) return;

    // Validate current field before advancing
    if (!validateCurrentField()) {
      return;
    }

    if (state.currentFieldIndex < state.template.fields.length - 1) {
      setState(prev => ({
        ...prev,
        currentFieldIndex: prev.currentFieldIndex + 1,
        validationError: undefined
      }));
    }
  }, [state.template, state.currentFieldIndex, validateCurrentField]);

  // Navigate to previous field
  const previousField = useCallback(() => {
    if (state.currentFieldIndex > 0) {
      setState(prev => ({
        ...prev,
        currentFieldIndex: prev.currentFieldIndex - 1,
        validationError: undefined
      }));
    }
  }, [state.currentFieldIndex]);

  // Set field value
  const setFieldValue = useCallback((fieldId: string, value: FieldValue) => {
    setState(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      },
      validationError: undefined // Clear error when user types
    }));
  }, []);

  // Listen for auto-advance event (from checkbox fields)
  useEffect(() => {
    const handleAutoAdvance = () => {
      // Small delay to allow checkbox animation to complete
      setTimeout(() => {
        nextField();
      }, 200);
    };

    window.addEventListener('formFieldAutoAdvance', handleAutoAdvance);
    return () => {
      window.removeEventListener('formFieldAutoAdvance', handleAutoAdvance);
    };
  }, [nextField]);

  // Calculate derived values
  const currentField = state.template?.fields[state.currentFieldIndex];
  const progress = {
    current: state.currentFieldIndex + 1,
    total: state.template?.fields.length || 0
  };
  const isComplete = state.template 
    ? state.currentFieldIndex === state.template.fields.length - 1 
      && validateCurrentField()
    : false;

  return {
    currentField,
    progress,
    fieldValues: state.fieldValues,
    nextField,
    previousField,
    setFieldValue,
    isComplete,
    isLoading: state.isLoading,
    error: state.error,
    validationError: state.validationError
  };
}
