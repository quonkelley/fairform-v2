import { describe, it, expect, beforeEach, vi } from "vitest";
import * as demoStorage from "@/lib/demo/demoStorageAdapter";

describe("demoStorageAdapter", () => {
  beforeEach(() => {
    // Clear storage before each test
    demoStorage.clearDemoStorage();
  });

  describe("uploadFile", () => {
    it("should upload file to in-memory storage", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      const path = "forms/completed/user123/case456/form.pdf";

      const url = await demoStorage.uploadFile(path, mockFile);

      expect(url).toBe(`/demo/storage/${path}`);
      expect(demoStorage.hasFile(path)).toBe(true);
    });

    it("should simulate upload delay", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      const path = "forms/completed/user123/case456/form.pdf";

      const startTime = Date.now();
      await demoStorage.uploadFile(path, mockFile);
      const endTime = Date.now();

      // Should take at least 200ms (simulated delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(190); // Allow small margin
    });

    it("should allow multiple uploads", async () => {
      const file1 = new Blob(["content 1"], { type: "application/pdf" });
      const file2 = new Blob(["content 2"], { type: "application/pdf" });

      await demoStorage.uploadFile("path1.pdf", file1);
      await demoStorage.uploadFile("path2.pdf", file2);

      expect(demoStorage.hasFile("path1.pdf")).toBe(true);
      expect(demoStorage.hasFile("path2.pdf")).toBe(true);
    });
  });

  describe("getDownloadUrl", () => {
    it("should return public path for template files", async () => {
      const path = "forms/templates/marion/appearance-template.pdf";

      const url = await demoStorage.getDownloadUrl(path);

      expect(url).toBe("/demo/forms/appearance-template.pdf");
    });

    it("should return blob URL for uploaded files", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      const path = "forms/completed/user123/case456/form.pdf";

      // Upload first
      await demoStorage.uploadFile(path, mockFile);

      // Mock URL.createObjectURL (doesn't exist in Node, so create it)
      const mockBlobUrl = "blob:http://localhost/abc123";
      const mockCreateObjectURL = vi.fn().mockReturnValue(mockBlobUrl);
      global.URL.createObjectURL = mockCreateObjectURL;

      const url = await demoStorage.getDownloadUrl(path);

      expect(url).toBe(mockBlobUrl);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it("should throw error for non-existent file", async () => {
      const path = "forms/completed/user123/case456/nonexistent.pdf";

      await expect(demoStorage.getDownloadUrl(path)).rejects.toThrow(
        demoStorage.DemoStorageError
      );
    });
  });

  describe("deleteFile", () => {
    it("should delete existing file", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      const path = "forms/completed/user123/case456/form.pdf";

      // Upload first
      await demoStorage.uploadFile(path, mockFile);
      expect(demoStorage.hasFile(path)).toBe(true);

      // Delete
      await demoStorage.deleteFile(path);
      expect(demoStorage.hasFile(path)).toBe(false);
    });

    it("should throw error when deleting non-existent file", async () => {
      const path = "forms/completed/user123/case456/nonexistent.pdf";

      await expect(demoStorage.deleteFile(path)).rejects.toThrow(
        demoStorage.DemoStorageError
      );
    });
  });

  describe("clearDemoStorage", () => {
    it("should clear all stored files", async () => {
      const file1 = new Blob(["content 1"], { type: "application/pdf" });
      const file2 = new Blob(["content 2"], { type: "application/pdf" });

      await demoStorage.uploadFile("path1.pdf", file1);
      await demoStorage.uploadFile("path2.pdf", file2);

      expect(demoStorage.getStoredPaths()).toHaveLength(2);

      demoStorage.clearDemoStorage();

      expect(demoStorage.getStoredPaths()).toHaveLength(0);
      expect(demoStorage.hasFile("path1.pdf")).toBe(false);
      expect(demoStorage.hasFile("path2.pdf")).toBe(false);
    });
  });

  describe("getStoredPaths", () => {
    it("should return all stored file paths", async () => {
      const file1 = new Blob(["content 1"], { type: "application/pdf" });
      const file2 = new Blob(["content 2"], { type: "application/pdf" });

      await demoStorage.uploadFile("path1.pdf", file1);
      await demoStorage.uploadFile("path2.pdf", file2);

      const paths = demoStorage.getStoredPaths();

      expect(paths).toHaveLength(2);
      expect(paths).toContain("path1.pdf");
      expect(paths).toContain("path2.pdf");
    });

    it("should return empty array when no files stored", () => {
      const paths = demoStorage.getStoredPaths();
      expect(paths).toHaveLength(0);
    });
  });

  describe("hasFile", () => {
    it("should return true for existing file", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      await demoStorage.uploadFile("test.pdf", mockFile);

      expect(demoStorage.hasFile("test.pdf")).toBe(true);
    });

    it("should return false for non-existent file", () => {
      expect(demoStorage.hasFile("nonexistent.pdf")).toBe(false);
    });
  });
});
