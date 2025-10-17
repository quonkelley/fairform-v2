/**
 * Tests for form validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  validateFormData,
  validateSingleField,
  coerceFieldValue,
  toResult,
} from "@/lib/forms/validators";
import type { FormTemplate } from "@/lib/forms/types";

describe("validateFormData", () => {
  const mockTemplate: FormTemplate = {
    formId: "test-form",
    title: "Test Form",
    jurisdiction: "test-jurisdiction",
    fields: [
      {
        id: "name",
        label: "Full Name",
        type: "text",
        required: true,
        pdfFieldName: "name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "text",
        required: false,
        pdfFieldName: "email",
      },
      {
        id: "birthdate",
        label: "Birth Date",
        type: "date",
        required: true,
        pdfFieldName: "birthdate",
      },
      {
        id: "agree_terms",
        label: "I agree to terms",
        type: "checkbox",
        required: false,
        pdfFieldName: "agree_terms",
      },
    ],
  };

  it("should pass validation for valid complete data", () => {
    const fields = {
      name: "John Doe",
      email: "john@example.com",
      birthdate: new Date("1990-01-01"),
      agree_terms: true,
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should pass validation for required fields only", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail validation for missing required field", () => {
    const fields = {
      email: "john@example.com",
      birthdate: new Date("1990-01-01"),
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].fieldId).toBe("name");
    expect(result.errors[0].error).toContain("required");
  });

  it("should fail validation for multiple missing required fields", () => {
    const fields = {
      email: "john@example.com",
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("should fail validation for invalid date", () => {
    const fields = {
      name: "John Doe",
      birthdate: "not-a-date",
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].fieldId).toBe("birthdate");
    expect(result.errors[0].error).toContain("valid date");
  });

  it("should accept Date object for date field", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
  });

  it("should accept valid date string for date field", () => {
    const fields = {
      name: "John Doe",
      birthdate: "1990-01-01",
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
  });

  it("should accept boolean values for checkbox", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: true,
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
  });

  it("should accept string boolean values for checkbox", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: "yes",
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(true);
  });

  it("should fail for invalid checkbox value", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: "maybe",
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors[0].fieldId).toBe("agree_terms");
  });

  it("should treat empty string as missing value", () => {
    const fields = {
      name: "",
      birthdate: new Date("1990-01-01"),
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors[0].fieldId).toBe("name");
  });

  it("should treat whitespace-only string as missing value", () => {
    const fields = {
      name: "   ",
      birthdate: new Date("1990-01-01"),
    };

    const result = validateFormData(mockTemplate, fields);

    expect(result.success).toBe(false);
    expect(result.errors[0].fieldId).toBe("name");
  });
});

describe("validateSingleField", () => {
  it("should pass for valid required text field", () => {
    const error = validateSingleField("Name", "John Doe", true, "text");
    expect(error).toBeNull();
  });

  it("should fail for empty required field", () => {
    const error = validateSingleField("Name", "", true, "text");
    expect(error).toContain("required");
  });

  it("should pass for empty optional field", () => {
    const error = validateSingleField("Email", "", false, "text");
    expect(error).toBeNull();
  });

  it("should fail for invalid date", () => {
    const error = validateSingleField("Birth Date", "invalid", true, "date");
    expect(error).toContain("valid date");
  });

  it("should pass for valid date string", () => {
    const error = validateSingleField("Birth Date", "2000-01-01", true, "date");
    expect(error).toBeNull();
  });

  it("should pass for Date object", () => {
    const error = validateSingleField(
      "Birth Date",
      new Date("2000-01-01"),
      true,
      "date"
    );
    expect(error).toBeNull();
  });
});

describe("coerceFieldValue", () => {
  it("should convert date string to Date object", () => {
    const result = coerceFieldValue("2000-06-15T12:00:00Z", "date");
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).getFullYear()).toBe(2000);
    expect((result as Date).getMonth()).toBe(5); // June (0-indexed)
  });

  it("should keep Date object as is", () => {
    const date = new Date("2000-01-01");
    const result = coerceFieldValue(date, "date");
    expect(result).toBe(date);
  });

  it("should convert 'true' string to boolean true", () => {
    const result = coerceFieldValue("true", "checkbox");
    expect(result).toBe(true);
  });

  it("should convert 'yes' string to boolean true", () => {
    const result = coerceFieldValue("yes", "checkbox");
    expect(result).toBe(true);
  });

  it("should convert 'false' string to boolean false", () => {
    const result = coerceFieldValue("false", "checkbox");
    expect(result).toBe(false);
  });

  it("should convert 'no' string to boolean false", () => {
    const result = coerceFieldValue("no", "checkbox");
    expect(result).toBe(false);
  });

  it("should handle case insensitive boolean strings", () => {
    expect(coerceFieldValue("TRUE", "checkbox")).toBe(true);
    expect(coerceFieldValue("YES", "checkbox")).toBe(true);
    expect(coerceFieldValue("FALSE", "checkbox")).toBe(false);
  });

  it("should keep boolean values as is", () => {
    expect(coerceFieldValue(true, "checkbox")).toBe(true);
    expect(coerceFieldValue(false, "checkbox")).toBe(false);
  });

  it("should return original value for text fields", () => {
    const result = coerceFieldValue("some text", "text");
    expect(result).toBe("some text");
  });

  it("should handle null values", () => {
    expect(coerceFieldValue(null, "text")).toBeNull();
    expect(coerceFieldValue(null, "date")).toBeNull();
    expect(coerceFieldValue(null, "checkbox")).toBeNull();
  });
});

describe("toResult", () => {
  it("should convert successful validation to Result", () => {
    const validation = {
      success: true,
      errors: [],
    };

    const result = toResult(validation);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(true);
    }
  });

  it("should convert failed validation to Result with error", () => {
    const validation = {
      success: false,
      errors: [
        {
          fieldId: "name",
          fieldLabel: "Name",
          error: "Name is required",
        },
      ],
      errorMessage: "Validation failed",
    };

    const result = toResult(validation);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Validation failed");
    }
  });
});

