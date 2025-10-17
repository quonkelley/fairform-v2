/**
 * Session Lifecycle Manager Tests
 *
 * Tests for session archiving and deletion lifecycle management.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionLifecycleManager } from "./sessionLifecycle";
import * as aiSessionsRepo from "@/lib/db/aiSessionsRepo";

// Mock the aiSessionsRepo module
vi.mock("@/lib/db/aiSessionsRepo", () => ({
  archiveOldSessions: vi.fn(),
  deleteOldSessions: vi.fn(),
}));

describe("SessionLifecycleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("archiveOldSessions", () => {
    it("should archive sessions for both prod and demo environments", async () => {
      const manager = new SessionLifecycleManager();

      // Mock successful archiving
      vi.mocked(aiSessionsRepo.archiveOldSessions)
        .mockResolvedValueOnce(5) // Production sessions
        .mockResolvedValueOnce(3); // Demo sessions

      const result = await manager.archiveOldSessions();

      expect(result.archived).toBe(8); // 5 + 3
      expect(result.errors).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);

      // Verify it called with correct retention periods
      expect(aiSessionsRepo.archiveOldSessions).toHaveBeenCalledTimes(2);
      expect(aiSessionsRepo.archiveOldSessions).toHaveBeenNthCalledWith(1, 7); // Prod: 7 days
      expect(aiSessionsRepo.archiveOldSessions).toHaveBeenNthCalledWith(2, 1); // Demo: 1 day
    });

    it("should handle archiving errors gracefully", async () => {
      const manager = new SessionLifecycleManager({
        global: {
          cleanupSchedule: "0 2 * * *",
          batchSize: 100,
          retryAttempts: 1, // Reduce retries for faster test
          retryDelay: 10,
        },
      });

      // Mock error
      vi.mocked(aiSessionsRepo.archiveOldSessions).mockRejectedValue(
        new Error("Database error")
      );

      const result = await manager.archiveOldSessions();

      expect(result.archived).toBe(0);
      expect(result.errors).toBe(1);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should use custom retention periods from config", async () => {
      const manager = new SessionLifecycleManager({
        prod: { archiveAfterDays: 14, deleteAfterDays: 90, maxActiveSessions: 10000 },
        demo: { archiveAfterDays: 2, deleteAfterDays: 14, maxActiveSessions: 1000 },
      });

      vi.mocked(aiSessionsRepo.archiveOldSessions)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      await manager.archiveOldSessions();

      expect(aiSessionsRepo.archiveOldSessions).toHaveBeenNthCalledWith(1, 14); // Custom prod
      expect(aiSessionsRepo.archiveOldSessions).toHaveBeenNthCalledWith(2, 2); // Custom demo
    });
  });

  describe("deleteExpiredSessions", () => {
    it("should delete sessions for both prod and demo environments", async () => {
      const manager = new SessionLifecycleManager();

      // Mock successful deletion
      vi.mocked(aiSessionsRepo.deleteOldSessions)
        .mockResolvedValueOnce(10) // Production sessions
        .mockResolvedValueOnce(7); // Demo sessions

      const result = await manager.deleteExpiredSessions();

      expect(result.deleted).toBe(17); // 10 + 7
      expect(result.errors).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);

      // Verify it called with correct retention periods
      expect(aiSessionsRepo.deleteOldSessions).toHaveBeenCalledTimes(2);
      expect(aiSessionsRepo.deleteOldSessions).toHaveBeenNthCalledWith(1, 90); // Prod: 90 days
      expect(aiSessionsRepo.deleteOldSessions).toHaveBeenNthCalledWith(2, 14); // Demo: 14 days
    });

    it("should handle deletion errors gracefully", async () => {
      const manager = new SessionLifecycleManager({
        global: {
          cleanupSchedule: "0 2 * * *",
          batchSize: 100,
          retryAttempts: 1, // Reduce retries for faster test
          retryDelay: 10,
        },
      });

      // Mock error
      vi.mocked(aiSessionsRepo.deleteOldSessions).mockRejectedValue(
        new Error("Database error")
      );

      const result = await manager.deleteExpiredSessions();

      expect(result.deleted).toBe(0);
      expect(result.errors).toBe(1);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should use custom retention periods from config", async () => {
      const manager = new SessionLifecycleManager({
        prod: { archiveAfterDays: 7, deleteAfterDays: 180, maxActiveSessions: 10000 },
        demo: { archiveAfterDays: 1, deleteAfterDays: 7, maxActiveSessions: 1000 },
      });

      vi.mocked(aiSessionsRepo.deleteOldSessions)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      await manager.deleteExpiredSessions();

      expect(aiSessionsRepo.deleteOldSessions).toHaveBeenNthCalledWith(1, 180); // Custom prod
      expect(aiSessionsRepo.deleteOldSessions).toHaveBeenNthCalledWith(2, 7); // Custom demo
    });
  });

  describe("runCleanupCycle", () => {
    it("should run both archive and delete operations", async () => {
      const manager = new SessionLifecycleManager();

      vi.mocked(aiSessionsRepo.archiveOldSessions)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      vi.mocked(aiSessionsRepo.deleteOldSessions)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4);

      const result = await manager.runCleanupCycle();

      expect(result.archive.archived).toBe(5); // 3 + 2
      expect(result.deletion.deleted).toBe(9); // 5 + 4
      expect(result.archive.errors).toBe(0);
      expect(result.deletion.errors).toBe(0);
    });

    it("should continue deletion even if archiving fails", async () => {
      const manager = new SessionLifecycleManager({
        global: {
          cleanupSchedule: "0 2 * * *",
          batchSize: 100,
          retryAttempts: 1, // Reduce retries for faster test
          retryDelay: 10,
        },
      });

      // Mock archive failure
      vi.mocked(aiSessionsRepo.archiveOldSessions).mockRejectedValue(
        new Error("Archive failed")
      );

      // Mock successful deletion
      vi.mocked(aiSessionsRepo.deleteOldSessions)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      const result = await manager.runCleanupCycle();

      expect(result.archive.errors).toBe(1);
      expect(result.deletion.deleted).toBe(3); // Still completes deletion
      expect(result.deletion.errors).toBe(0);
    });
  });

  describe("getConfig", () => {
    it("should return current configuration", () => {
      const manager = new SessionLifecycleManager();
      const config = manager.getConfig();

      expect(config.prod.archiveAfterDays).toBe(7);
      expect(config.demo.archiveAfterDays).toBe(1);
      expect(config.prod.deleteAfterDays).toBe(90);
      expect(config.demo.deleteAfterDays).toBe(14);
      expect(config.global.cleanupSchedule).toBe("0 2 * * *");
    });

    it("should return custom configuration", () => {
      const customConfig = {
        prod: { archiveAfterDays: 14, deleteAfterDays: 180, maxActiveSessions: 20000 },
        demo: { archiveAfterDays: 2, deleteAfterDays: 7, maxActiveSessions: 500 },
      };

      const manager = new SessionLifecycleManager(customConfig);
      const config = manager.getConfig();

      expect(config.prod.archiveAfterDays).toBe(14);
      expect(config.demo.archiveAfterDays).toBe(2);
      expect(config.prod.deleteAfterDays).toBe(180);
      expect(config.demo.deleteAfterDays).toBe(7);
    });
  });
});
