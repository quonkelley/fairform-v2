import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Demo Import Fixtures", () => {
  const fixturesDir = join(process.cwd(), "lib/demo/imports");
  
  const fixtureFiles = [
    "eviction.notice.json",
    "eviction-downtown.notice.json", 
    "debt-collection.notice.json",
    "debt-collection-medical.notice.json",
    "small-claims.notice.json",
    "small-claims-landlord.notice.json",
    "small-claims-complex.notice.json"
  ];

  describe("JSON Validity", () => {
    fixtureFiles.forEach(filename => {
      it(`should parse ${filename} as valid JSON`, () => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        
        expect(() => {
          JSON.parse(fileContent);
        }).not.toThrow();
      });
    });
  });

  describe("Required Fields", () => {
    fixtureFiles.forEach(filename => {
      it(`should have all required fields in ${filename}`, () => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        const fixture = JSON.parse(fileContent);
        
        // Required top-level fields
        expect(fixture).toHaveProperty("noticeType");
        expect(fixture).toHaveProperty("caseNumber");
        expect(fixture).toHaveProperty("court");
        expect(fixture).toHaveProperty("noticeDate");
        expect(fixture).toHaveProperty("hearingDate");
        expect(fixture).toHaveProperty("plaintiff");
        expect(fixture).toHaveProperty("defendant");
        expect(fixture).toHaveProperty("glossaryTerms");
        expect(fixture).toHaveProperty("timeline");
        expect(fixture).toHaveProperty("metadata");
        
        // Court object fields
        expect(fixture.court).toHaveProperty("code");
        expect(fixture.court).toHaveProperty("name");
        expect(fixture.court).toHaveProperty("county");
        expect(fixture.court).toHaveProperty("state");
        expect(fixture.court).toHaveProperty("address");
        expect(fixture.court).toHaveProperty("phone");
        expect(fixture.court).toHaveProperty("hours");
        
        // Party objects
        expect(fixture.plaintiff).toHaveProperty("name");
        expect(fixture.plaintiff).toHaveProperty("address");
        expect(fixture.defendant).toHaveProperty("name");
        expect(fixture.defendant).toHaveProperty("address");
        
        // Timeline object
        expect(fixture.timeline).toHaveProperty("noticeGiven");
        expect(fixture.timeline).toHaveProperty("responseDue");
        expect(fixture.timeline).toHaveProperty("hearingScheduled");
        
        // Metadata object
        expect(fixture.metadata).toHaveProperty("source");
        expect(fixture.metadata).toHaveProperty("caseType");
        expect(fixture.metadata).toHaveProperty("jurisdiction");
        expect(fixture.metadata).toHaveProperty("filingFee");
        expect(fixture.metadata).toHaveProperty("serviceFee");
      });
    });
  });

  describe("Case Number Format", () => {
    fixtureFiles.forEach(filename => {
      it(`should have valid case number format in ${filename}`, () => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        const fixture = JSON.parse(fileContent);
        
        // Case number should follow Indiana format: 49K01-2510-XX-XXXXX
        const caseNumberPattern = /^49K\d{2}-\d{4}-[A-Z]{2}-\d{6}$/;
        expect(fixture.caseNumber).toMatch(caseNumberPattern);
      });
    });
  });

  describe("Date Format", () => {
    fixtureFiles.forEach(filename => {
      it(`should have valid date formats in ${filename}`, () => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        const fixture = JSON.parse(fileContent);
        
        // Dates should be in YYYY-MM-DD format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        expect(fixture.noticeDate).toMatch(datePattern);
        expect(fixture.hearingDate).toMatch(datePattern);
        expect(fixture.timeline.noticeGiven).toMatch(datePattern);
        expect(fixture.timeline.responseDue).toMatch(datePattern);
        expect(fixture.timeline.hearingScheduled).toMatch(datePattern);
      });
    });
  });

  describe("Glossary Terms", () => {
    fixtureFiles.forEach(filename => {
      it(`should have non-empty glossary terms array in ${filename}`, () => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        const fixture = JSON.parse(fileContent);
        
        expect(Array.isArray(fixture.glossaryTerms)).toBe(true);
        expect(fixture.glossaryTerms.length).toBeGreaterThan(0);
        
        // All glossary terms should be strings
        fixture.glossaryTerms.forEach((term: any) => {
          expect(typeof term).toBe("string");
          expect(term.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Case Type Consistency", () => {
    it("should have consistent case types across all fields", () => {
      fixtureFiles.forEach(filename => {
        const filePath = join(fixturesDir, filename);
        const fileContent = readFileSync(filePath, "utf-8");
        const fixture = JSON.parse(fileContent);
        
        // noticeType should match metadata.caseType
        expect(fixture.noticeType).toBe(fixture.metadata.caseType);
        
        // Case number should contain the correct type code
        const caseTypeCode = fixture.caseNumber.split("-")[2];
        const expectedCodes: Record<string, string> = {
          "eviction": "EV",
          "debt_collection": "DC", 
          "small_claims": "SC"
        };
        
        expect(caseTypeCode).toBe(expectedCodes[fixture.noticeType]);
      });
    });
  });
});
