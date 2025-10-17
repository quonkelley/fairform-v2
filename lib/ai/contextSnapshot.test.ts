/**
 * Tests for Context Snapshot Service
 *
 * Story: 13.10 - Context Snapshot System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { CaseType } from './types';
import {
  createContextSnapshot,
  generateSnapshotHash,
  validateSnapshot,
  snapshotsEqual,
  createFallbackSnapshot,
  extractContextFromSnapshot,
  getSnapshotSize,
  mergeSnapshots,
  SnapshotMonitor,
  type PartialContext,
} from './contextSnapshot';

describe('contextSnapshot', () => {
  describe('createContextSnapshot', () => {
    it('creates valid snapshot from full context', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
          currentStepOrder: 2,
          progressPct: 50,
        },
        user: {
          preferences: {
            tone: 'friendly',
            complexity: 'simple',
          },
        },
        conversationStage: 'GATHER_MIN',
        collectedInfo: {
          caseType: 'small_claims',
          jurisdiction: 'Los Angeles County',
        },
      };

      const snapshot = createContextSnapshot(context);

      expect(snapshot.caseType).toBe('small_claims');
      expect(snapshot.jurisdiction).toBe('Los Angeles County');
      expect(snapshot.currentStepOrder).toBe(2);
      expect(snapshot.progressPct).toBe(50);
      expect(snapshot.userPrefs?.tone).toBe('friendly');
      expect(snapshot.conversationStage).toBe('GATHER_MIN');
      expect(snapshot.hash).toHaveLength(64); // SHA-256 hex
    });

    it('creates snapshot with partial context', () => {
      const context: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);

      expect(snapshot.caseType).toBe('eviction');
      expect(snapshot.jurisdiction).toBeUndefined();
      expect(snapshot.hash).toHaveLength(64);
    });

    it('creates snapshot with empty context', () => {
      const context: PartialContext = {};

      const snapshot = createContextSnapshot(context);

      expect(snapshot.caseType).toBeUndefined();
      expect(snapshot.hash).toHaveLength(64);
    });

    it('respects size limits', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const snapshot = createContextSnapshot(context);
      const size = getSnapshotSize(snapshot);

      // Snapshots should be small
      expect(size).toBeLessThan(1024); // 1KB
    });
  });

  describe('generateSnapshotHash', () => {
    it('generates consistent hash for same data', () => {
      const snapshotData = {
        caseType: 'eviction' as CaseType,
        jurisdiction: 'Los Angeles County',
        currentStepOrder: 1,
        progressPct: 25,
      };

      const hash1 = generateSnapshotHash(snapshotData);
      const hash2 = generateSnapshotHash(snapshotData);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('generates different hash for different data', () => {
      const snapshot1 = {
        caseType: 'eviction' as CaseType,
      };

      const snapshot2 = {
        caseType: 'small_claims' as CaseType,
      };

      const hash1 = generateSnapshotHash(snapshot1);
      const hash2 = generateSnapshotHash(snapshot2);

      expect(hash1).not.toBe(hash2);
    });

    it('handles undefined values consistently', () => {
      const snapshot1 = {
        caseType: undefined,
        jurisdiction: undefined,
      };

      const snapshot2 = {
        caseType: undefined,
        jurisdiction: undefined,
      };

      const hash1 = generateSnapshotHash(snapshot1);
      const hash2 = generateSnapshotHash(snapshot2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('validateSnapshot', () => {
    it('validates correct snapshot', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const snapshot = createContextSnapshot(context);
      const validated = validateSnapshot(snapshot);

      expect(validated).not.toBeNull();
      expect(validated?.hash).toBe(snapshot.hash);
    });

    it('rejects snapshot with invalid hash', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);
      const corruptedSnapshot = {
        ...snapshot,
        hash: 'invalid_hash_0000000000000000000000000000000000000000000000000000',
      };

      const validated = validateSnapshot(corruptedSnapshot);

      expect(validated).toBeNull();
    });

    it('rejects invalid case type', () => {
      const invalidSnapshot = {
        caseType: 'invalid_type',
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
      };

      const validated = validateSnapshot(invalidSnapshot);

      expect(validated).toBeNull();
    });

    it('rejects non-object input', () => {
      const validated = validateSnapshot('not an object');

      expect(validated).toBeNull();
    });
  });

  describe('snapshotsEqual', () => {
    it('returns true for snapshots with same hash', () => {
      const context: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const snapshot1 = createContextSnapshot(context);
      const snapshot2 = createContextSnapshot(context);

      expect(snapshotsEqual(snapshot1, snapshot2)).toBe(true);
    });

    it('returns false for snapshots with different hash', () => {
      const context1: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const context2: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const snapshot1 = createContextSnapshot(context1);
      const snapshot2 = createContextSnapshot(context2);

      expect(snapshotsEqual(snapshot1, snapshot2)).toBe(false);
    });

    it('returns false for null snapshots', () => {
      const context: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);

      expect(snapshotsEqual(snapshot, null)).toBe(false);
      expect(snapshotsEqual(null, snapshot)).toBe(false);
      expect(snapshotsEqual(null, null)).toBe(false);
    });
  });

  describe('createFallbackSnapshot', () => {
    it('creates minimal snapshot', () => {
      const snapshot = createFallbackSnapshot();

      expect(snapshot.caseType).toBeUndefined();
      expect(snapshot.jurisdiction).toBeUndefined();
      expect(snapshot.hash).toHaveLength(64);
    });

    it('creates consistent fallback', () => {
      const snapshot1 = createFallbackSnapshot();
      const snapshot2 = createFallbackSnapshot();

      expect(snapshot1.hash).toBe(snapshot2.hash);
    });
  });

  describe('extractContextFromSnapshot', () => {
    it('extracts context for prompt building', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
          currentStepOrder: 2,
          progressPct: 50,
        },
      };

      const snapshot = createContextSnapshot(context);
      const extracted = extractContextFromSnapshot(snapshot);

      expect(extracted.caseType).toBe('small_claims');
      expect(extracted.case?.caseType).toBe('small_claims');
      expect(extracted.case?.jurisdiction).toBe('Los Angeles County');
      expect(extracted.case?.currentStepOrder).toBe(2);
      expect(extracted.case?.progressPct).toBe(50);
    });

    it('handles snapshot without case', () => {
      const snapshot = createFallbackSnapshot();
      const extracted = extractContextFromSnapshot(snapshot);

      expect(extracted.caseType).toBeUndefined();
      expect(extracted.case).toBeUndefined();
    });
  });

  describe('getSnapshotSize', () => {
    it('calculates size in bytes', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const snapshot = createContextSnapshot(context);
      const size = getSnapshotSize(snapshot);

      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('larger snapshots have larger size', () => {
      const smallContext: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const largeContext: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
          currentStepOrder: 2,
          progressPct: 50,
        },
        user: {
          preferences: {
            tone: 'friendly',
            complexity: 'detailed',
            aiParticipation: true,
            timeZone: 'America/Los_Angeles',
          },
        },
      };

      const smallSnapshot = createContextSnapshot(smallContext);
      const largeSnapshot = createContextSnapshot(largeContext);

      expect(getSnapshotSize(largeSnapshot)).toBeGreaterThan(getSnapshotSize(smallSnapshot));
    });
  });

  describe('mergeSnapshots', () => {
    it('merges new values into old snapshot', () => {
      const context1: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const oldSnapshot = createContextSnapshot(context1);
      const newPartial = {
        currentStepOrder: 2,
        progressPct: 50,
      };

      const merged = mergeSnapshots(oldSnapshot, newPartial);

      expect(merged.caseType).toBe('eviction');
      expect(merged.jurisdiction).toBe('Los Angeles County');
      expect(merged.currentStepOrder).toBe(2);
      expect(merged.progressPct).toBe(50);
      expect(merged.hash).not.toBe(oldSnapshot.hash); // Hash should change
    });

    it('overwrites old values with new values', () => {
      const context1: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
          jurisdiction: 'San Francisco County',
        },
      };

      const oldSnapshot = createContextSnapshot(context1);
      const newPartial = {
        jurisdiction: 'Los Angeles County',
      };

      const merged = mergeSnapshots(oldSnapshot, newPartial);

      expect(merged.jurisdiction).toBe('Los Angeles County');
    });

    it('preserves old values when new values are undefined', () => {
      const context1: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const oldSnapshot = createContextSnapshot(context1);
      const newPartial = {
        currentStepOrder: 2,
      };

      const merged = mergeSnapshots(oldSnapshot, newPartial);

      expect(merged.caseType).toBe('eviction');
      expect(merged.jurisdiction).toBe('Los Angeles County');
      expect(merged.currentStepOrder).toBe(2);
    });
  });

  describe('SnapshotMonitor', () => {
    let monitor: SnapshotMonitor;

    beforeEach(() => {
      monitor = new SnapshotMonitor();
    });

    it('tracks snapshot creation', () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);
      monitor.recordSnapshotCreation(snapshot);

      const metrics = monitor.getMetrics();

      expect(metrics.totalSnapshots).toBe(1);
      expect(metrics.averageSize).toBeGreaterThan(0);
    });

    it('tracks multiple snapshots', () => {
      const context1: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const context2: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const snapshot1 = createContextSnapshot(context1);
      const snapshot2 = createContextSnapshot(context2);

      monitor.recordSnapshotCreation(snapshot1);
      monitor.recordSnapshotCreation(snapshot2);

      const metrics = monitor.getMetrics();

      expect(metrics.totalSnapshots).toBe(2);
    });

    it('tracks validation errors', () => {
      monitor.recordValidationError();
      monitor.recordValidationError();

      const metrics = monitor.getMetrics();

      expect(metrics.validationErrors).toBe(2);
    });

    it('tracks updates', () => {
      monitor.recordUpdate();
      monitor.recordUpdate();
      monitor.recordUpdate();

      const metrics = monitor.getMetrics();

      expect(metrics.updateCount).toBe(3);
    });

    it('resets metrics', () => {
      const context: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);
      monitor.recordSnapshotCreation(snapshot);
      monitor.recordUpdate();

      monitor.reset();

      const metrics = monitor.getMetrics();

      expect(metrics.totalSnapshots).toBe(0);
      expect(metrics.updateCount).toBe(0);
    });
  });
});
