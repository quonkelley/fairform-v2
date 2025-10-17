/**
 * Form validation utilities
 * Validates form data before PDF generation
 */

import type { FormTemplate, FieldValue, Result } from "./types";

/**
 * Validation error details
 */
export interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  error: string;
}

/**
 * Validation result with detailed error information
 */
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  errorMessage?: string;
}

/**
 * Validate form data against a form template
 *
 * @param template - Form template with field definitions
 * @param fields - Field values to validate
 * @returns Validation result with errors if any
 */
export function validateFormData(
  template: FormTemplate,
  fields: Record<string, FieldValue>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate each field in the template
  for (const field of template.fields) {
    const value = fields[field.id];

    // Check required fields
    if (field.required && !hasValue(value)) {
      errors.push({
        fieldId: field.id,
        fieldLabel: field.label,
        error: `${field.label} is required`,
      });
      continue;
    }

    // Skip validation for optional empty fields
    if (!hasValue(value)) {
      continue;
    }

    // Validate field type
    const typeError = validateFieldType(field.id, field.label, field.type, value);
    if (typeError) {
      errors.push(typeError);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      errorMessage: `Validation failed: ${errors.map((e) => e.error).join("; ")}`,
    };
  }

  return {
    success: true,
    errors: [],
  };
}

/**
 * Check if a value exists and is not empty
 *
 * @param value - Field value to check
 * @returns True if value exists and is not empty
 */
function hasValue(value: FieldValue): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "boolean") {
    return true; // Booleans always have a value
  }

  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  return true;
}

/**
 * Validate field value matches expected type
 *
 * @param fieldId - Field identifier
 * @param fieldLabel - Field label for error messages
 * @param expectedType - Expected field type
 * @param value - Value to validate
 * @returns ValidationError if validation fails, null if valid
 */
function validateFieldType(
  fieldId: string,
  fieldLabel: string,
  expectedType: string,
  value: FieldValue
): ValidationError | null {
  if (expectedType === "date") {
    if (!isValidDate(value)) {
      return {
        fieldId,
        fieldLabel,
        error: `${fieldLabel} must be a valid date`,
      };
    }
  }

  if (expectedType === "checkbox") {
    if (!isValidBoolean(value)) {
      return {
        fieldId,
        fieldLabel,
        error: `${fieldLabel} must be a yes/no value`,
      };
    }
  }

  return null;
}

/**
 * Check if value is a valid date
 *
 * @param value - Value to check
 * @returns True if valid date
 */
function isValidDate(value: FieldValue): boolean {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  return false;
}

/**
 * Check if value is a valid boolean or boolean-like value
 *
 * @param value - Value to check
 * @returns True if valid boolean value
 */
function isValidBoolean(value: FieldValue): boolean {
  if (typeof value === "boolean") {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    return ["true", "false", "yes", "no", "1", "0"].includes(normalized);
  }

  return false;
}

/**
 * Convert a value to the appropriate type for a field
 *
 * @param value - Raw value
 * @param fieldType - Target field type
 * @returns Converted value or original if conversion not needed
 */
export function coerceFieldValue(
  value: FieldValue,
  fieldType: string
): FieldValue {
  if (value === null || value === undefined) {
    return value;
  }

  if (fieldType === "date") {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
  }

  if (fieldType === "checkbox") {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();
      return ["true", "yes", "1"].includes(normalized);
    }
  }

  return value;
}

/**
 * Create a Result from ValidationResult
 * Useful for functions that return Result<true>
 *
 * @param validationResult - Validation result to convert
 * @returns Result<true> or error
 */
export function toResult(validationResult: ValidationResult): Result<true> {
  if (validationResult.success) {
    return { success: true, data: true };
  }

  return {
    success: false,
    error: validationResult.errorMessage || "Validation failed",
  };
}

/**
 * Validate a single field value
 *
 * @param fieldLabel - Field label for error messages
 * @param value - Value to validate
 * @param required - Whether field is required
 * @param fieldType - Field type for type validation
 * @returns Error message if invalid, null if valid
 */
export function validateSingleField(
  fieldLabel: string,
  value: FieldValue,
  required: boolean,
  fieldType: string
): string | null {
  if (required && !hasValue(value)) {
    return `${fieldLabel} is required`;
  }

  if (!hasValue(value)) {
    return null;
  }

  if (fieldType === "date" && !isValidDate(value)) {
    return `${fieldLabel} must be a valid date`;
  }

  if (fieldType === "checkbox" && !isValidBoolean(value)) {
    return `${fieldLabel} must be a yes/no value`;
  }

  return null;
}

