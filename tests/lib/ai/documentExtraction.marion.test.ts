import { describe, it, expect } from 'vitest';
import {
  validateMarionCountyCaseNumber,
  parseMarionCountyCaseNumber,
  isMarionCountyCase,
  isValidCaseNumberEnhanced,
  getCourtInfo,
  calculateMarionCountyTimeline,
  MARION_COUNTY_COURTS
} from '@/lib/ai/documentExtraction';

describe('Marion County Document Extraction', () => {
  describe('validateMarionCountyCaseNumber', () => {
    it('should validate correct Marion County case numbers', () => {
      expect(validateMarionCountyCaseNumber('49K01-2510-EV-001234')).toBe(true);
      expect(validateMarionCountyCaseNumber('49K02-2510-SC-001235')).toBe(true);
      expect(validateMarionCountyCaseNumber('49K09-2405-EV-999999')).toBe(true);
    });

    it('should reject invalid Marion County case numbers', () => {
      expect(validateMarionCountyCaseNumber('49K01-2510-EV-1234')).toBe(false); // Too few digits
      expect(validateMarionCountyCaseNumber('49K10-2510-EV-001234')).toBe(false); // Invalid township
      expect(validateMarionCountyCaseNumber('50K01-2510-EV-001234')).toBe(false); // Wrong county
      expect(validateMarionCountyCaseNumber('49K01-2510-XX-001234')).toBe(false); // Invalid case type
      expect(validateMarionCountyCaseNumber('49-K01-2510-EV-001234')).toBe(false); // Wrong format (with dash)
    });
  });

  describe('parseMarionCountyCaseNumber', () => {
    it('should parse eviction case numbers correctly', () => {
      const result = parseMarionCountyCaseNumber('49K01-2510-EV-001234');
      
      expect(result).toEqual({
        county: 'Marion County',
        township: 'Center Township',
        townshipCode: 'K01',
        yearMonth: '2510',
        caseType: 'eviction',
        sequence: '001234',
        fullJurisdiction: 'Marion County, IN - Center Township Small Claims Court',
        courtInfo: MARION_COUNTY_COURTS.K01
      });
    });

    it('should parse small claims case numbers correctly', () => {
      const result = parseMarionCountyCaseNumber('49K05-2405-SC-001235');
      
      expect(result).toEqual({
        county: 'Marion County',
        township: 'Perry Township',
        townshipCode: 'K05',
        yearMonth: '2405',
        caseType: 'small_claims',
        sequence: '001235',
        fullJurisdiction: 'Marion County, IN - Perry Township Small Claims Court',
        courtInfo: MARION_COUNTY_COURTS.K05
      });
    });

    it('should return null for invalid case numbers', () => {
      expect(parseMarionCountyCaseNumber('invalid')).toBeNull();
      expect(parseMarionCountyCaseNumber('49K01-2510-EV-1234')).toBeNull();
      expect(parseMarionCountyCaseNumber('50K01-2510-EV-001234')).toBeNull();
    });
  });

  describe('isMarionCountyCase', () => {
    it('should identify Marion County cases', () => {
      expect(isMarionCountyCase('49K01-2510-EV-001234')).toBe(true);
      expect(isMarionCountyCase('49K02-2405-SC-001235')).toBe(true);
    });

    it('should reject non-Marion County cases', () => {
      expect(isMarionCountyCase('50K01-2510-EV-001234')).toBe(false);
      expect(isMarionCountyCase('12-3456-CV')).toBe(false);
      expect(isMarionCountyCase('2024CV00123')).toBe(false);
    });
  });

  describe('isValidCaseNumberEnhanced', () => {
    it('should validate Marion County cases', () => {
      expect(isValidCaseNumberEnhanced('49K01-2510-EV-001234')).toBe(true);
      expect(isValidCaseNumberEnhanced('49K02-2405-SC-001235')).toBe(true);
    });

    it('should validate general case number formats', () => {
      expect(isValidCaseNumberEnhanced('12-3456-CV')).toBe(true);
      expect(isValidCaseNumberEnhanced('2024CV00123')).toBe(true);
      expect(isValidCaseNumberEnhanced('CV-2024-00123')).toBe(true);
    });

    it('should reject invalid case numbers', () => {
      expect(isValidCaseNumberEnhanced('invalid')).toBe(false);
      expect(isValidCaseNumberEnhanced('49K01-2510-EV-1234')).toBe(false);
      expect(isValidCaseNumberEnhanced('')).toBe(false);
    });
  });

  describe('getCourtInfo', () => {
    it('should return court information for valid township codes', () => {
      const centerCourt = getCourtInfo('K01');
      expect(centerCourt).toEqual(MARION_COUNTY_COURTS.K01);
      expect(centerCourt?.name).toBe('Center Township Small Claims Court');

      const perryCourt = getCourtInfo('K05');
      expect(perryCourt).toEqual(MARION_COUNTY_COURTS.K05);
      expect(perryCourt?.name).toBe('Perry Township Small Claims Court');
    });

    it('should return null for invalid township codes', () => {
      expect(getCourtInfo('K10')).toBeNull();
      expect(getCourtInfo('invalid')).toBeNull();
      expect(getCourtInfo('')).toBeNull();
    });
  });

  describe('calculateMarionCountyTimeline', () => {
    it('should calculate eviction timeline correctly', () => {
      const noticeDate = '2025-10-10';
      const timeline = calculateMarionCountyTimeline(noticeDate, 'eviction');
      
      const notice = new Date(noticeDate);
      const expectedResponseDue = new Date(notice.getTime() + 10 * 24 * 60 * 60 * 1000);
      const expectedHearing = new Date(notice.getTime() + 21 * 24 * 60 * 60 * 1000);
      const expectedWrit = new Date(notice.getTime() + 23 * 24 * 60 * 60 * 1000);
      
      expect(timeline.responseDue.toDateString()).toBe(expectedResponseDue.toDateString());
      expect(timeline.hearingScheduled.toDateString()).toBe(expectedHearing.toDateString());
      expect(timeline.writExecution?.toDateString()).toBe(expectedWrit.toDateString());
    });

    it('should calculate small claims timeline correctly', () => {
      const noticeDate = '2025-10-10';
      const timeline = calculateMarionCountyTimeline(noticeDate, 'small_claims');
      
      const notice = new Date(noticeDate);
      const expectedResponseDue = new Date(notice.getTime() + 5 * 24 * 60 * 60 * 1000);
      const expectedHearing = new Date(notice.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      expect(timeline.responseDue.toDateString()).toBe(expectedResponseDue.toDateString());
      expect(timeline.hearingScheduled.toDateString()).toBe(expectedHearing.toDateString());
      expect(timeline.writExecution).toBeUndefined();
    });
  });

  describe('MARION_COUNTY_COURTS', () => {
    it('should have all required township courts', () => {
      const expectedTownships = ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09'];
      
      expectedTownships.forEach(code => {
        expect(MARION_COUNTY_COURTS[code as keyof typeof MARION_COUNTY_COURTS]).toBeDefined();
      });
    });

    it('should have complete court information for each township', () => {
      Object.values(MARION_COUNTY_COURTS).forEach(court => {
        expect(court.name).toBeDefined();
        expect(court.address).toBeDefined();
        expect(court.phone).toBeDefined();
        expect(court.hours).toBeDefined();
        
        expect(court.name).toContain('Small Claims Court');
        expect(court.address).toContain('Indianapolis, IN');
        expect(court.phone).toMatch(/^\(\d{3}\) \d{3}-\d{4}$/);
        expect(court.hours).toContain('Monday-Friday');
      });
    });
  });
});
