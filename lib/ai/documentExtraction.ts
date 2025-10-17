/**
 * Document Extraction Service
 *
 * Uses GPT-4 Vision to extract structured information from legal documents,
 * court notices, and other case-related images/PDFs.
 * Enhanced with Marion County, Indiana specific patterns and validation.
 *
 * Security: Files are processed in-memory only, never stored permanently.
 */

import OpenAI from 'openai';

/**
 * Marion County court information lookup
 */
export const MARION_COUNTY_COURTS = {
  'K01': {
    name: 'Center Township Small Claims Court',
    address: '7201 E. 75th Street, Indianapolis, IN 46256',
    phone: '(317) 595-5000',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K02': {
    name: 'Decatur Township Small Claims Court', 
    address: '5410 S. High School Road, Indianapolis, IN 46221',
    phone: '(317) 856-5280',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K03': {
    name: 'Franklin Township Small Claims Court',
    address: '6231 S. Franklin Road, Indianapolis, IN 46259',
    phone: '(317) 862-6100',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K04': {
    name: 'Lawrence Township Small Claims Court',
    address: '4455 N. Post Road, Indianapolis, IN 46226',
    phone: '(317) 545-5000',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K05': {
    name: 'Perry Township Small Claims Court',
    address: '4925 Shelby Street, Indianapolis, IN 46227',
    phone: '(317) 783-1300',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K06': {
    name: 'Pike Township Small Claims Court',
    address: '5665 Longacre Lane, Indianapolis, IN 46268',
    phone: '(317) 327-4000',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K07': {
    name: 'Warren Township Small Claims Court',
    address: '501 N. Post Road, Indianapolis, IN 46219',
    phone: '(317) 353-6400',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K08': {
    name: 'Washington Township Small Claims Court',
    address: '3110 E. 30th Street, Indianapolis, IN 46218',
    phone: '(317) 327-4000',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  },
  'K09': {
    name: 'Wayne Township Small Claims Court',
    address: '1155 S. High School Road, Indianapolis, IN 46241',
    phone: '(317) 481-6700',
    hours: 'Monday-Friday 8:00 AM - 4:30 PM'
  }
} as const;

/**
 * Marion County case number parsing result
 */
export interface MarionCountyCaseInfo {
  county: string;
  township: string;
  townshipCode: string;
  yearMonth: string;
  caseType: 'eviction' | 'small_claims';
  sequence: string;
  fullJurisdiction: string;
  courtInfo: typeof MARION_COUNTY_COURTS[keyof typeof MARION_COUNTY_COURTS];
}

/**
 * Extracted case information from document
 */
export interface ExtractionResult {
  caseNumber?: string;
  hearingDate?: string;
  courtName?: string;
  jurisdiction?: string;
  caseType?: string;
  parties?: {
    plaintiff?: string;
    defendant?: string;
  };
  confidence?: {
    overall: number;
    caseNumber?: number;
    hearingDate?: number;
    courtName?: number;
    jurisdiction?: number;
    caseType?: number;
  };
  rawText?: string;
  success: boolean;
  error?: string;
}

/**
 * Convert file to base64 string for API transmission
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract structured information from a legal document using GPT-4 Vision
 *
 * @param fileBase64 - Base64-encoded file content
 * @param mimeType - MIME type of the file (e.g., "image/png", "application/pdf")
 * @returns Extracted case information with confidence scores
 */
export async function extractFromDocument(
  fileBase64: string,
  mimeType: string
): Promise<ExtractionResult> {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create the vision prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a legal document analyzer specializing in Marion County, Indiana court documents.

**Marion County Case Number Format:**
Look for Indiana case numbers in this specific format: 49K01-YYMM-EV-NNNNNN or 49K01-YYMM-SC-NNNNNN
- 49 = Marion County
- K01-K09 = Township codes:
  * K01 = Center Township Small Claims Court
  * K02 = Decatur Township Small Claims Court  
  * K03 = Franklin Township Small Claims Court
  * K04 = Lawrence Township Small Claims Court
  * K05 = Perry Township Small Claims Court
  * K06 = Pike Township Small Claims Court
  * K07 = Warren Township Small Claims Court
  * K08 = Washington Township Small Claims Court
  * K09 = Wayne Township Small Claims Court
- EV = Eviction cases, SC = Small Claims cases

**Marion County Court Names:**
Look for these specific court names:
- "Center Township Small Claims Court"
- "Marion County Small Claims Court" 
- "Marion Superior Court"
- "Marion County Circuit Court"

**Jurisdiction Format:**
Extract jurisdiction as: "Marion County, IN - [Township Name] Small Claims Court"

Extract the following information from this court document:

1. Case Number (prioritize Marion County format: 49K01-YYMM-EV-NNNNNN)
2. Hearing Date (in ISO 8601 format YYYY-MM-DD if possible, or the exact text from the document)
3. Court Name (full official name, prefer Marion County court names)
4. Jurisdiction (use Marion County format: "Marion County, IN - [Township] Small Claims Court")
5. Case Type (classify as: eviction, small_claims, family_law, debt, employment, housing, consumer, contract, discrimination, other_civil, or other)
6. Parties (plaintiff/petitioner and defendant/respondent names if visible)

For each field, also provide a confidence score from 0.0 to 1.0 indicating how certain you are about the extraction.

If a field is not found or unclear, omit it from the response.

Return the results as a JSON object with this structure:
{
  "caseNumber": "string or omit",
  "hearingDate": "string or omit",
  "courtName": "string or omit",
  "jurisdiction": "string or omit",
  "caseType": "string or omit",
  "parties": {
    "plaintiff": "string or omit",
    "defendant": "string or omit"
  },
  "confidence": {
    "overall": 0.0-1.0,
    "caseNumber": 0.0-1.0 or omit,
    "hearingDate": 0.0-1.0 or omit,
    "courtName": 0.0-1.0 or omit,
    "jurisdiction": 0.0-1.0 or omit,
    "caseType": 0.0-1.0 or omit
  },
  "rawText": "Brief summary of what you see in the document"
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${fileBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for more deterministic extraction
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: 'No response from AI model',
      };
    }

    const extracted = JSON.parse(content);

    return {
      ...extracted,
      success: true,
    };
  } catch (error) {
    console.error('Document extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown extraction error',
    };
  }
}

