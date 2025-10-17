'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
  showLabel?: boolean;
}

export function LanguageSelector({ 
  className, 
  variant = 'dropdown',
  showLabel = true 
}: LanguageSelectorProps) {
  const { 
    currentLanguage, 
    setLanguage, 
    supportedLanguages, 
    languageNames,
    isDetecting 
  } = useLanguage();

  if (variant === 'buttons') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {showLabel && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Language:</span>
          </div>
        )}
        {Object.entries(supportedLanguages).map(([code]) => (
          <button
            key={code}
            onClick={() => setLanguage(code as keyof typeof supportedLanguages)}
            disabled={isDetecting}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md border transition-colors',
              currentLanguage === code
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
              isDetecting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {languageNames[code as keyof typeof languageNames]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {showLabel && (
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
      )}
      <div className="relative">
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as keyof typeof supportedLanguages)}
          disabled={isDetecting}
          className={cn(
            'appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            isDetecting && 'opacity-50 cursor-not-allowed'
          )}
        >
          {Object.entries(supportedLanguages).map(([code, name]) => (
            <option key={code} value={code}>
              {languageNames[code as keyof typeof languageNames]} ({name})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Globe className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {isDetecting && (
        <p className="text-xs text-gray-500 mt-1">Detecting language...</p>
      )}
    </div>
  );
}

export default LanguageSelector;
