'use client';

import { cn } from '@/lib/utils';
import { FailureResponse } from '@/lib/ai/gracefulFailure';

export interface FailureResponseCardProps {
  response: FailureResponse;
  onOptionSelect: (action: string) => void;
  className?: string;
}

export function FailureResponseCard({
  response,
  onOptionSelect,
  className
}: FailureResponseCardProps) {
  const icons = {
    rephrase: '🤔',
    alternatives: '💡',
    escalate: '👋'
  };

  return (
    <div className={cn(
      "bg-amber-50 border-l-4 p-4 rounded-r-lg",
      response.level === 'escalate' ? 'border-blue-500' : 'border-amber-500',
      className
    )}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[response.level]}</span>
        <div className="flex-1">
          <p className="text-gray-700 mb-3">{response.message}</p>
          
          {response.options && (
            <div className="space-y-2">
              {response.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => onOptionSelect(option.action)}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg transition-colors",
                    response.level === 'escalate'
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
