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
  template: FormTemplate | null;
}
function computeValidationError(field: FormField | undefined, value: FieldValue): string | undefined {
  if (!field) {
    return 'Field definition not found';
  }

  const hasValue =
    value !== undefined &&
    value !== null &&
    (typeof value !== 'string' || value.trim().length > 0);

  if (field.required) {
    if (field.type === 'checkbox') {
      if (value !== true) {
        return `${field.label} is required`;
      }
    } else if (!hasValue) {
      return `${field.label} is required`;
    }
  }

  if (field.type === 'date' && hasValue) {
    const date =
      value instanceof Date ? value : new Date(value as string);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
  }

  return undefined;
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

  // Navigate to next field
  const nextField = useCallback(() => {
    setState(prev => {
      if (!prev.template) {
        return prev;
      }

      const fields = prev.template.fields;
      const currentField = fields[prev.currentFieldIndex];

      if (!currentField) {
        return prev;
      }

      const value = prev.fieldValues[currentField.id];
      const validationError = computeValidationError(currentField, value);

      if (validationError) {
        if (prev.validationError === validationError) {
          return prev;
        }

        return {
          ...prev,
          validationError
        };
      }

      if (prev.currentFieldIndex < fields.length - 1) {
        return {
          ...prev,
          currentFieldIndex: prev.currentFieldIndex + 1,
          validationError: undefined
        };
      }

      if (prev.validationError !== undefined) {
        return {
          ...prev,
          validationError: undefined
        };
      }

      return prev;
    });
  }, []);

  // Navigate to previous field
  const previousField = useCallback(() => {
    setState(prev => {
      if (prev.currentFieldIndex === 0) {
        return prev;
      }

      return {
        ...prev,
        currentFieldIndex: prev.currentFieldIndex - 1,
        validationError: undefined
      };
    });
  }, []);

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

  const isFinalField = Boolean(
    state.template && state.currentFieldIndex === state.template.fields.length - 1
  );

  const isCurrentFieldValid = currentField
    ? !computeValidationError(currentField, state.fieldValues[currentField.id])
    : false;

  const isComplete = isFinalField && isCurrentFieldValid;

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
    validationError: state.validationError,
    template: state.template,
  };
}
