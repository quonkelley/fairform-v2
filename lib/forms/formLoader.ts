/**
 * Form template loader with caching
 * Loads form template definitions from JSON files
 */

import type { FormTemplate, Result } from "./types";
import marionAppearance from "./marion/appearance.json";

// In-memory cache for loaded templates
const templateCache = new Map<string, FormTemplate>();
const runtimeTemplates = new Map<string, FormTemplate>();

const builtInTemplates: Record<string, FormTemplate> = {
  "marion-appearance": marionAppearance as FormTemplate,
};

/**
 * Load a form template by ID
 *
 * @param formId - Form identifier (e.g., "marion-appearance")
 * @returns Result with FormTemplate or error
 */
export async function loadFormTemplate(
  formId: string
): Promise<Result<FormTemplate>> {
  // Check cache first
  if (templateCache.has(formId)) {
    return { success: true, data: templateCache.get(formId)! };
  }

  try {
    const template = await resolveTemplate(formId);
    if (!template) {
      return {
        success: false,
        error: `Form template "${formId}" not found. Ensure it is registered with loadFormTemplate.`,
      };
    }

    const validationResult = validateTemplateStructure(template);
    if (!validationResult.success) {
      return validationResult;
    }

    templateCache.set(formId, validationResult.data);

    return { success: true, data: validationResult.data };
  } catch (error) {
    return {
      success: false,
      error: `Error loading form template "${formId}": ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get the file path for a form template
 *
 * @param formId - Form identifier
 * @returns Path to template JSON file
 */
function getTemplatePath(formId: string): string {
  // Parse form ID to extract jurisdiction
  // Expected format: "{jurisdiction}-{formType}"
  // Example: "marion-appearance" -> "lib/forms/marion/appearance.json"

  const parts = formId.split("-");
  if (parts.length < 2) {
    // Fallback for simple IDs
    return `/lib/forms/${formId}.json`;
  }

  const jurisdiction = parts[0]; // e.g., "marion"
  const formType = parts.slice(1).join("-"); // e.g., "appearance"

  return `/lib/forms/${jurisdiction}/${formType}.json`;
}

/**
 * Validate template structure
 *
 * @param data - Raw template data from JSON
 * @returns Result indicating if structure is valid
 */
function validateTemplateStructure(data: unknown): Result<FormTemplate> {
  if (!data || typeof data !== "object") {
    return {
      success: false,
      error: "Template data is not a valid object",
    };
  }

  const template = data as Record<string, unknown>;

  // Check required fields
  if (!template.formId || typeof template.formId !== "string") {
    return {
      success: false,
      error: "Template missing required field: formId",
    };
  }

  if (!template.title || typeof template.title !== "string") {
    return {
      success: false,
      error: "Template missing required field: title",
    };
  }

  if (!template.jurisdiction || typeof template.jurisdiction !== "string") {
    return {
      success: false,
      error: "Template missing required field: jurisdiction",
    };
  }

  if (!Array.isArray(template.fields)) {
    return {
      success: false,
      error: "Template missing required field: fields (must be array)",
    };
  }

  // Validate each field
  for (let i = 0; i < template.fields.length; i++) {
    const field = template.fields[i];
    if (!field || typeof field !== "object") {
      return {
        success: false,
        error: `Field at index ${i} is not a valid object`,
      };
    }

    const fieldObj = field as Record<string, unknown>;

    const requiredFieldProps = ["id", "label", "type", "pdfFieldName"];
    for (const prop of requiredFieldProps) {
      if (!fieldObj[prop] || typeof fieldObj[prop] !== "string") {
        return {
          success: false,
          error: `Field at index ${i} missing required property: ${prop}`,
        };
      }
    }

    if (typeof fieldObj.required !== "boolean") {
      return {
        success: false,
        error: `Field at index ${i} missing required boolean property: required`,
      };
    }

    // Validate field type
    const validTypes = ["text", "date", "checkbox"];
    if (!validTypes.includes(fieldObj.type as string)) {
      return {
        success: false,
        error: `Field at index ${i} has invalid type: ${fieldObj.type}. Must be one of: ${validTypes.join(", ")}`,
      };
    }
  }

  return { success: true, data: template as unknown as FormTemplate };
}

/**
 * Clear the template cache
 * Useful for testing or forcing reload
 */
export function clearTemplateCache(): void {
  templateCache.clear();
  runtimeTemplates.clear();
}

/**
 * Get a list of all cached template IDs
 *
 * @returns Array of cached form IDs
 */
export function getCachedTemplateIds(): string[] {
  return Array.from(templateCache.keys());
}

/**
 * Preload multiple templates into cache
 * Useful for improving performance by loading templates upfront
 *
 * @param formIds - Array of form IDs to preload
 * @returns Results for each template load
 */
export async function preloadTemplates(
  formIds: string[]
): Promise<Array<{ formId: string; result: Result<FormTemplate> }>> {
  const results = await Promise.all(
    formIds.map(async (formId) => ({
      formId,
      result: await loadFormTemplate(formId),
    }))
  );

  return results;
}

/**
 * Check if a template is cached
 *
 * @param formId - Form identifier
 * @returns True if template is in cache
 */
export function isTemplateCached(formId: string): boolean {
  return templateCache.has(formId);
}

/**
 * Register a template at runtime (primarily for tests or dynamic forms)
 *
 * @param formId - Template identifier
 * @param template - Template definition object
 */
export function registerFormTemplate(
  formId: string,
  template: FormTemplate
): void {
  runtimeTemplates.set(formId, template);
  templateCache.delete(formId);
}

async function resolveTemplate(formId: string): Promise<FormTemplate | null> {
  if (runtimeTemplates.has(formId)) {
    return cloneTemplate(runtimeTemplates.get(formId)!);
  }

  if (builtInTemplates[formId]) {
    return cloneTemplate(builtInTemplates[formId]);
  }

  const templatePath = getTemplatePath(formId);
  if (typeof fetch === "function") {
    try {
      const response = await fetch(templatePath);
      if (response.ok) {
        const templateData = (await response.json()) as FormTemplate;
        runtimeTemplates.set(formId, templateData);
        return cloneTemplate(templateData);
      }
    } catch (error) {
      // Ignore fetch errors and fall through
    }
  }

  return null;
}

function cloneTemplate(template: FormTemplate): FormTemplate {
  if (typeof structuredClone === "function") {
    return structuredClone(template);
  }

  return JSON.parse(JSON.stringify(template)) as FormTemplate;
}
