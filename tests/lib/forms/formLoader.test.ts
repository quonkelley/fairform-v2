/**
 * Tests for form template loader
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadFormTemplate,
  clearTemplateCache,
  getCachedTemplateIds,
  isTemplateCached,
  preloadTemplates,
} from "@/lib/forms/formLoader";
import type { FormTemplate } from "@/lib/forms/types";

// Mock valid template
const mockValidTemplate: FormTemplate = {
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

describe("loadFormTemplate", () => {
  beforeEach(() => {
    clearTemplateCache();
    vi.clearAllMocks();
  });

  it("should load a valid form template", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    const result = await loadFormTemplate("test-form");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.formId).toBe("test-form");
      expect(result.data.title).toBe("Test Form");
      expect(result.data.fields).toHaveLength(1);
    }
  });

  it("should cache loaded templates", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    // First load
    await loadFormTemplate("test-form");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second load should use cache
    await loadFormTemplate("test-form");
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it("should return cached template on second load", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    const firstResult = await loadFormTemplate("test-form");
    const secondResult = await loadFormTemplate("test-form");

    expect(firstResult.success).toBe(true);
    expect(secondResult.success).toBe(true);
    if (firstResult.success && secondResult.success) {
      expect(firstResult.data).toEqual(secondResult.data);
    }
  });

  it("should fail for non-existent template", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const result = await loadFormTemplate("non-existent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Failed to load");
    }
  });

  it("should fail for template missing formId", async () => {
    const invalidTemplate = {
      title: "Test Form",
      jurisdiction: "test",
      fields: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("formId");
    }
  });

  it("should fail for template missing title", async () => {
    const invalidTemplate = {
      formId: "test",
      jurisdiction: "test",
      fields: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("title");
    }
  });

  it("should fail for template missing jurisdiction", async () => {
    const invalidTemplate = {
      formId: "test",
      title: "Test",
      fields: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("jurisdiction");
    }
  });

  it("should fail for template with non-array fields", async () => {
    const invalidTemplate = {
      formId: "test",
      title: "Test",
      jurisdiction: "test",
      fields: "not-an-array",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("fields");
      expect(result.error).toContain("array");
    }
  });

  it("should fail for field missing id", async () => {
    const invalidTemplate = {
      formId: "test",
      title: "Test",
      jurisdiction: "test",
      fields: [
        {
          label: "Field",
          type: "text",
          required: true,
          pdfFieldName: "field",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("id");
    }
  });

  it("should fail for field with invalid type", async () => {
    const invalidTemplate = {
      formId: "test",
      title: "Test",
      jurisdiction: "test",
      fields: [
        {
          id: "field1",
          label: "Field",
          type: "invalid-type",
          required: true,
          pdfFieldName: "field",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => invalidTemplate,
    });

    const result = await loadFormTemplate("invalid-form");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("invalid type");
    }
  });

  it("should construct correct path for jurisdiction-formtype format", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    await loadFormTemplate("marion-appearance");

    expect(global.fetch).toHaveBeenCalledWith(
      "/lib/forms/marion/appearance.json"
    );
  });
});

describe("clearTemplateCache", () => {
  it("should clear all cached templates", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    // Load template to populate cache
    await loadFormTemplate("test-form");
    expect(isTemplateCached("test-form")).toBe(true);

    // Clear cache
    clearTemplateCache();
    expect(isTemplateCached("test-form")).toBe(false);
  });
});

describe("getCachedTemplateIds", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should return empty array when cache is empty", () => {
    const ids = getCachedTemplateIds();
    expect(ids).toEqual([]);
  });

  it("should return IDs of cached templates", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    await loadFormTemplate("test-form-1");
    await loadFormTemplate("test-form-2");

    const ids = getCachedTemplateIds();
    expect(ids).toContain("test-form-1");
    expect(ids).toContain("test-form-2");
    expect(ids).toHaveLength(2);
  });
});

describe("isTemplateCached", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should return false for uncached template", () => {
    expect(isTemplateCached("test-form")).toBe(false);
  });

  it("should return true for cached template", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    await loadFormTemplate("test-form");
    expect(isTemplateCached("test-form")).toBe(true);
  });
});

describe("preloadTemplates", () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  it("should preload multiple templates", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    const results = await preloadTemplates(["form1", "form2", "form3"]);

    expect(results).toHaveLength(3);
    expect(isTemplateCached("form1")).toBe(true);
    expect(isTemplateCached("form2")).toBe(true);
    expect(isTemplateCached("form3")).toBe(true);
  });

  it("should return results for each template", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockValidTemplate,
    });

    const results = await preloadTemplates(["form1", "form2"]);

    expect(results[0].formId).toBe("form1");
    expect(results[0].result.success).toBe(true);
    expect(results[1].formId).toBe("form2");
    expect(results[1].result.success).toBe(true);
  });

  it("should handle mix of successful and failed loads", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidTemplate,
      })
      .mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

    const results = await preloadTemplates(["valid-form", "invalid-form"]);

    expect(results[0].result.success).toBe(true);
    expect(results[1].result.success).toBe(false);
  });
});

