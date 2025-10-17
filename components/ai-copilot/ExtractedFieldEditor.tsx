'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ConfidenceIndicator,
  getConfidenceLevel,
} from './ConfidenceIndicator';

export interface ExtractedFieldEditorProps {
  label: string;
  value?: string;
  confidence?: number;
  isCollected: boolean;
  onEdit?: (newValue: string) => void;
  onConfirm?: (confirmed: boolean) => void;
  fieldKey?: string;
  className?: string;
}

/**
 * ExtractedFieldEditor component with inline editing and confidence indicators
 *
 * Story 13.32 - Tasks 2 & 3
 * - Displays extracted field with confidence indicator
 * - Inline editing for corrections
 * - Confirmation prompt for borderline confidence (70-80%)
 * - Mobile-friendly with touch-optimized inputs
 */
export function ExtractedFieldEditor({
  label,
  value,
  confidence,
  isCollected,
  onEdit,
  onConfirm,
  className,
}: ExtractedFieldEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const confidenceLevel = getConfidenceLevel(confidence);
  const needsConfirmation = confidenceLevel === 'medium' && !showConfirmation;

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value || '');
  };

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onEdit?.(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleConfirm = (confirmed: boolean) => {
    setShowConfirmation(true);
    onConfirm?.(confirmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Format value for display (truncate if too long)
  const formatValue = (val?: string): string => {
    if (!val) return '';
    if (val.length > 25) {
      return `${val.substring(0, 25)}...`;
    }
    return val;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm transition-colors duration-150',
        isCollected && 'text-green-700',
        !isCollected && 'text-gray-500',
        className
      )}
      role="group"
      aria-label={`${label}: ${value || 'not collected'}`}
    >
      {/* Confidence Indicator */}
      <ConfidenceIndicator
        confidence={isCollected ? confidence : undefined}
        className="flex-shrink-0"
      />

      {/* Label */}
      <span className="flex-1">{label}</span>

      {/* Value Display or Editing Input */}
      {isEditing ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 sm:w-40"
            aria-label={`Edit ${label}`}
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-50 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Save"
            title="Save (Enter)"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Cancel"
            title="Cancel (Esc)"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Value Display */}
          {isCollected && value && (
            <span className="text-xs text-gray-600 flex-shrink-0" title={value}>
              {formatValue(value)}
            </span>
          )}

          {/* Edit Button for low confidence */}
          {isCollected && confidenceLevel === 'low' && onEdit && (
            <button
              className="text-xs text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 flex-shrink-0"
              onClick={handleStartEdit}
              aria-label={`Edit ${label} (low confidence)`}
            >
              Edit
            </button>
          )}

          {/* Confirmation Prompt for medium confidence */}
          {isCollected && needsConfirmation && onConfirm && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-600 italic">Looks good?</span>
              <button
                className="text-xs text-green-600 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1"
                onClick={() => handleConfirm(true)}
                aria-label={`Confirm ${label} is correct`}
              >
                Yes
              </button>
              <button
                className="text-xs text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                onClick={handleStartEdit}
                aria-label={`Edit ${label}`}
              >
                Edit
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
