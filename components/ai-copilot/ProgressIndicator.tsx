'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MinimumCaseInfo } from '@/lib/ai/types';
import { ExtractedFieldEditor } from './ExtractedFieldEditor';

export interface ProgressIndicatorProps {
  collectedInfo: Partial<MinimumCaseInfo>;
  isVisible: boolean;
  confidence?: {
    caseType?: number;
    jurisdiction?: number;
    caseNumber?: number;
    hearingDate?: number;
  };
  onEdit?: (field: string, newValue: string) => void;
  onConfirm?: (field: string, confirmed: boolean) => void;
  onCorrection?: (field: string, originalValue: string, correctedValue: string, confidence?: number) => void;
}

interface ProgressItem {
  label: string;
  value?: string;
  confidence?: number;
  key: string;
}

export function ProgressIndicator({
  collectedInfo,
  isVisible,
  confidence = {},
  onEdit,
  onConfirm,
  onCorrection,
}: ProgressIndicatorProps) {
  if (!isVisible) return null;

  const items: ProgressItem[] = [
    {
      label: 'Case Type',
      value: collectedInfo.caseType,
      confidence: confidence.caseType,
      key: 'caseType',
    },
    {
      label: 'Location',
      value: collectedInfo.jurisdiction,
      confidence: confidence.jurisdiction,
      key: 'jurisdiction',
    },
    {
      label: 'Case # or Hearing Date',
      value: collectedInfo.caseNumber || collectedInfo.hearingDate,
      confidence: confidence.caseNumber || confidence.hearingDate,
      key: 'identifier',
    },
  ];

  const completedCount = items.filter((item) => item.value).length;
  const allComplete = completedCount === items.length;

  const handleEdit = (fieldKey: string) => (newValue: string) => {
    const item = items.find((i) => i.key === fieldKey);
    if (item && item.value && item.value !== newValue) {
      // Track correction for analytics (Story 13.32 - AC 5)
      onCorrection?.(fieldKey, item.value, newValue, item.confidence);
    }
    onEdit?.(fieldKey, newValue);
  };

  const handleConfirm = (fieldKey: string) => (confirmed: boolean) => {
    onConfirm?.(fieldKey, confirmed);
  };

  return (
    <div
      className={cn(
        'bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 transition-all duration-200',
        allComplete && 'opacity-75 scale-95'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Case information: ${completedCount} of ${items.length} items collected`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-blue-900">Case Information</h4>
        <span className="text-xs text-blue-600" aria-label={`${completedCount} of ${items.length} items collected`}>
          {completedCount}/{items.length}
        </span>
      </div>

      {/* Progress items */}
      <div className="space-y-1">
        {items.map((item) => {
          const isCollected = Boolean(item.value);

          return (
            <ExtractedFieldEditor
              key={item.key}
              label={item.label}
              value={item.value}
              confidence={item.confidence}
              isCollected={isCollected}
              onEdit={handleEdit(item.key)}
              onConfirm={handleConfirm(item.key)}
              fieldKey={item.key}
            />
          );
        })}
      </div>

      {/* Completion message */}
      {allComplete && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-green-700 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>All required information collected</span>
        </div>
      )}
    </div>
  );
}
