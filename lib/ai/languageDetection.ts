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

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
  vi: 'Vietnamese',
  ar: 'Arabic',
};

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  vi: 'Tiếng Việt',
  ar: 'العربية',
};

/**
 * Detect the language of a given message using OpenAI
 * @param message - The message to detect language for
 * @returns Promise<string> - ISO 639-1 language code
 */
export async function detectLanguage(message: string): Promise<SupportedLanguage> {
  if (!message.trim()) {
    return 'en'; // Default to English for empty messages
  }

  const client = getOpenAIClient();
  if (!client) {
    console.warn('OpenAI API key not configured, falling back to English');
    return 'en';
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Detect the language of this message and respond with only the ISO 639-1 code (e.g., "en", "es", "zh", "vi", "ar"). If the language is not one of the supported languages (English, Spanish, Chinese Simplified, Vietnamese, Arabic), respond with "en". Message: "${message}"`
      }],
      temperature: 0.1,
      max_tokens: 10,
    });

    const detectedCode = response.choices[0]?.message?.content?.trim().toLowerCase();
    
    // Validate that the detected code is one of our supported languages
    if (detectedCode && detectedCode in SUPPORTED_LANGUAGES) {
      return detectedCode as SupportedLanguage;
    }
    
    // Fallback to English if unsupported language detected
    return 'en';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'en'; // Fallback to English on error
  }
}

/**
 * Get language-specific instructions for the AI system prompt
 * @param language - The target language code
 * @returns Language-specific instruction string
 */
export function getLanguageInstructions(language: SupportedLanguage): string {
  const instructions: Record<SupportedLanguage, string> = {
    en: "Respond in English. Be warm and helpful.",
    es: "Responde en español. Sé cálido y útil.",
    zh: "用简体中文回复。要温暖和有帮助。",
    vi: "Trả lời bằng tiếng Việt. Hãy ấm áp và hữu ích.",
    ar: "الرد باللغة العربية. كن دافئًا ومفيدًا."
  };

  return instructions[language] || instructions.en;
}

/**
 * Check if a language code is supported
 * @param code - Language code to check
 * @returns boolean - Whether the language is supported
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return code in SUPPORTED_LANGUAGES;
}
