'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { detectLanguage, type SupportedLanguage, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '@/lib/ai/languageDetection';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  detectAndSetLanguage: (message: string) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  languageNames: typeof LANGUAGE_NAMES;
  isDetecting: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useLanguageContext() {
  return useLanguage();
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [isDetecting, setIsDetecting] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fairform-language');
    if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
      setCurrentLanguage(savedLanguage as SupportedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fairform-language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
  }, []);

  const detectAndSetLanguage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    setIsDetecting(true);
    try {
      const detectedLanguage = await detectLanguage(message);
      setCurrentLanguage(detectedLanguage);
    } catch (error) {
      console.error('Failed to detect language:', error);
      // Keep current language on error
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    detectAndSetLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    languageNames: LANGUAGE_NAMES,
    isDetecting,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
