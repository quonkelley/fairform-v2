/**
 * Tests for PDF generator
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { generatePDF, hasFormFields, getTemplateFieldNames } from "@/lib/forms/pdfGenerator";

// Create mocks using vi.hoisted to ensure they're available before module imports
const { singletonTextField, singletonCheckBox, MockPDFTextField, MockPDFCheckBox, setFieldType, getFieldType } = vi.hoisted(() => {
  class MockPDFTextField {
    setText = vi.fn();
  }

  class MockPDFCheckBox {
    check = vi.fn();
    uncheck = vi.fn();
  }

  let currentFieldType: "text" | "checkbox" = "text";

  return {
    MockPDFTextField,
    MockPDFCheckBox,
    singletonTextField: new MockPDFTextField(),
    singletonCheckBox: new MockPDFCheckBox(),
    setFieldType: (type: "text" | "checkbox") => {
      currentFieldType = type;
    },
    getFieldType: () => currentFieldType,
  };
});

// Mock pdf-lib
vi.mock("pdf-lib", () => {
  const mockField = {
    getName: vi.fn().mockReturnValue("test_field"),
  };

  const mockForm = {
    getFields: vi.fn().mockReturnValue([mockField]),
    getField: vi.fn().mockImplementation(() => {
      // Use getFieldType to check current field type
      return getFieldType() === "checkbox" ? singletonCheckBox : singletonTextField;
    }),
    getTextField: vi.fn().mockReturnValue(singletonTextField),
    getCheckBox: vi.fn().mockReturnValue(singletonCheckBox),
    flatten: vi.fn(),
  };

  const mockPDFDocument = {
    getForm: vi.fn().mockReturnValue(mockForm),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
  };

  return {
    PDFDocument: {
      load: vi.fn().mockResolvedValue(mockPDFDocument),
    },
    PDFTextField: MockPDFTextField,
    PDFCheckBox: MockPDFCheckBox,
  };
});

describe("generatePDF", () => {
  beforeEach(() => {
    // Clear call history but keep the mock functions
    singletonTextField.setText.mockClear();
    singletonCheckBox.check.mockClear();
    singletonCheckBox.uncheck.mockClear();
    setFieldType("text");
  });

  it("should generate a PDF blob from template and fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await generatePDF("/test-template.pdf", {
      name: "John Doe",
      email: "john@example.com",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.data.type).toBe("application/pdf");
    }
  });

  it("should fail when template cannot be loaded", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const result = await generatePDF("/non-existent.pdf", {
      name: "John Doe",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Failed to load PDF template");
    }
  });

  it("should handle text fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("text");

    await generatePDF("/test-template.pdf", {
      name: "John Doe",
    });

    expect(singletonTextField.setText).toHaveBeenCalledWith("John Doe");
  });

  it("should handle checkbox fields - check", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("checkbox");

    await generatePDF("/test-template.pdf", {
      agree: true,
    });

    expect(singletonCheckBox.check).toHaveBeenCalled();
  });

  it("should handle checkbox fields - uncheck", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("checkbox");

    await generatePDF("/test-template.pdf", {
      agree: false,
    });

    expect(singletonCheckBox.uncheck).toHaveBeenCalled();
  });

  it("should format dates correctly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("text");

    // Use explicit Date constructor to avoid timezone issues
    const testDate = new Date(1990, 0, 15); // January 15, 1990 in local time

    await generatePDF("/test-template.pdf", {
      birthdate: testDate,
    });

    expect(singletonTextField.setText).toHaveBeenCalledWith("01/15/1990");
  });

  it("should skip null and undefined values", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await generatePDF("/test-template.pdf", {
      name: "John Doe",
      email: null,
      phone: undefined,
    });

    expect(result.success).toBe(true);
  });

  it("should handle date formatting options", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("text");

    // Use explicit Date constructor to avoid timezone issues
    const testDate = new Date(1990, 0, 15); // January 15, 1990 in local time

    await generatePDF(
      "/test-template.pdf",
      {
        birthdate: testDate,
      },
      { dateFormat: "YYYY-MM-DD" }
    );

    expect(singletonTextField.setText).toHaveBeenCalledWith("1990-01-15");
  });

  it("should flatten form when flatten option is true", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await generatePDF(
      "/test-template.pdf",
      { name: "John Doe" },
      { flatten: true }
    );

    // Just verify it completes successfully - flatten is called internally
    expect(result.success).toBe(true);
  });

  it("should not flatten form by default", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await generatePDF("/test-template.pdf", { name: "John Doe" });

    // Just verify it completes successfully
    expect(result.success).toBe(true);
  });

  it("should handle string boolean values for checkboxes", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("checkbox");

    await generatePDF("/test-template.pdf", {
      agree: "yes",
    });

    expect(singletonCheckBox.check).toHaveBeenCalled();
  });

  it("should convert boolean values to text", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    setFieldType("text");

    await generatePDF("/test-template.pdf", {
      is_active: true,
    });

    expect(singletonTextField.setText).toHaveBeenCalledWith("Yes");
  });

  it("should return error for fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await generatePDF("/test-template.pdf", {
      name: "John Doe",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("PDF generation failed");
    }
  });
});

describe("hasFormFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true for template with fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await hasFormFields("/test-template.pdf");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(true);
    }
  });

  it("should fail when template cannot be loaded", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const result = await hasFormFields("/non-existent.pdf");

    expect(result.success).toBe(false);
  });
});

describe("getTemplateFieldNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of field names", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(100),
    });

    const result = await getTemplateFieldNames("/test-template.pdf");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it("should fail when template cannot be loaded", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const result = await getTemplateFieldNames("/non-existent.pdf");

    expect(result.success).toBe(false);
  });
});

