'use client';

import { useLanguage } from './useLanguage';
import { t, type Translations } from '@/lib/i18n/translations';

export function useTranslations(): {
  t: (key: string) => string;
  translations: Translations;
  language: string;
} {
  const { currentLanguage } = useLanguage();
  
  return {
    t: (key: string) => t(key, currentLanguage),
    translations: t('', currentLanguage) as any, // This will return the full translations object
    language: currentLanguage,
  };
}
