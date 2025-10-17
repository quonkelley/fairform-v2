import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as storageRepo from "@/lib/db/storageRepo";

// Mock Firebase Storage
vi.mock("firebase/storage", () => ({
  ref: vi.fn((storage, path) => ({ path })),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  getFirebaseStorage: vi.fn(() => ({})),
}));

// Import mocked functions
import { uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

describe("storageRepo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload file and return download URL", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });
      const mockUrl = "https://storage.example.com/file.pdf";

      vi.mocked(uploadBytes).mockResolvedValue({
        ref: { fullPath: "forms/test.pdf" },
      } as any);
      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);

      const result = await storageRepo.uploadFile("forms/test.pdf", mockFile);

      expect(result).toBe(mockUrl);
      expect(uploadBytes).toHaveBeenCalledTimes(1);
      expect(getDownloadURL).toHaveBeenCalledTimes(1);
    });

    it("should throw StorageRepositoryError on upload failure", async () => {
      const mockFile = new Blob(["test content"], { type: "application/pdf" });

      vi.mocked(uploadBytes).mockRejectedValue(new Error("Upload failed"));

      await expect(
        storageRepo.uploadFile("forms/test.pdf", mockFile)
      ).rejects.toThrow(storageRepo.StorageRepositoryError);
    });
  });

  describe("getDownloadUrl", () => {
    it("should return download URL for existing file", async () => {
      const mockUrl = "https://storage.example.com/file.pdf";

      vi.mocked(getDownloadURL).mockResolvedValue(mockUrl);

      const result = await storageRepo.getDownloadUrl("forms/test.pdf");

      expect(result).toBe(mockUrl);
      expect(getDownloadURL).toHaveBeenCalledTimes(1);
    });

    it("should throw StorageRepositoryError when file not found", async () => {
      vi.mocked(getDownloadURL).mockRejectedValue(
        new Error("File not found")
      );

      await expect(
        storageRepo.getDownloadUrl("forms/nonexistent.pdf")
      ).rejects.toThrow(storageRepo.StorageRepositoryError);
    });
  });

  describe("deleteFile", () => {
    it("should delete file successfully", async () => {
      vi.mocked(deleteObject).mockResolvedValue(undefined);

      await expect(
        storageRepo.deleteFile("forms/test.pdf")
      ).resolves.toBeUndefined();

      expect(deleteObject).toHaveBeenCalledTimes(1);
    });

    it("should throw StorageRepositoryError on deletion failure", async () => {
      vi.mocked(deleteObject).mockRejectedValue(
        new Error("Deletion failed")
      );

      await expect(
        storageRepo.deleteFile("forms/test.pdf")
      ).rejects.toThrow(storageRepo.StorageRepositoryError);
    });
  });

  describe("getTemplatePath", () => {
    it("should generate correct template path", () => {
      const path = storageRepo.getTemplatePath("marion", "appearance");
      expect(path).toBe("forms/templates/marion/appearance-template.pdf");
    });

    it("should handle different jurisdictions and form types", () => {
      const path1 = storageRepo.getTemplatePath("lake", "continuance");
      expect(path1).toBe("forms/templates/lake/continuance-template.pdf");

      const path2 = storageRepo.getTemplatePath("marion", "motion");
      expect(path2).toBe("forms/templates/marion/motion-template.pdf");
    });
  });

  describe("getCompletedFormPath", () => {
    beforeEach(() => {
      // Mock Date.now() for consistent timestamps
      vi.spyOn(Date, "now").mockReturnValue(1729123456789);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should generate correct completed form path with timestamp", () => {
      const path = storageRepo.getCompletedFormPath(
        "user123",
        "case456",
        "appearance"
      );

      expect(path).toBe(
        "forms/completed/user123/case456/appearance_1729123456789.pdf"
      );
    });

    it("should generate unique paths for same inputs at different times", () => {
      const path1 = storageRepo.getCompletedFormPath(
        "user123",
        "case456",
        "appearance"
      );

      // Change timestamp
      vi.spyOn(Date, "now").mockReturnValue(1729123999999);

      const path2 = storageRepo.getCompletedFormPath(
        "user123",
        "case456",
        "appearance"
      );

      expect(path1).not.toBe(path2);
      expect(path1).toContain("appearance_1729123456789.pdf");
      expect(path2).toContain("appearance_1729123999999.pdf");
    });
  });
});
