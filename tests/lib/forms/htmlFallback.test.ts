/**
 * Tests for HTML fallback preview generator
 */

import { describe, it, expect } from "vitest";
import { generateHTMLPreview } from "@/lib/forms/htmlFallback";
import type { FormTemplate } from "@/lib/forms/types";

describe("generateHTMLPreview", () => {
  const mockTemplate: FormTemplate = {
    formId: "test-form",
    title: "Test Form",
    jurisdiction: "marion-county-in",
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

  it("should generate valid HTML", () => {
    const fields = {
      name: "John Doe",
      email: "john@example.com",
      birthdate: new Date("1990-01-01"),
      agree_terms: true,
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("should include form title", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Test Form");
  });

  it("should include field labels", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Full Name");
    expect(html).toContain("Email Address");
    expect(html).toContain("Birth Date");
  });

  it("should include field values", () => {
    const fields = {
      name: "John Doe",
      email: "john@example.com",
      birthdate: new Date("1990-01-01"),
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("John Doe");
    expect(html).toContain("john@example.com");
  });

  it("should show disclaimer by default", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("PDF Generation Failed");
    expect(html).toContain("disclaimer");
  });

  it("should hide disclaimer when showDisclaimer is false", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields, {
      showDisclaimer: false,
    });

    expect(html).not.toContain("PDF Generation Failed");
  });

  it("should include inline styles by default", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("<style>");
    expect(html).toContain("</style>");
  });

  it("should exclude inline styles when inlineStyles is false", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields, {
      inlineStyles: false,
    });

    expect(html).not.toContain("<style>");
  });

  it("should format dates in readable format", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-15"),
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("January");
    expect(html).toContain("1990");
  });

  it("should show checked checkbox as ☑ Yes", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: true,
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("☑ Yes");
  });

  it("should show unchecked checkbox as ☐ No", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: false,
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("☐ No");
  });

  it("should show (Not provided) for missing optional fields", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("(Not provided)");
  });

  it("should escape HTML special characters in values", () => {
    const fields = {
      name: "John <script>alert('xss')</script> Doe",
      birthdate: new Date("1990-01-01"),
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("should format jurisdiction from code", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Marion County, IN");
  });

  it("should mark required fields with asterisk", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    // Required fields should have asterisk in HTML
    expect(html).toMatch(/Full Name.*\*/);
    expect(html).toMatch(/Birth Date.*\*/);
  });

  it("should include print instructions", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Printing Instructions");
    expect(html).toContain("Ctrl+P");
  });

  it("should include form metadata", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Form ID");
    expect(html).toContain("test-form");
    expect(html).toContain("Jurisdiction");
  });

  it("should include generation timestamp", () => {
    const fields = { name: "John Doe", birthdate: new Date("1990-01-01") };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("Generated:");
  });

  it("should handle empty field values", () => {
    const fields = {
      name: "",
      email: null,
      birthdate: undefined,
      agree_terms: null,
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("(Not provided)");
  });

  it("should handle string boolean values for checkbox", () => {
    const fields = {
      name: "John Doe",
      birthdate: new Date("1990-01-01"),
      agree_terms: "yes",
    };

    const html = generateHTMLPreview(mockTemplate, fields);

    expect(html).toContain("☑ Yes");
  });
});

