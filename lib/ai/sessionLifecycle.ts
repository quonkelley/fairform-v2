/**
 * Session Lifecycle Manager
 *
 * Manages session lifecycle including archiving and deletion.
 * Handles different retention periods for demo vs production environments.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

import * as aiSessionsRepo from "@/lib/db/aiSessionsRepo";
import { RetryableOperation } from "@/lib/ai/retryableOperation";
import type { ArchiveResult, DeleteResult } from "@/lib/ai/lifecycleMonitor";

/**
 * Lifecycle configuration for retention periods
 */
interface LifecycleConfig {
  prod: {
    archiveAfterDays: number;
    deleteAfterDays: number;
    maxActiveSessions: number;
  };
  demo: {
    archiveAfterDays: number;
    deleteAfterDays: number;
    maxActiveSessions: number;
  };
  global: {
    cleanupSchedule: string;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

/**
 * Default lifecycle configuration
 */
const DEFAULT_CONFIG: LifecycleConfig = {
  prod: {
    archiveAfterDays: 7,
    deleteAfterDays: 90,
    maxActiveSessions: 10000,
  },
  demo: {
    archiveAfterDays: 1,
    deleteAfterDays: 14,
    maxActiveSessions: 1000,
  },
  global: {
    cleanupSchedule: "0 2 * * *", // Daily at 2 AM UTC
    batchSize: 100,
    retryAttempts: 3,
    retryDelay: 5000,
  },
};

/**
 * Session lifecycle manager class
 */
export class SessionLifecycleManager {
  private config: LifecycleConfig;
  private retryableOp: RetryableOperation;

  constructor(config?: Partial<LifecycleConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      prod: { ...DEFAULT_CONFIG.prod, ...config?.prod },
      demo: { ...DEFAULT_CONFIG.demo, ...config?.demo },
      global: { ...DEFAULT_CONFIG.global, ...config?.global },
    };

    this.retryableOp = new RetryableOperation(
      this.config.global.retryAttempts,
      this.config.global.retryDelay
    );
  }

  /**
   * Get archive retention period for environment
   */
  private getArchiveAfterDays(isDemo: boolean): number {
    return isDemo
      ? this.config.demo.archiveAfterDays
      : this.config.prod.archiveAfterDays;
  }

  /**
   * Get deletion retention period for environment
   */
  private getDeleteAfterDays(isDemo: boolean): number {
    return isDemo
      ? this.config.demo.deleteAfterDays
      : this.config.prod.deleteAfterDays;
  }

  /**
   * Archive old sessions based on inactivity
   *
   * Archives sessions separately for demo and production environments
   * based on their respective retention periods.
   *
   * @returns Archive operation result
   */
  async archiveOldSessions(): Promise<ArchiveResult> {
    const startTime = Date.now();
    const result: ArchiveResult = {
      archived: 0,
      errors: 0,
      duration: 0,
    };

    try {
      console.log("Starting session archiving...");

      // Archive production sessions
      const prodArchived = await this.retryableOp.execute(
        () => aiSessionsRepo.archiveOldSessions(this.config.prod.archiveAfterDays),
        "Archive production sessions"
      );
      result.archived += prodArchived;

      console.log(`Archived ${prodArchived} production sessions`);

      // Archive demo sessions
      const demoArchived = await this.retryableOp.execute(
        () => aiSessionsRepo.archiveOldSessions(this.config.demo.archiveAfterDays),
        "Archive demo sessions"
      );
      result.archived += demoArchived;

      console.log(`Archived ${demoArchived} demo sessions`);

      result.duration = Date.now() - startTime;

      console.log(
        `Archive completed: ${result.archived} total sessions archived in ${result.duration}ms`
      );

      return result;
    } catch (error) {
      console.error("Archive operation failed:", error);
      result.errors++;
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Delete expired archived sessions
   *
   * Deletes archived sessions that have exceeded their retention period.
   * Handles demo and production sessions separately.
   *
   * @returns Delete operation result
   */
  async deleteExpiredSessions(): Promise<DeleteResult> {
    const startTime = Date.now();
    const result: DeleteResult = {
      deleted: 0,
      errors: 0,
      duration: 0,
    };

    try {
      console.log("Starting expired session deletion...");

      // Delete production sessions
      const prodDeleted = await this.retryableOp.execute(
        () => aiSessionsRepo.deleteOldSessions(this.config.prod.deleteAfterDays),
        "Delete production sessions"
      );
      result.deleted += prodDeleted;

      console.log(`Deleted ${prodDeleted} production sessions`);

      // Delete demo sessions
      const demoDeleted = await this.retryableOp.execute(
        () => aiSessionsRepo.deleteOldSessions(this.config.demo.deleteAfterDays),
        "Delete demo sessions"
      );
      result.deleted += demoDeleted;

      console.log(`Deleted ${demoDeleted} demo sessions`);

      result.duration = Date.now() - startTime;

      console.log(
        `Deletion completed: ${result.deleted} total sessions deleted in ${result.duration}ms`
      );

      return result;
    } catch (error) {
      console.error("Deletion operation failed:", error);
      result.errors++;
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Run complete cleanup cycle (archive + delete)
   *
   * @returns Combined results of archive and delete operations
   */
  async runCleanupCycle(): Promise<{
    archive: ArchiveResult;
    deletion: DeleteResult;
  }> {
    console.log("Starting session lifecycle cleanup cycle...");

    const archive = await this.archiveOldSessions();
    const deletion = await this.deleteExpiredSessions();

    console.log("Session lifecycle cleanup cycle completed");

    return { archive, deletion };
  }

  /**
   * Get current configuration
   */
  getConfig(): LifecycleConfig {
    return { ...this.config };
  }
}
