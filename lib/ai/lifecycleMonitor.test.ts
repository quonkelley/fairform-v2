/**
 * Lifecycle Monitor Tests
 *
 * Tests for session lifecycle monitoring and metrics collection.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { LifecycleMonitor } from "./lifecycleMonitor";
import type { ArchiveResult, DeleteResult } from "./lifecycleMonitor";
import * as aiSessionsRepo from "@/lib/db/aiSessionsRepo";

// Mock the aiSessionsRepo module
vi.mock("@/lib/db/aiSessionsRepo", () => ({
  getSessionCount: vi.fn(),
  getActiveSessionCount: vi.fn(),
  getArchivedSessionCount: vi.fn(),
}));

describe("LifecycleMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateArchiveMetrics", () => {
    it("should update archive metrics correctly", () => {
      const monitor = new LifecycleMonitor();

      const result: ArchiveResult = {
        archived: 1,
        errors: 1,
        duration: 500,
      };

      monitor.updateArchiveMetrics(result);
      const metrics = monitor.getMetrics();

      expect(metrics.sessionsArchived).toBe(1);
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.averageProcessingTime).toBe(500); // First operation sets the average
      expect(metrics.lastCleanupTime).toBeGreaterThan(0);
    });

    it("should accumulate multiple archive operations", () => {
      const monitor = new LifecycleMonitor();

      monitor.updateArchiveMetrics({
        archived: 5,
        errors: 0,
        duration: 300,
      });

      monitor.updateArchiveMetrics({
        archived: 3,
        errors: 1,
        duration: 200,
      });

      const metrics = monitor.getMetrics();

      expect(metrics.sessionsArchived).toBe(8);
      expect(metrics.totalErrors).toBe(1);
      // Average of two operations: (300 + 200) / 2 = 250
      expect(metrics.averageProcessingTime).toBe(250);
    });
  });

  describe("updateDeleteMetrics", () => {
    it("should update delete metrics correctly", () => {
      const monitor = new LifecycleMonitor();

      const result: DeleteResult = {
        deleted: 1,
        errors: 2,
        duration: 800,
      };

      monitor.updateDeleteMetrics(result);
      const metrics = monitor.getMetrics();

      expect(metrics.sessionsDeleted).toBe(1);
      expect(metrics.totalErrors).toBe(2);
      expect(metrics.averageProcessingTime).toBe(800); // First operation sets the average
      expect(metrics.lastCleanupTime).toBeGreaterThan(0);
    });

    it("should accumulate multiple delete operations", () => {
      const monitor = new LifecycleMonitor();

      monitor.updateDeleteMetrics({
        deleted: 10,
        errors: 1,
        duration: 400,
      });

      monitor.updateDeleteMetrics({
        deleted: 5,
        errors: 0,
        duration: 600,
      });

      const metrics = monitor.getMetrics();

      expect(metrics.sessionsDeleted).toBe(15);
      expect(metrics.totalErrors).toBe(1);
    });
  });

  describe("collectStorageMetrics", () => {
    it("should collect storage usage metrics", async () => {
      const monitor = new LifecycleMonitor();

      vi.mocked(aiSessionsRepo.getSessionCount).mockResolvedValue(100);
      vi.mocked(aiSessionsRepo.getActiveSessionCount).mockResolvedValue(70);
      vi.mocked(aiSessionsRepo.getArchivedSessionCount).mockResolvedValue(30);

      const storageUsage = await monitor.collectStorageMetrics();

      expect(storageUsage.totalSessions).toBe(100);
      expect(storageUsage.activeSessions).toBe(70);
      expect(storageUsage.archivedSessions).toBe(30);
      expect(storageUsage.estimatedSize).toBe(100 * 1024); // 100KB
    });

    it("should handle errors gracefully", async () => {
      const monitor = new LifecycleMonitor();

      vi.mocked(aiSessionsRepo.getSessionCount).mockRejectedValue(
        new Error("Database error")
      );

      const storageUsage = await monitor.collectStorageMetrics();

      expect(storageUsage.totalSessions).toBe(0);
      expect(storageUsage.activeSessions).toBe(0);
      expect(storageUsage.archivedSessions).toBe(0);
      expect(storageUsage.estimatedSize).toBe(0);
    });
  });

  describe("getMetrics", () => {
    it("should return current metrics", () => {
      const monitor = new LifecycleMonitor();

      monitor.updateArchiveMetrics({
        archived: 5,
        errors: 0,
        duration: 300,
      });

      monitor.updateDeleteMetrics({
        deleted: 10,
        errors: 1,
        duration: 500,
      });

      const metrics = monitor.getMetrics();

      expect(metrics.sessionsArchived).toBe(5);
      expect(metrics.sessionsDeleted).toBe(10);
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.lastCleanupTime).toBeGreaterThan(0);
    });

    it("should return a copy of metrics", () => {
      const monitor = new LifecycleMonitor();

      const metrics1 = monitor.getMetrics();
      metrics1.sessionsArchived = 999;

      const metrics2 = monitor.getMetrics();

      expect(metrics2.sessionsArchived).toBe(0); // Should not be affected
    });
  });

  describe("reset", () => {
    it("should reset all metrics to zero", () => {
      const monitor = new LifecycleMonitor();

      monitor.updateArchiveMetrics({
        archived: 5,
        errors: 1,
        duration: 300,
      });

      monitor.reset();

      const metrics = monitor.getMetrics();

      expect(metrics.sessionsArchived).toBe(0);
      expect(metrics.sessionsDeleted).toBe(0);
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
      expect(metrics.lastCleanupTime).toBe(0);
    });
  });

  describe("averageProcessingTime", () => {
    it("should calculate running average correctly", () => {
      const monitor = new LifecycleMonitor();

      monitor.updateArchiveMetrics({
        archived: 5,
        errors: 0,
        duration: 300,
      });

      monitor.updateDeleteMetrics({
        deleted: 5,
        errors: 0,
        duration: 500,
      });

      const metrics = monitor.getMetrics();

      // Two operations: 300ms and 500ms
      // Average: (300 + 500) / 2 = 400
      expect(metrics.averageProcessingTime).toBe(400);
    });
  });
});
