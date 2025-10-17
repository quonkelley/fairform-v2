'use client';

import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from 'lucide-react';
import type { FormField, FieldValue } from '@/lib/forms/types';

interface FormFieldInputProps {
  field: FormField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function FormFieldInput({
  field,
  value,
  onChange,
  error
}: FormFieldInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount - for accessibility, focus first field when component mounts
  useEffect(() => {
    // Only focus if this is a text or date input (not checkbox)
    if (field.type !== 'checkbox' && inputRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [field.id, field.type]); // Re-focus when field changes

  // Render different input types based on field type
  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Input
            ref={inputRef}
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
            aria-label={field.label}
            aria-required={field.required}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          {error && (
            <p id={`${field.id}-error`} className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <div className="relative">
            <Input
              ref={inputRef}
              type="date"
              value={value ? formatDateForInput(value) : ''}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : null;
                onChange(dateValue);
              }}
              className={error ? 'border-red-500' : ''}
              aria-label={field.label}
              aria-required={field.required}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {error && (
            <p id={`${field.id}-error`} className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked: boolean) => {
                onChange(checked);
                // Auto-advance on checkbox click for better UX
                if (checked) {
                  // Dispatch a custom event that the FormSession can listen to
                  window.dispatchEvent(new CustomEvent('formFieldAutoAdvance'));
                }
              }}
              aria-label={field.label}
              aria-required={field.required}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
            <span className="text-sm text-gray-700">
              {field.placeholder || 'Check to confirm'}
            </span>
          </label>
          {error && (
            <p id={`${field.id}-error`} className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      );

    default:
      return (
        <div className="text-red-600">
          Unsupported field type: {field.type}
        </div>
      );
  }
}

/**
 * Format a date value for HTML date input
 */
function formatDateForInput(value: FieldValue): string {
  if (!value) return '';
  
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return '';
  }
  
  // Format as YYYY-MM-DD for HTML date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
