/**
 * Form template loader with caching
 * Loads form template definitions from JSON files
 */

import type { FormTemplate, Result } from "./types";

// In-memory cache for loaded templates
const templateCache = new Map<string, FormTemplate>();

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
    console.log(`Loading form template "${formId}" from cache`);
    return { success: true, data: templateCache.get(formId)! };
  }

  try {
    // Construct path to template JSON
    const templatePath = getTemplatePath(formId);

    // Load template file
    const response = await fetch(templatePath);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load form template "${formId}": ${response.statusText}`,
      };
    }

    const templateData = await response.json();

    // Validate template structure
    const validationResult = validateTemplateStructure(templateData);
    if (!validationResult.success) {
      return validationResult;
    }

    const template = templateData as FormTemplate;

    // Cache the template
    templateCache.set(formId, template);
    console.log(`Loaded and cached form template "${formId}"`);

    return { success: true, data: template };
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
  console.log("Template cache cleared");
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

  const successCount = results.filter((r) => r.result.success).length;
  console.log(
    `Preloaded ${successCount}/${formIds.length} form templates`
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

