import OpenAI from "openai";

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export type SupportedLanguage = 'en' | 'es' | 'zh' | 'vi' | 'ar';

/**
 * Translate text from one language to another using OpenAI
 * @param text - Text to translate
 * @param targetLanguage - Target language code
 * @param sourceLanguage - Source language code (optional, will auto-detect if not provided)
 * @returns Promise<string> - Translated text
 */
export async function translateText(
  text: string, 
  targetLanguage: SupportedLanguage, 
  sourceLanguage?: SupportedLanguage
): Promise<string> {
  if (!text.trim()) {
    return text;
  }

  // If source and target are the same, return original text
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured, returning original text');
    return text;
  }

  try {
    const languageNames: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Spanish',
      zh: 'Chinese (Simplified)',
      vi: 'Vietnamese',
      ar: 'Arabic'
    };

    const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] : 'auto-detect';
    const targetLangName = languageNames[targetLanguage];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Translate the following text from ${sourceLangName} to ${targetLangName}. Maintain the same tone, formality level, and meaning. Return only the translated text without any explanations or additional text.

Text to translate: "${text}"`
      }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original text on error
  }
}

/**
 * Extract and normalize information from non-English text for database storage
 * @param text - Text in any supported language
 * @param fieldType - Type of field being extracted (e.g., 'date', 'number', 'text')
 * @returns Promise<string> - Normalized text in English
 */
export async function normalizeForDatabase(
  text: string,
  fieldType: 'date' | 'number' | 'text' | 'address' | 'name'
): Promise<string> {
  if (!text.trim()) {
    return text;
  }

  // Skip normalization for text that is already in English and common single words
  // This prevents unnecessary API calls for structured data like "other", "Marion County", etc.
  if (fieldType === 'text' && /^[a-zA-Z0-9\s,._-]+$/.test(text) && text.split(/\s+/).length <= 5) {
    return text;
  }

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured, returning original text');
    return text;
  }

  try {
    const fieldInstructions: Record<string, string> = {
      date: 'Extract the date and convert it to MM/DD/YYYY format. If no clear date is found, return the original text.',
      number: 'Extract any numbers and convert them to standard format (e.g., "one thousand" -> "1000").',
      text: 'Translate to English while preserving the original meaning and context. Return ONLY the translated text, no explanations.',
      address: 'Translate to English and standardize address format (Street, City, State, ZIP). Return ONLY the address, no explanations.',
      name: 'Translate to English while preserving proper names and titles. Return ONLY the name, no explanations.'
    };

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `${fieldInstructions[fieldType]}

Text: "${text}"`
      }],
      temperature: 0.1,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error('Normalization failed:', error);
    return text; // Return original text on error
  }
}

/**
 * Get language-specific formatting for dates, numbers, etc.
 * @param value - Value to format
 * @param language - Target language
 * @param formatType - Type of formatting needed
 * @returns Formatted value
 */
export function formatForLanguage(
  value: string | number | Date, 
  language: SupportedLanguage, 
  formatType: 'date' | 'number' | 'currency'
): string {
  if (language === 'en') {
    return value.toString();
  }

  try {
    const date = new Date(value);
    
    switch (formatType) {
      case 'date':
        return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : language, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'number':
        return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : language).format(Number(value));
      case 'currency':
        return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : language, {
          style: 'currency',
          currency: 'USD'
        }).format(Number(value));
      default:
        return value.toString();
    }
  } catch (error) {
    console.error('Formatting failed:', error);
    return value.toString();
  }
}
