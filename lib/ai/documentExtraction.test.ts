import { describe, it, expect } from 'vitest';
import {
  fileToBase64,
  normalizeDateString,
  isValidCaseNumber,
  getConfidenceLevel,
} from './documentExtraction';

describe('documentExtraction', () => {
  describe('fileToBase64', () => {
    it('should convert file to base64 string', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const base64 = await fileToBase64(mockFile);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
      // Base64 should not include the data URL prefix
      expect(base64).not.toContain('data:');
    });

    it('should handle image files', async () => {
      const mockFile = new File(['fake image data'], 'test.png', { type: 'image/png' });
      const base64 = await fileToBase64(mockFile);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
    });
  });

  describe('normalizeDateString', () => {
    it('should normalize valid date strings to ISO 8601', () => {
      expect(normalizeDateString('2024-01-15')).toBe('2024-01-15');
      expect(normalizeDateString('January 15, 2024')).toBe('2024-01-15');
      expect(normalizeDateString('1/15/2024')).toBe('2024-01-15');
    });

    it('should return null for invalid date strings', () => {
      expect(normalizeDateString('not a date')).toBe(null);
      expect(normalizeDateString('')).toBe(null);
      expect(normalizeDateString('??/??/????')).toBe(null);
    });

    it('should handle various date formats', () => {
      const result1 = normalizeDateString('Dec 25, 2024');
      expect(result1).toBe('2024-12-25');

      const result2 = normalizeDateString('2024/12/25');
      expect(result2).toBe('2024-12-25');
    });
  });

  describe('isValidCaseNumber', () => {
    it('should validate common case number formats', () => {
      expect(isValidCaseNumber('12-3456-CV')).toBe(true);
      expect(isValidCaseNumber('2024CV00123')).toBe(true);
      expect(isValidCaseNumber('CV-2024-00123')).toBe(true);
      expect(isValidCaseNumber('2024-CV-00123')).toBe(true);
    });

    it('should reject invalid case numbers', () => {
      expect(isValidCaseNumber('')).toBe(false);
      expect(isValidCaseNumber('AB')).toBe(false);
      expect(isValidCaseNumber('123')).toBe(false);
      expect(isValidCaseNumber('not-a-case')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isValidCaseNumber('12-3456-cv')).toBe(true);
      expect(isValidCaseNumber('2024cv00123')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isValidCaseNumber('99-9999-ABC')).toBe(true);
      expect(isValidCaseNumber('2024ABCD12345')).toBe(true);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for scores >= 0.8', () => {
      expect(getConfidenceLevel(0.8)).toBe('high');
      expect(getConfidenceLevel(0.9)).toBe('high');
      expect(getConfidenceLevel(1.0)).toBe('high');
    });

    it('should return medium for scores >= 0.5 and < 0.8', () => {
      expect(getConfidenceLevel(0.5)).toBe('medium');
      expect(getConfidenceLevel(0.6)).toBe('medium');
      expect(getConfidenceLevel(0.79)).toBe('medium');
    });

    it('should return low for scores < 0.5', () => {
      expect(getConfidenceLevel(0.0)).toBe('low');
      expect(getConfidenceLevel(0.3)).toBe('low');
      expect(getConfidenceLevel(0.49)).toBe('low');
    });
  });
});
