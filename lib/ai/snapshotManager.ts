/**
 * Context Snapshot Manager
 *
 * Manages automatic snapshot updates, error recovery, and prompt caching
 * for the AI Copilot context system.
 *
 * Story: 13.10 - Context Snapshot System
 */

import type { ContextSnapshot } from './types';
import {
  createContextSnapshot,
  validateSnapshot,
  snapshotsEqual,
  createFallbackSnapshot,
  snapshotMonitor,
  type PartialContext,
} from './contextSnapshot';

/**
 * Context change event types
 */
export type ContextChangeType =
  | 'case_update'
  | 'step_change'
  | 'user_pref_change'
  | 'conversation_stage_change';

/**
 * Context change event
 */
export interface ContextChangeEvent {
  type: ContextChangeType;
  sessionId: string;
  oldSnapshot?: ContextSnapshot;
  newContext: PartialContext;
  timestamp: number;
}

/**
 * Snapshot update callback
 */
export type SnapshotUpdateCallback = (
  sessionId: string,
  snapshot: ContextSnapshot
) => Promise<void>;

/**
 * Context Snapshot Manager
 *
 * Handles automatic snapshot updates, change detection, and error recovery
 */
export class ContextSnapshotManager {
  private updateQueue = new Map<string, ContextSnapshot>();
  private updateCallback?: SnapshotUpdateCallback;
  private processingQueue = false;

  /**
   * Set the callback for snapshot updates
   */
  setUpdateCallback(callback: SnapshotUpdateCallback): void {
    this.updateCallback = callback;
  }

  /**
   * Handle a context change event
   */
  async handleContextChange(event: ContextChangeEvent): Promise<ContextSnapshot> {
    const { sessionId, oldSnapshot, newContext } = event;

    // Create new snapshot
    const newSnapshot = createContextSnapshot(newContext);
    snapshotMonitor.recordSnapshotCreation(newSnapshot);

    // Check if snapshot actually changed
    if (oldSnapshot && snapshotsEqual(oldSnapshot, newSnapshot)) {
      return oldSnapshot; // No change needed
    }

    // Queue snapshot update
    this.updateQueue.set(sessionId, newSnapshot);
    snapshotMonitor.recordUpdate();

    // Process update queue
    if (!this.processingQueue) {
      void this.processUpdateQueue();
    }

    return newSnapshot;
  }

  /**
   * Process queued snapshot updates
   */
  private async processUpdateQueue(): Promise<void> {
    if (this.processingQueue) return;

    this.processingQueue = true;

    try {
      const updates = Array.from(this.updateQueue.entries());
      this.updateQueue.clear();

      for (const [sessionId, snapshot] of updates) {
        try {
          if (this.updateCallback) {
            await this.updateCallback(sessionId, snapshot);
          }
        } catch (error) {
          console.error(
            `[SnapshotManager] Failed to update snapshot for session ${sessionId}:`,
            error
          );
          // Re-queue failed updates
          this.updateQueue.set(sessionId, snapshot);
        }
      }
    } finally {
      this.processingQueue = false;

      // If more updates were queued during processing, process them
      if (this.updateQueue.size > 0) {
        void this.processUpdateQueue();
      }
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.updateQueue.size;
  }

  /**
   * Clear the update queue
   */
  clearQueue(): void {
    this.updateQueue.clear();
  }
}

/**
 * Snapshot Recovery Service
 *
 * Handles corrupted snapshot recovery and validation
 */
export class SnapshotRecovery {
  /**
   * Attempt to recover a corrupted snapshot
   */
  async recoverSnapshot(
    sessionId: string,
    corruptedSnapshot: unknown,
    contextBuilder?: (sessionId: string) => Promise<PartialContext>
  ): Promise<ContextSnapshot> {
    console.warn(`[SnapshotRecovery] Attempting to recover snapshot for session ${sessionId}`);

    // Try to validate the corrupted snapshot
    const validated = validateSnapshot(corruptedSnapshot);
    if (validated) {
      console.log(`[SnapshotRecovery] Snapshot validated successfully for session ${sessionId}`);
      return validated;
    }

    snapshotMonitor.recordValidationError();

    // If context builder is provided, try to rebuild snapshot
    if (contextBuilder) {
      try {
        const context = await contextBuilder(sessionId);
        const newSnapshot = createContextSnapshot(context);
        console.log(`[SnapshotRecovery] Rebuilt snapshot for session ${sessionId}`);
        return newSnapshot;
      } catch (error) {
        console.error(
          `[SnapshotRecovery] Failed to rebuild snapshot for session ${sessionId}:`,
          error
        );
      }
    }

    // Return fallback snapshot
    console.warn(`[SnapshotRecovery] Using fallback snapshot for session ${sessionId}`);
    return createFallbackSnapshot();
  }

  /**
   * Validate and potentially recover a snapshot
   */
  async validateAndRecover(
    sessionId: string,
    snapshot: unknown,
    contextBuilder?: (sessionId: string) => Promise<PartialContext>
  ): Promise<ContextSnapshot> {
    const validated = validateSnapshot(snapshot);

    if (validated) {
      return validated;
    }

    return this.recoverSnapshot(sessionId, snapshot, contextBuilder);
  }
}

/**
 * Prompt Cache using snapshot hashes as cache keys
 */
export interface CachedPrompt {
  prompt: string;
  createdAt: number;
  expiresAt: number;
}

export interface PromptCacheKey {
  sessionId: string;
  contextHash: string;
  promptType: 'system' | 'user' | 'context';
  model: string;
}

export class PromptCache {
  private cache = new Map<string, CachedPrompt>();
  private defaultTTL = 300000; // 5 minutes

  /**
   * Generate cache key from components
   */
  private generateCacheKey(key: PromptCacheKey): string {
    return `${key.sessionId}:${key.contextHash}:${key.promptType}:${key.model}`;
  }

  /**
   * Get cached prompt
   */
  get(key: PromptCacheKey): string | null {
    const cacheKey = this.generateCacheKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.prompt;
  }

  /**
   * Set cached prompt
   */
  set(key: PromptCacheKey, prompt: string, ttl?: number): void {
    const cacheKey = this.generateCacheKey(key);
    const cacheTTL = ttl ?? this.defaultTTL;

    this.cache.set(cacheKey, {
      prompt,
      createdAt: Date.now(),
      expiresAt: Date.now() + cacheTTL,
    });
  }

  /**
   * Invalidate cache entries for a specific session and hash
   */
  invalidate(sessionId: string, oldHash?: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) => {
      const matchesSession = key.startsWith(`${sessionId}:`);
      if (!oldHash) return matchesSession;
      return matchesSession && key.includes(oldHash);
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global instances
export const snapshotManager = new ContextSnapshotManager();
export const snapshotRecovery = new SnapshotRecovery();
export const promptCache = new PromptCache();

// Cleanup expired cache entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    promptCache.cleanup();
  }, 300000); // 5 minutes
}
