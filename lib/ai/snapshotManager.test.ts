/**
 * Tests for Context Snapshot Manager
 *
 * Story: 13.10 - Context Snapshot System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CaseType } from './types';
import { createContextSnapshot, type PartialContext } from './contextSnapshot';
import {
  ContextSnapshotManager,
  SnapshotRecovery,
  PromptCache,
  type ContextChangeEvent,
  type PromptCacheKey,
} from './snapshotManager';

describe('snapshotManager', () => {
  describe('ContextSnapshotManager', () => {
    let manager: ContextSnapshotManager;

    beforeEach(() => {
      manager = new ContextSnapshotManager();
    });

    it('handles context change events', async () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      };

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        newContext: context,
        timestamp: Date.now(),
      };

      const snapshot = await manager.handleContextChange(event);

      expect(snapshot.caseType).toBe('small_claims');
      expect(snapshot.jurisdiction).toBe('Los Angeles County');
    });

    it('detects when snapshot has not changed', async () => {
      const context: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const oldSnapshot = createContextSnapshot(context);

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        oldSnapshot,
        newContext: context,
        timestamp: Date.now(),
      };

      const newSnapshot = await manager.handleContextChange(event);

      expect(newSnapshot.hash).toBe(oldSnapshot.hash);
    });

    it('detects when snapshot has changed', async () => {
      const oldContext: PartialContext = {
        case: {
          caseType: 'eviction' as CaseType,
        },
      };

      const newContext: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const oldSnapshot = createContextSnapshot(oldContext);

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        oldSnapshot,
        newContext,
        timestamp: Date.now(),
      };

      const newSnapshot = await manager.handleContextChange(event);

      expect(newSnapshot.hash).not.toBe(oldSnapshot.hash);
    });

    it('queues snapshot updates', async () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        newContext: context,
        timestamp: Date.now(),
      };

      await manager.handleContextChange(event);

      // Queue should be processed asynchronously
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(manager.getQueueSize()).toBe(0); // Should be processed
    });

    it('calls update callback when set', async () => {
      const updateCallback = vi.fn();
      manager.setUpdateCallback(updateCallback);

      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        newContext: context,
        timestamp: Date.now(),
      };

      await manager.handleContextChange(event);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(updateCallback).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          caseType: 'small_claims',
        })
      );
    });

    it('re-queues failed updates', async () => {
      const failingCallback = vi.fn().mockRejectedValue(new Error('Update failed'));
      manager.setUpdateCallback(failingCallback);

      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        newContext: context,
        timestamp: Date.now(),
      };

      await manager.handleContextChange(event);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Failed update should be re-queued
      expect(manager.getQueueSize()).toBeGreaterThan(0);
    });

    it('clears queue', async () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const event: ContextChangeEvent = {
        type: 'case_update',
        sessionId: 'session-123',
        newContext: context,
        timestamp: Date.now(),
      };

      await manager.handleContextChange(event);
      manager.clearQueue();

      expect(manager.getQueueSize()).toBe(0);
    });
  });

  describe('SnapshotRecovery', () => {
    let recovery: SnapshotRecovery;

    beforeEach(() => {
      recovery = new SnapshotRecovery();
    });

    it('validates correct snapshot', async () => {
      const context: PartialContext = {
        case: {
          caseType: 'small_claims' as CaseType,
        },
      };

      const snapshot = createContextSnapshot(context);
      const recovered = await recovery.validateAndRecover('session-123', snapshot);

      expect(recovered.hash).toBe(snapshot.hash);
    });

    it('recovers corrupted snapshot with context builder', async () => {
      const corruptedSnapshot = {
        caseType: 'small_claims',
        hash: 'invalid',
      };

      const contextBuilder = vi.fn().mockResolvedValue({
        case: {
          caseType: 'small_claims' as CaseType,
          jurisdiction: 'Los Angeles County',
        },
      });

      const recovered = await recovery.recoverSnapshot(
        'session-123',
        corruptedSnapshot,
        contextBuilder
      );

      expect(contextBuilder).toHaveBeenCalledWith('session-123');
      expect(recovered.caseType).toBe('small_claims');
      expect(recovered.jurisdiction).toBe('Los Angeles County');
    });

    it('returns fallback when context builder fails', async () => {
      const corruptedSnapshot = {
        caseType: 'invalid_type',
        hash: 'invalid',
      };

      const contextBuilder = vi.fn().mockRejectedValue(new Error('Builder failed'));

      const recovered = await recovery.recoverSnapshot(
        'session-123',
        corruptedSnapshot,
        contextBuilder
      );

      expect(recovered.caseType).toBeUndefined();
      expect(recovered.hash).toHaveLength(64);
    });

    it('returns fallback when no context builder provided', async () => {
      const corruptedSnapshot = {
        caseType: 'invalid_type',
        hash: 'invalid',
      };

      const recovered = await recovery.recoverSnapshot('session-123', corruptedSnapshot);

      expect(recovered.caseType).toBeUndefined();
      expect(recovered.hash).toHaveLength(64);
    });
  });

  describe('PromptCache', () => {
    let cache: PromptCache;

    beforeEach(() => {
      cache = new PromptCache();
    });

    it('caches and retrieves prompts', () => {
      const key: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      cache.set(key, 'Test prompt');
      const cached = cache.get(key);

      expect(cached).toBe('Test prompt');
    });

    it('returns null for cache miss', () => {
      const key: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      const cached = cache.get(key);

      expect(cached).toBeNull();
    });

    it('respects TTL and expires entries', () => {
      const key: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      cache.set(key, 'Test prompt', 1); // 1ms TTL

      setTimeout(() => {
        const cached = cache.get(key);
        expect(cached).toBeNull();
      }, 10);
    });

    it('invalidates cache for session', () => {
      const key1: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      const key2: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'def456',
        promptType: 'user',
        model: 'gpt-4o-mini',
      };

      cache.set(key1, 'Prompt 1');
      cache.set(key2, 'Prompt 2');

      cache.invalidate('session-123');

      expect(cache.get(key1)).toBeNull();
      expect(cache.get(key2)).toBeNull();
    });

    it('invalidates cache for specific hash', () => {
      const key1: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      const key2: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'def456',
        promptType: 'user',
        model: 'gpt-4o-mini',
      };

      cache.set(key1, 'Prompt 1');
      cache.set(key2, 'Prompt 2');

      cache.invalidate('session-123', 'abc123');

      expect(cache.get(key1)).toBeNull();
      expect(cache.get(key2)).toBe('Prompt 2'); // Should still exist
    });

    it('cleans up expired entries', () => {
      const key: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      cache.set(key, 'Test prompt', 1); // 1ms TTL

      setTimeout(() => {
        cache.cleanup();
        const stats = cache.getStats();
        expect(stats.size).toBe(0);
      }, 10);
    });

    it('clears all cache entries', () => {
      const key1: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      const key2: PromptCacheKey = {
        sessionId: 'session-456',
        contextHash: 'def456',
        promptType: 'user',
        model: 'gpt-4o-mini',
      };

      cache.set(key1, 'Prompt 1');
      cache.set(key2, 'Prompt 2');

      cache.clear();

      expect(cache.get(key1)).toBeNull();
      expect(cache.get(key2)).toBeNull();
      expect(cache.getStats().size).toBe(0);
    });

    it('provides cache statistics', () => {
      const key1: PromptCacheKey = {
        sessionId: 'session-123',
        contextHash: 'abc123',
        promptType: 'system',
        model: 'gpt-4o-mini',
      };

      const key2: PromptCacheKey = {
        sessionId: 'session-456',
        contextHash: 'def456',
        promptType: 'user',
        model: 'gpt-4o-mini',
      };

      cache.set(key1, 'Prompt 1');
      cache.set(key2, 'Prompt 2');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toBe(2);
    });
  });
});
