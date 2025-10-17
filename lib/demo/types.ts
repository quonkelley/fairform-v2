// Note: These types are imported for reference but not used directly in this file
// They define the target schemas that the parsed data will be mapped to

/**
 * Marion County eviction notice JSON structure
 * 
 * This represents the raw fixture data that would be parsed from an uploaded
 * eviction notice document (simulated OCR output).
 */
export interface MarionCountyEvictionNotice {
  noticeType: 'eviction';
  caseNumber: string;
  court: {
    code: string;
    name: string;
    county: string;
    state: string;
    address: string;
    phone: string;
    hours: string;
  };
  noticeDate: string; // ISO date string
  hearingDate: string; // ISO date string
  plaintiff: {
    name: string;
    address: string;
  };
  defendant: {
    name: string;
    address: string;
  };
  propertyAddress: string;
  rentOwed: string;
  noticeDescription: string;
  glossaryTerms: string[]; // Array of glossary term IDs
  timeline: {
    noticeGiven: string; // ISO date string
    responseDue: string; // ISO date string
    hearingScheduled: string; // ISO date string
  };
  metadata: {
    source: string;
    caseType: string;
    jurisdiction: string;
    filingFee: string;
    serviceFee: string;
  };
}

/**
 * Parsed notice result containing case data and metadata
 * 
 * This is the structured output that downstream consumers (like case creation)
 * will use to build Case and CaseStep records.
 */
export interface ParsedNoticeResult {
  case: {
    caseType: string;
    jurisdiction: string;
    caseNumber: string;
    title: string;
    notes: string;
    courtInfo: {
      code: string;
      name: string;
      address: string;
      phone: string;
      hours: string;
    };
    parties: {
      plaintiff: string;
      defendant: string;
    };
    propertyAddress: string;
    rentOwed: string;
    noticeDescription: string;
  };
  timeline: {
    noticeDate: Date;
    responseDueDate: Date;
    hearingDate: Date;
  };
  glossaryKeys: string[];
  metadata: {
    source: string;
    filingFee: string;
    serviceFee: string;
  };
}

/**
 * Success result from parseDemoNotice
 */
export interface ParseNoticeSuccess {
  success: true;
  data: ParsedNoticeResult;
}

/**
 * Error result from parseDemoNotice
 */
export interface ParseNoticeError {
  success: false;
  error: string;
  code: 'UNKNOWN_FILE' | 'INVALID_JSON' | 'MISSING_FIELDS' | 'INVALID_TYPES';
}

/**
 * Discriminated union for parseDemoNotice results
 */
export type ParseNoticeResult = ParseNoticeSuccess | ParseNoticeError;

/**
 * Field mapping documentation for notice JSON to Case schema
 * 
 * This documents how notice JSON fields map to the Case and CaseStep schemas
 * used in the demo scenarios.
 */
export const NOTICE_FIELD_MAPPING = {
  // Case metadata mapping
  caseNumber: 'case.caseNumber',
  caseType: 'case.caseType',
  jurisdiction: 'case.jurisdiction',
  title: 'case.title',
  notes: 'case.notes',
  
  // Court information mapping
  courtCode: 'case.courtInfo.code',
  courtName: 'case.courtInfo.name',
  courtAddress: 'case.courtInfo.address',
  courtPhone: 'case.courtInfo.phone',
  courtHours: 'case.courtInfo.hours',
  
  // Party information mapping
  plaintiffName: 'case.parties.plaintiff',
  defendantName: 'case.parties.defendant',
  
  // Property and financial mapping
  propertyAddress: 'case.propertyAddress',
  rentOwed: 'case.rentOwed',
  noticeDescription: 'case.noticeDescription',
  
  // Timeline mapping (hearingDate maps to step due dates)
  noticeDate: 'timeline.noticeDate',
  responseDueDate: 'timeline.responseDueDate', // Maps to step 2 due date
  hearingDate: 'timeline.hearingDate', // Maps to step 4 due date
  
  // Glossary integration
  glossaryTerms: 'glossaryKeys', // Array of term IDs for downstream enrichment
  
  // Metadata mapping
  source: 'metadata.source',
  filingFee: 'metadata.filingFee',
  serviceFee: 'metadata.serviceFee',
} as const;

/**
 * Timeline calculation constants for Marion County eviction cases
 */
export const MARION_COUNTY_TIMELINE = {
  // 10-day notice period for non-payment evictions
  NOTICE_PERIOD_DAYS: 10,
  
  // 5-day response period after service
  RESPONSE_PERIOD_DAYS: 5,
  
  // 2-3 week hearing scheduling typical
  HEARING_SCHEDULING_WEEKS: 2.5,
} as const;
