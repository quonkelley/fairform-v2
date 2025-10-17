/**
 * Context Snapshot Service for AI Copilot
 *
 * Implements small, structured context snapshots with hash-based fingerprinting
 * for efficient context building and prompt caching.
 *
 * Story: 13.10 - Context Snapshot System
 */

import crypto from 'crypto';
import { z } from 'zod';
import type {
  ContextSnapshot,
  CaseType,
  UserPreferences,
  ConversationStage,
  MinimumCaseInfo,
  AIPromptContext,
} from './types';

// Configuration constants
const MAX_SNAPSHOT_SIZE = 1024; // 1KB limit

/**
 * Partial context data for snapshot creation
 */
export interface PartialContext {
  case?: {
    caseType?: CaseType;
    jurisdiction?: string;
    currentStepOrder?: number;
    progressPct?: number;
  };
  user?: {
    preferences?: UserPreferences;
  };
  conversationStage?: ConversationStage;
  collectedInfo?: MinimumCaseInfo;
}

/**
 * Zod schema for context snapshot validation
 */
export const ContextSnapshotSchema = z.object({
  caseType: z
    .enum([
      'eviction',
      'small_claims',
      'family_law',
      'debt',
      'employment',
      'housing',
      'consumer',
      'contract',
      'discrimination',
      'other_civil',
      'other',
    ])
    .optional(),
  jurisdiction: z.string().max(100).optional(),
  currentStepOrder: z.number().min(0).max(1000).optional(),
  progressPct: z.number().min(0).max(100).optional(),
  userPrefs: z
    .object({
      aiParticipation: z.boolean().optional(),
      timeZone: z.string().max(50).optional(),
      tone: z.enum(['formal', 'friendly', 'helpful']).optional(),
      complexity: z.enum(['simple', 'detailed']).optional(),
    })
    .optional(),
  conversationStage: z.enum(['GREET', 'GATHER_MIN', 'CONFIRM_CREATE', 'POST_CREATE_COACH']).optional(),
  collectedInfo: z
    .object({
      caseType: z.string().optional(),
      jurisdiction: z.string().optional(),
      caseNumber: z.string().optional(),
      hearingDate: z.string().optional(),
    })
    .optional(),
  hash: z.string().length(64), // SHA-256 hex string
});

/**
 * Generate SHA-256 hash from snapshot data
 */
export function generateSnapshotHash(
  snapshot: Omit<ContextSnapshot, 'hash'>
): string {
  // Create deterministic hash from snapshot data
  const hashData = {
    caseType: snapshot.caseType,
    jurisdiction: snapshot.jurisdiction,
    currentStepOrder: snapshot.currentStepOrder,
    progressPct: snapshot.progressPct,
    userPrefs: snapshot.userPrefs,
    conversationStage: snapshot.conversationStage,
    collectedInfo: snapshot.collectedInfo,
  };

  // Sort keys for deterministic hashing
  const sortedData = JSON.stringify(hashData, Object.keys(hashData).sort());

  return crypto.createHash('sha256').update(sortedData).digest('hex');
}

/**
 * Create a context snapshot from partial context data
 */
export function createContextSnapshot(context: PartialContext): ContextSnapshot {
  const snapshot: Omit<ContextSnapshot, 'hash'> = {
    caseType: context.case?.caseType,
    jurisdiction: context.case?.jurisdiction,
    currentStepOrder: context.case?.currentStepOrder,
    progressPct: context.case?.progressPct,
    userPrefs: context.user?.preferences,
    conversationStage: context.conversationStage,
    collectedInfo: context.collectedInfo,
  };

  // Generate hash
  const hash = generateSnapshotHash(snapshot);

  const fullSnapshot: ContextSnapshot = {
    ...snapshot,
    hash,
  };

  // Validate size limit
  const size = JSON.stringify(fullSnapshot).length;
  if (size > MAX_SNAPSHOT_SIZE) {
    console.warn(
      `[ContextSnapshot] Snapshot size (${size} bytes) exceeds limit (${MAX_SNAPSHOT_SIZE} bytes)`
    );
    // Still return snapshot but log warning
  }

  return fullSnapshot;
}

/**
 * Validate a context snapshot
 */
export function validateSnapshot(snapshot: unknown): ContextSnapshot | null {
  try {
    const validated = ContextSnapshotSchema.parse(snapshot);

    // Verify hash integrity
    const { hash, ...snapshotData } = validated;
    const expectedHash = generateSnapshotHash(snapshotData);

    if (hash !== expectedHash) {
      console.warn('[ContextSnapshot] Hash mismatch - snapshot may be corrupted');
      return null;
    }

    return validated as ContextSnapshot;
  } catch (error) {
    console.error('[ContextSnapshot] Validation failed:', error);
    return null;
  }
}