/**
 * Validate and normalize extracted date
 * Attempts to convert various date formats to ISO 8601 (YYYY-MM-DD)
 */
export function normalizeDateString(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Validate case number format
 * Common formats: 12-3456-CV, 2024CV00123, CV-2024-00123
 */
export function isValidCaseNumber(caseNumber: string): boolean {
  if (!caseNumber || caseNumber.length < 3) return false;

  // Check for common patterns
  const patterns = [
    /^\d{2,4}-\d{4,6}-[A-Z]{2,4}$/i, // 12-3456-CV
    /^\d{4}[A-Z]{2}\d{5,}$/i, // 2024CV00123
    /^[A-Z]{2}-\d{4}-\d{5,}$/i, // CV-2024-00123
    /^\d{4}-[A-Z]{2}-\d{5,}$/i, // 2024-CV-00123
  ];

  return patterns.some(pattern => pattern.test(caseNumber));
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

/**
 * Validate Marion County case number format
 * Format: 49K01-YYMM-EV-NNNNN or 49K01-YYMM-SC-NNNNN
 */
export function validateMarionCountyCaseNumber(caseNumber: string): boolean {
  const pattern = /^49K0[1-9]-\d{4}-(EV|SC)-\d{6}$/;
  return pattern.test(caseNumber);
}

/**
 * Parse Marion County case number into structured components
 */
export function parseMarionCountyCaseNumber(caseNumber: string): MarionCountyCaseInfo | null {
  const match = caseNumber.match(/^49(K0[1-9])-(\d{4})-(EV|SC)-(\d{6})$/);
  if (!match) return null;
  
  const [, townshipCode, yearMonth, caseType, sequence] = match;
  
  const townshipNames = {
    'K01': 'Center Township',
    'K02': 'Decatur Township', 
    'K03': 'Franklin Township',
    'K04': 'Lawrence Township',
    'K05': 'Perry Township',
    'K06': 'Pike Township',
    'K07': 'Warren Township',
    'K08': 'Washington Township',
    'K09': 'Wayne Township'
  } as const;
  
  const township = townshipNames[townshipCode as keyof typeof townshipNames] || townshipCode;
  const courtInfo = MARION_COUNTY_COURTS[townshipCode as keyof typeof MARION_COUNTY_COURTS];
  
  return {
    county: 'Marion County',
    township,
    townshipCode,
    yearMonth,
    caseType: caseType === 'EV' ? 'eviction' : 'small_claims',
    sequence,
    fullJurisdiction: `Marion County, IN - ${township} Small Claims Court`,
    courtInfo
  };
}

/**
 * Get court information for a township code
 */
export function getCourtInfo(townshipCode: string) {
  return MARION_COUNTY_COURTS[townshipCode as keyof typeof MARION_COUNTY_COURTS] || null;
}

/**
 * Calculate Marion County-specific timeline based on case type and notice date
 */
export function calculateMarionCountyTimeline(noticeDate: string, caseType: string) {
  const notice = new Date(noticeDate);
  
  if (caseType === 'eviction') {
    return {
      responseDue: new Date(notice.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
      hearingScheduled: new Date(notice.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
      writExecution: new Date(notice.getTime() + 23 * 24 * 60 * 60 * 1000) // 48 hours after hearing
    };
  }
  
  // Small claims timeline
  return {
    responseDue: new Date(notice.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
    hearingScheduled: new Date(notice.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
  };
}

/**
 * Check if a case number appears to be from Marion County
 */
export function isMarionCountyCase(caseNumber: string): boolean {
  return caseNumber.startsWith('49-') || caseNumber.startsWith('49K');
}

/**
 * Enhanced case number validation that includes Marion County patterns
 */
export function isValidCaseNumberEnhanced(caseNumber: string): boolean {
  if (!caseNumber || caseNumber.length < 3) return false;

  // Check Marion County format first
  if (isMarionCountyCase(caseNumber)) {
    return validateMarionCountyCaseNumber(caseNumber);
  }

  // Fall back to general patterns
  return isValidCaseNumber(caseNumber);
}
