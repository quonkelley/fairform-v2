/**
 * Retryable Operation Tests
 *
 * Tests for retry logic with exponential backoff.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RetryableOperation } from "./retryableOperation";

describe("RetryableOperation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should succeed on first attempt", async () => {
      const retryable = new RetryableOperation(3, 100);
      const operation = vi.fn().mockResolvedValue("success");

      const result = await retryable.execute(operation, "test operation");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const retryable = new RetryableOperation(3, 100);
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValueOnce("success");

      const result = await retryable.execute(operation, "test operation");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max attempts", async () => {
      const retryable = new RetryableOperation(3, 50);
      const operation = vi.fn().mockRejectedValue(new Error("Always fails"));

      await expect(
        retryable.execute(operation, "test operation")
      ).rejects.toThrow("Always fails");

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff", async () => {
      const retryable = new RetryableOperation(3, 100);
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValueOnce("success");

      const startTime = Date.now();
      await retryable.execute(operation, "test operation");
      const duration = Date.now() - startTime;

      // First retry: 100ms, second retry: 200ms = at least 300ms total
      expect(duration).toBeGreaterThanOrEqual(250); // Allow some variance
    });

    it("should handle custom max attempts", async () => {
      const retryable = new RetryableOperation(5, 50);
      const operation = vi.fn().mockRejectedValue(new Error("Fail"));

      await expect(
        retryable.execute(operation, "test operation")
      ).rejects.toThrow("Fail");

      expect(operation).toHaveBeenCalledTimes(5);
    });

    it("should handle custom base delay", async () => {
      const retryable = new RetryableOperation(2, 200);
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail"))
        .mockResolvedValueOnce("success");

      const startTime = Date.now();
      await retryable.execute(operation, "test operation");
      const duration = Date.now() - startTime;

      // First retry: 200ms
      expect(duration).toBeGreaterThanOrEqual(180); // Allow some variance
    });
  });
});
