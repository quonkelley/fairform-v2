import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDemoNotice, getAvailableNoticeFiles, isNoticeFileSupported } from '@/lib/demo/importNotice';

// Mock the demo config timing
vi.mock('@/lib/demo/demoConfig', () => ({
  demoConfig: {
    timing: {
      scanDelay: 0, // No delay in tests
    },
  },
}));

describe('parseDemoNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('should successfully parse eviction notice fixture', async () => {
      const result = await parseDemoNotice('eviction.notice.json');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.case.caseType).toBe('eviction');
        expect(result.data.case.caseNumber).toBe('49K01-2510-EV-001234');
        expect(result.data.case.jurisdiction).toBe('Marion County, IN - Center Township Small Claims Court');
        expect(result.data.case.title).toBe('Eviction Defense - Marion County');
        expect(result.data.case.parties.plaintiff).toBe('ABC Property Management LLC');
        expect(result.data.case.parties.defendant).toBe('Alex Rodriguez');
        expect(result.data.case.propertyAddress).toBe('1234 E. 38th Street, Indianapolis, IN 46205');
        expect(result.data.case.rentOwed).toBe('$1,200.00');
        expect(result.data.case.noticeDescription).toBe('10-day notice to pay or quit');
        
        // Verify court info
        expect(result.data.case.courtInfo.code).toBe('K01');
        expect(result.data.case.courtInfo.name).toBe('Center Township Small Claims Court');
        expect(result.data.case.courtInfo.address).toBe('7201 E. 75th Street, Indianapolis, IN 46256');
        expect(result.data.case.courtInfo.phone).toBe('(317) 595-5000');
        expect(result.data.case.courtInfo.hours).toBe('Monday-Friday 8:00 AM - 4:30 PM');
        
        // Verify timeline
        expect(result.data.timeline.noticeDate).toEqual(new Date('2025-10-10'));
        expect(result.data.timeline.responseDueDate).toEqual(new Date('2025-10-20'));
        expect(result.data.timeline.hearingDate).toEqual(new Date('2025-11-06'));
        
        // Verify glossary keys
        expect(result.data.glossaryKeys).toEqual(['eviction-notice', 'answer', 'default-judgment', 'habitability']);
        
        // Verify metadata
        expect(result.data.metadata.source).toBe('Marion County Civil Data Access Research');
        expect(result.data.metadata.filingFee).toBe('$86.00');
        expect(result.data.metadata.serviceFee).toBe('$28.00');
      }
    });

    it('should include detailed notes with eviction information', async () => {
      const result = await parseDemoNotice('eviction.notice.json');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.case.notes).toContain('Case created from uploaded eviction notice');
        expect(result.data.case.notes).toContain('Notice Type: 10-day notice to pay or quit');
        expect(result.data.case.notes).toContain('Date Received: 2025-10-10');
        expect(result.data.case.notes).toContain('Location: 1234 E. 38th Street, Indianapolis, IN 46205');
        expect(result.data.case.notes).toContain('Court: Center Township Small Claims Court');
        expect(result.data.case.notes).toContain('Case Number: 49K01-2510-EV-001234');
        expect(result.data.case.notes).toContain('Plaintiff: ABC Property Management LLC');
        expect(result.data.case.notes).toContain('Defendant: Alex Rodriguez');
        expect(result.data.case.notes).toContain('Rent Owed: $1,200.00');
        expect(result.data.case.notes).toContain('Filing Fee: $86.00');
        expect(result.data.case.notes).toContain('Service Fee: $28.00');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return error for unknown filename', async () => {
      const result = await parseDemoNotice('unknown.notice.json');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Notice file 'unknown.notice.json' not found");
        expect(result.code).toBe('UNKNOWN_FILE');
      }
    });
  });

  describe('Utility Functions', () => {
    it('should return available notice files', () => {
      const files = getAvailableNoticeFiles();
      expect(files).toContain('eviction.notice.json');
    });

    it('should check if notice file is supported', () => {
      expect(isNoticeFileSupported('eviction.notice.json')).toBe(true);
      expect(isNoticeFileSupported('unknown.notice.json')).toBe(false);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for successful parsing result', async () => {
      const result = await parseDemoNotice('eviction.notice.json');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchSnapshot();
      }
    });

    it('should match snapshot for error result', async () => {
      const result = await parseDemoNotice('unknown.notice.json');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toMatchSnapshot();
      }
    });
  });
});