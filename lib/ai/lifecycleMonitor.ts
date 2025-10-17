/**
 * Session Lifecycle Monitor
 *
 * Collects and tracks metrics for session lifecycle operations.
 * Used for monitoring storage usage, cleanup performance, and alerting.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

import * as aiSessionsRepo from "@/lib/db/aiSessionsRepo";

/**
 * Archive operation result
 */
export interface ArchiveResult {
  archived: number;
  errors: number;
  duration: number;
}

/**
 * Delete operation result
 */
export interface DeleteResult {
  deleted: number;
  errors: number;
  duration: number;
}

/**
 * Storage usage metrics
 */
export interface StorageUsage {
  totalSessions: number;
  activeSessions: number;
  archivedSessions: number;
  estimatedSize: number;
}

/**
 * Complete lifecycle metrics
 */
export interface LifecycleMetrics {
  sessionsArchived: number;
  sessionsDeleted: number;
  totalErrors: number;
  averageProcessingTime: number;
  lastCleanupTime: number;
  storageUsage: StorageUsage;
}

/**
 * Lifecycle monitor class for collecting and tracking metrics
 */
export class LifecycleMonitor {
  private metrics: LifecycleMetrics;
  private operationCount: number;

  constructor() {
    this.metrics = this.initializeMetrics();
    this.operationCount = 0;
  }

  /**
   * Initialize empty metrics
   */
  private initializeMetrics(): LifecycleMetrics {
    return {
      sessionsArchived: 0,
      sessionsDeleted: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      lastCleanupTime: 0,
      storageUsage: {
        totalSessions: 0,
        activeSessions: 0,
        archivedSessions: 0,
        estimatedSize: 0,
      },
    };
  }

  /**
   * Update metrics after an archive operation
   *
   * @param result - Archive operation result
   */
  updateArchiveMetrics(result: ArchiveResult): void {
    this.metrics.sessionsArchived += result.archived;
    this.metrics.totalErrors += result.errors;
    this.updateAverageProcessingTime(result.duration);
    this.metrics.lastCleanupTime = Date.now();
  }

  /**
   * Update metrics after a delete operation
   *
   * @param result - Delete operation result
   */
  updateDeleteMetrics(result: DeleteResult): void {
    this.metrics.sessionsDeleted += result.deleted;
    this.metrics.totalErrors += result.errors;
    this.updateAverageProcessingTime(result.duration);
    this.metrics.lastCleanupTime = Date.now();
  }

  /**
   * Update average processing time
   *
   * @param duration - Duration of the operation in milliseconds
   */
  private updateAverageProcessingTime(duration: number): void {
    if (this.operationCount === 0) {
      this.metrics.averageProcessingTime = duration;
    } else {
      // Running average of operation durations
      this.metrics.averageProcessingTime =
        (this.metrics.averageProcessingTime * this.operationCount + duration) /
        (this.operationCount + 1);
    }
    this.operationCount++;
  }

  /**
   * Collect current storage usage metrics
   */
  async collectStorageMetrics(): Promise<StorageUsage> {
    const storageUsage = await this.getStorageUsage();
    this.metrics.storageUsage = storageUsage;
    return storageUsage;
  }

  /**
   * Get current storage usage from repository
   */
  private async getStorageUsage(): Promise<StorageUsage> {
    try {
      const totalSessions = await aiSessionsRepo.getSessionCount();
      const activeSessions = await aiSessionsRepo.getActiveSessionCount();
      const archivedSessions = await aiSessionsRepo.getArchivedSessionCount();

      // Estimate storage size (rough calculation: 1KB per session on average)
      const estimatedSize = totalSessions * 1024;

      return {
        totalSessions,
        activeSessions,
        archivedSessions,
        estimatedSize,
      };
    } catch (error) {
      console.error("Failed to collect storage metrics:", error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        archivedSessions: 0,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): LifecycleMetrics {
    return { ...this.metrics };
  }

  /**
   * Log current metrics to console
   */
  logMetrics(): void {
    console.log("Session Lifecycle Metrics:", {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
    });
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.operationCount = 0;
  }
}