/**
 * Check if two snapshots are equal (by comparing hashes)
 */
export function snapshotsEqual(
  snapshot1: ContextSnapshot | null | undefined,
  snapshot2: ContextSnapshot | null | undefined
): boolean {
  if (!snapshot1 || !snapshot2) return false;
  return snapshot1.hash === snapshot2.hash;
}

/**
 * Create a fallback snapshot with minimal data
 */
export function createFallbackSnapshot(): ContextSnapshot {
  return {
    caseType: undefined,
    jurisdiction: undefined,
    currentStepOrder: undefined,
    progressPct: undefined,
    userPrefs: undefined,
    conversationStage: undefined,
    collectedInfo: undefined,
    hash: generateSnapshotHash({
      caseType: undefined,
      jurisdiction: undefined,
      currentStepOrder: undefined,
      progressPct: undefined,
      userPrefs: undefined,
      conversationStage: undefined,
      collectedInfo: undefined,
    }),
  };
}

/**
 * Extract context data from snapshot for prompt building
 */
export function extractContextFromSnapshot(
  snapshot: ContextSnapshot
): Partial<AIPromptContext> {
  return {
    caseType: snapshot.caseType,
    case: snapshot.caseType
      ? {
          id: '', // Will be populated by caller
          caseType: snapshot.caseType,
          jurisdiction: snapshot.jurisdiction,
          currentStepOrder: snapshot.currentStepOrder,
          progressPct: snapshot.progressPct,
        }
      : undefined,
  };
}

/**
 * Get snapshot size in bytes
 */
export function getSnapshotSize(snapshot: ContextSnapshot): number {
  return JSON.stringify(snapshot).length;
}

/**
 * Merge two snapshots, preferring non-undefined values from the newer snapshot
 */
export function mergeSnapshots(
  oldSnapshot: ContextSnapshot,
  newSnapshot: Partial<ContextSnapshot>
): ContextSnapshot {
  const merged: Omit<ContextSnapshot, 'hash'> = {
    caseType: newSnapshot.caseType ?? oldSnapshot.caseType,
    jurisdiction: newSnapshot.jurisdiction ?? oldSnapshot.jurisdiction,
    currentStepOrder: newSnapshot.currentStepOrder ?? oldSnapshot.currentStepOrder,
    progressPct: newSnapshot.progressPct ?? oldSnapshot.progressPct,
    userPrefs: newSnapshot.userPrefs ?? oldSnapshot.userPrefs,
    conversationStage: newSnapshot.conversationStage ?? oldSnapshot.conversationStage,
    collectedInfo: newSnapshot.collectedInfo ?? oldSnapshot.collectedInfo,
  };

  return {
    ...merged,
    hash: generateSnapshotHash(merged),
  };
}

/**
 * Snapshot metrics for monitoring
 */
export interface SnapshotMetrics {
  totalSnapshots: number;
  averageSize: number;
  hashCollisions: number;
  validationErrors: number;
  updateCount: number;
}

/**
 * Snapshot monitor for tracking metrics
 */
export class SnapshotMonitor {
  private metrics: SnapshotMetrics = {
    totalSnapshots: 0,
    averageSize: 0,
    hashCollisions: 0,
    validationErrors: 0,
    updateCount: 0,
  };

  private hashRegistry = new Set<string>();

  recordSnapshotCreation(snapshot: ContextSnapshot): void {
    this.metrics.totalSnapshots++;

    // Update average size
    const size = getSnapshotSize(snapshot);
    this.metrics.averageSize =
      (this.metrics.averageSize * (this.metrics.totalSnapshots - 1) + size) /
      this.metrics.totalSnapshots;

    // Check for hash collision
    if (this.hashRegistry.has(snapshot.hash)) {
      this.metrics.hashCollisions++;
    } else {
      this.hashRegistry.add(snapshot.hash);
    }
  }

  recordValidationError(): void {
    this.metrics.validationErrors++;
  }

  recordUpdate(): void {
    this.metrics.updateCount++;
  }

  getMetrics(): SnapshotMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalSnapshots: 0,
      averageSize: 0,
      hashCollisions: 0,
      validationErrors: 0,
      updateCount: 0,
    };
    this.hashRegistry.clear();
  }
}

// Global monitor instance
export const snapshotMonitor = new SnapshotMonitor();
