'use client';

import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceIndicatorProps {
  confidence?: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * Get confidence level category from score
 * - high: >= 0.8 (green checkmark)
 * - medium: 0.7-0.79 (gray question mark)
 * - low: < 0.7 (amber warning)
 */
export function getConfidenceLevel(confidence?: number): ConfidenceLevel {
  if (confidence === undefined) return 'high'; // Assume high if not provided
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

/**
 * Get human-readable confidence description
 */
export function getConfidenceDescription(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Moderate confidence - please verify';
    case 'low':
      return 'Low confidence - may need correction';
  }
}

/**
 * ConfidenceIndicator displays visual feedback for extraction confidence
 *
 * Story 13.32 - Task 1
 * - Green checkmark for high confidence (>= 80%)
 * - Gray question mark for medium confidence (70-79%)
 * - Amber warning for low confidence (< 70%)
 */
export function ConfidenceIndicator({
  confidence,
  className,
  showLabel = false,
}: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);
  const description = getConfidenceDescription(level);
  const percentage = confidence !== undefined ? Math.round(confidence * 100) : 100;

  return (
    <div
      className={cn('inline-flex items-center gap-1.5', className)}
      role="img"
      aria-label={`${description} (${percentage}%)`}
    >
      {level === 'high' && (
        <CheckCircle2
          className="h-4 w-4 text-green-600 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {level === 'medium' && (
        <HelpCircle
          className="h-4 w-4 text-gray-500 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {level === 'low' && (
        <AlertCircle
          className="h-4 w-4 text-amber-500 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {showLabel && (
        <span
          className={cn(
            'text-xs',
            level === 'high' && 'text-green-700',
            level === 'medium' && 'text-gray-600',
            level === 'low' && 'text-amber-600'
          )}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
