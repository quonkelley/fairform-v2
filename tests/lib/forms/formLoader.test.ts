/**
 * Tests for form template loader
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  loadFormTemplate,
  clearTemplateCache,
  getCachedTemplateIds,
  isTemplateCached,
  preloadTemplates,
  registerFormTemplate,
} from "@/lib/forms/formLoader";
import type { FormTemplate } from "@/lib/forms/types";

const baseTemplate: FormTemplate = {
  formId: "test-form",
  title: "Test Form",
  jurisdiction: "test-jurisdiction",
  fields: [
    {
      id: "field1",
      label: "Field 1",
      type: "text",
      required: true,
      pdfFieldName: "field1",
    },
  ],
};

function createTemplate(overrides: Partial<FormTemplate> = {}): FormTemplate {
  return {
    ...baseTemplate,
    ...overrides,
    fields: overrides.fields ?? baseTemplate.fields,
  };
}

describe("loadFormTemplate", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should load the built-in Marion Appearance template", async () => {
    const result = await loadFormTemplate("marion-appearance");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formId).toBe("marion-appearance");
      expect(result.data.fields.length).toBeGreaterThan(0);
    }
  });

  it("should load a runtime-registered template", async () => {
    registerFormTemplate("custom-form", createTemplate({ formId: "custom-form" }));

    const result = await loadFormTemplate("custom-form");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formId).toBe("custom-form");
      expect(result.data.title).toBe("Test Form");
    }
  });

  it("should return cached instance on subsequent loads", async () => {
    registerFormTemplate("cached-form", createTemplate({ formId: "cached-form" }));

    const first = await loadFormTemplate("cached-form");
    const second = await loadFormTemplate("cached-form");

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    if (first.success && second.success) {
      expect(first.data).toBe(second.data);
      expect(isTemplateCached("cached-form")).toBe(true);
    }
  });

  it("should return error for unknown template", async () => {
    const result = await loadFormTemplate("unknown-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('unknown-form');
    }
  });

  it("should validate required template fields", async () => {
    registerFormTemplate("invalid-form", {
      ...baseTemplate,
      formId: "invalid-form",
      title: "",
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("title");
    }
  });
});

describe("clearTemplateCache", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should clear cache and runtime templates", async () => {
    registerFormTemplate("runtime-form", createTemplate({ formId: "runtime-form" }));

    await loadFormTemplate("runtime-form");
    expect(isTemplateCached("runtime-form")).toBe(true);

    clearTemplateCache();

    expect(isTemplateCached("runtime-form")).toBe(false);

    const result = await loadFormTemplate("runtime-form");
    expect(result.success).toBe(false);
  });
});

describe("getCachedTemplateIds", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should return empty array when no templates cached", () => {
    expect(getCachedTemplateIds()).toEqual([]);
  });

  it("should list cached template identifiers", async () => {
    registerFormTemplate("form-a", createTemplate({ formId: "form-a" }));
    registerFormTemplate("form-b", createTemplate({ formId: "form-b" }));

    await loadFormTemplate("form-a");
    await loadFormTemplate("form-b");

    const ids = getCachedTemplateIds();

    expect(ids).toContain("form-a");
    expect(ids).toContain("form-b");
  });
});

describe("preloadTemplates", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should preload registered templates", async () => {
    registerFormTemplate("preload-1", createTemplate({ formId: "preload-1" }));
    registerFormTemplate("preload-2", createTemplate({ formId: "preload-2" }));

    const results = await preloadTemplates(["preload-1", "preload-2"]);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.result.success)).toBe(true);
    expect(isTemplateCached("preload-1")).toBe(true);
    expect(isTemplateCached("preload-2")).toBe(true);
  });

  it("should report failures for missing templates", async () => {
    registerFormTemplate("preload-valid", createTemplate({ formId: "preload-valid" }));

    const results = await preloadTemplates(["preload-valid", "preload-missing"]);

    const successResult = results.find((r) => r.formId === "preload-valid");
    const failureResult = results.find((r) => r.formId === "preload-missing");

    expect(successResult?.result.success).toBe(true);
    expect(failureResult?.result.success).toBe(false);
  });
});
