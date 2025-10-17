import { demoConfig } from './demoConfig';
import type { 
  MarionCountyEvictionNotice, 
  ParseNoticeResult, 
  ParseNoticeError,
  ParsedNoticeResult 
} from './types';

/**
 * Parse a demo notice file and return structured case data
 * 
 * This function simulates OCR processing by reading fixture files from
 * the imports directory and validating them against the expected schema.
 * 
 * @param fileName - The name of the notice file to parse (e.g., "eviction.notice.json")
 * @returns Promise<ParseNoticeResult> - Success with parsed data or error with details
 */
export async function parseDemoNotice(fileName: string): Promise<ParseNoticeResult> {
  try {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, demoConfig.timing.scanDelay));
    
    // Load the fixture file
    const noticeData = await loadNoticeFixture(fileName);
    
    // Validate the schema
    const validationResult = validateNoticeSchema(noticeData);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error || 'Validation failed',
        code: validationResult.code || 'INVALID_TYPES',
      };
    }
    
    // Parse and structure the data
    const parsedData = parseNoticeData(noticeData);
    
    return {
      success: true,
      data: parsedData,
    };
    
  } catch (error) {
    // Handle unknown filename or file loading errors
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return {
        success: false,
        error: `Notice file '${fileName}' not found`,
        code: 'UNKNOWN_FILE' as const,
      };
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `Invalid JSON in notice file: ${error.message}`,
        code: 'INVALID_JSON' as const,
      };
    }
    
    // Handle other unexpected errors
    return {
      success: false,
      error: `Unexpected error parsing notice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'INVALID_JSON' as const,
    };
  }
}

/**
 * Load a notice fixture file from the imports directory
 */
async function loadNoticeFixture(fileName: string): Promise<MarionCountyEvictionNotice> {
  // In a real implementation, this would read from the file system
  // For demo purposes, we'll import the fixture directly
  if (fileName === 'eviction.notice.json') {
    try {
      const fixture = await import('./imports/eviction.notice.json');
      return (fixture.default || fixture) as MarionCountyEvictionNotice;
          } catch {
            throw new Error(`ENOENT: no such file or directory, open '${fileName}'`);
          }
  }
  
  // For other notice types, we could add more fixtures here
  throw new Error(`ENOENT: no such file or directory, open '${fileName}'`);
}

/**
 * Validate the notice data against the expected schema
 */
function validateNoticeSchema(data: unknown): { valid: boolean; error?: string; code?: ParseNoticeError['code'] } {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      error: 'Invalid notice data: expected an object',
      code: 'MISSING_FIELDS',
    };
  }

  // Check required top-level fields
  const requiredFields = [
    'noticeType', 'caseNumber', 'court', 'noticeDate', 'hearingDate',
    'plaintiff', 'defendant', 'propertyAddress', 'rentOwed', 'noticeDescription',
    'glossaryTerms', 'timeline', 'metadata'
  ];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      return {
        valid: false,
        error: `Missing required field: ${field}`,
        code: 'MISSING_FIELDS',
      };
    }
  }
  
  // Type assertion for object access
  const noticeData = data as Record<string, unknown>;
  
  // Validate notice type
  if (noticeData.noticeType !== 'eviction') {
    return {
      valid: false,
      error: `Invalid notice type: expected 'eviction', got '${noticeData.noticeType}'`,
      code: 'INVALID_TYPES',
    };
  }
  
  // Validate case number format (Indiana Uniform Case Numbering System)
  const caseNumberPattern = /^\d{2}[A-Z]\d{2}-\d{4}-[A-Z]{2}-\d{6}$/;
  if (!caseNumberPattern.test(noticeData.caseNumber as string)) {
    return {
      valid: false,
      error: `Invalid case number format: ${noticeData.caseNumber}. Expected format: 49K01-2510-EV-001234`,
      code: 'INVALID_TYPES' as const,
    };
  }
  
  // Validate court object structure
  const requiredCourtFields = ['code', 'name', 'county', 'state', 'address', 'phone', 'hours'];
  const courtData = noticeData.court as Record<string, unknown>;
  for (const field of requiredCourtFields) {
    if (!(field in courtData) || typeof courtData[field] !== 'string') {
      return {
        valid: false,
        error: `Invalid court.${field}: expected string`,
        code: 'INVALID_TYPES',
      };
    }
  }
  
  // Validate plaintiff and defendant objects
  const requiredPartyFields = ['name', 'address'];
  for (const party of ['plaintiff', 'defendant']) {
    const partyData = noticeData[party] as Record<string, unknown>;
    for (const field of requiredPartyFields) {
      if (!(field in partyData) || typeof partyData[field] !== 'string') {
        return {
          valid: false,
          error: `Invalid ${party}.${field}: expected string`,
          code: 'INVALID_TYPES',
        };
      }
    }
  }
  
  // Validate glossary terms array
  if (!Array.isArray(noticeData.glossaryTerms) || !(noticeData.glossaryTerms as unknown[]).every((term: unknown) => typeof term === 'string')) {
    return {
      valid: false,
      error: 'Invalid glossaryTerms: expected array of strings',
      code: 'INVALID_TYPES' as const,
    };
  }
  
  // Validate timeline object
  const requiredTimelineFields = ['noticeGiven', 'responseDue', 'hearingScheduled'];
  const timelineData = noticeData.timeline as Record<string, unknown>;
  for (const field of requiredTimelineFields) {
    if (!(field in timelineData) || typeof timelineData[field] !== 'string') {
      return {
        valid: false,
        error: `Invalid timeline.${field}: expected string`,
        code: 'INVALID_TYPES',
      };
    }
  }
  
  // Validate metadata object
  const requiredMetadataFields = ['source', 'caseType', 'jurisdiction', 'filingFee', 'serviceFee'];
  const metadataData = noticeData.metadata as Record<string, unknown>;
  for (const field of requiredMetadataFields) {
    if (!(field in metadataData) || typeof metadataData[field] !== 'string') {
      return {
        valid: false,
        error: `Invalid metadata.${field}: expected string`,
        code: 'INVALID_TYPES',
      };
    }
  }
  
  return { valid: true };
}

/**
 * Parse validated notice data into structured result
 */
function parseNoticeData(notice: MarionCountyEvictionNotice): ParsedNoticeResult {
  // Parse dates
  const noticeDate = new Date(notice.noticeDate);
  const responseDueDate = new Date(notice.timeline.responseDue);
  const hearingDate = new Date(notice.timeline.hearingScheduled);
  
  return {
    case: {
      caseType: notice.metadata.caseType,
      jurisdiction: notice.metadata.jurisdiction,
      caseNumber: notice.caseNumber,
      title: `Eviction Defense - ${notice.court.county}`,
      notes: `Case created from uploaded eviction notice.

**Eviction Details:**
- Notice Type: ${notice.noticeDescription}
- Date Received: ${notice.noticeDate}
- Location: ${notice.propertyAddress}
- Court: ${notice.court.name}
- Case Number: ${notice.caseNumber}

**Parties:**
- Plaintiff: ${notice.plaintiff.name}
- Defendant: ${notice.defendant.name}

**Financial:**
- Rent Owed: ${notice.rentOwed}
- Filing Fee: ${notice.metadata.filingFee}
- Service Fee: ${notice.metadata.serviceFee}`,
      courtInfo: {
        code: notice.court.code,
        name: notice.court.name,
        address: notice.court.address,
        phone: notice.court.phone,
        hours: notice.court.hours,
      },
      parties: {
        plaintiff: notice.plaintiff.name,
        defendant: notice.defendant.name,
      },
      propertyAddress: notice.propertyAddress,
      rentOwed: notice.rentOwed,
      noticeDescription: notice.noticeDescription,
    },
    timeline: {
      noticeDate,
      responseDueDate,
      hearingDate,
    },
    glossaryKeys: notice.glossaryTerms,
    metadata: {
      source: notice.metadata.source,
      filingFee: notice.metadata.filingFee,
      serviceFee: notice.metadata.serviceFee,
    },
  };
}

/**
 * Get available notice file names
 * 
 * This function returns the list of available notice fixtures that can be parsed.
 * In a real implementation, this might scan the imports directory.
 */
export function getAvailableNoticeFiles(): string[] {
  return [
    'eviction.notice.json',
    // Future notice types can be added here
  ];
}

/**
 * Check if a notice file is supported
 */
export function isNoticeFileSupported(fileName: string): boolean {
  return getAvailableNoticeFiles().includes(fileName);
}
