/**
 * PDF Generation using pdf-lib
 * Fills PDF form templates with user data
 */

import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import type {
  Result,
  FieldValue,
  PDFGenerationOptions,
} from "./types";

/**
 * Generate a filled PDF from a template and form data
 *
 * @param templateUrl - URL or path to the blank PDF template
 * @param fields - Record of field values keyed by PDF field name
 * @param options - Optional generation settings
 * @returns Result with PDF Blob or error message
 */
export async function generatePDF(
  templateUrl: string,
  fields: Record<string, FieldValue>,
  options: PDFGenerationOptions = {}
): Promise<Result<Blob>> {
  try {
    // Load the PDF template
    const response = await fetch(templateUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load PDF template from ${templateUrl}: ${response.statusText}`,
      };
    }

    const templateBytes = await response.arrayBuffer();

    // Load PDF document with pdf-lib
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Get all form fields for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const formFields = form.getFields();
      console.log(
        `PDF template has ${formFields.length} fields:`,
        formFields.map((f) => f.getName())
      );
    }

    // Fill each field with provided data
    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === null || value === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Skipping null/undefined field: ${fieldName}`);
        }
        continue;
      }

      try {
        // Check if field exists in PDF
        const field = form.getField(fieldName);
        if (!field) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Field "${fieldName}" not found in PDF template`);
          }
          continue;
        }

        // Handle different field types
        if (field instanceof PDFTextField) {
          const textField = form.getTextField(fieldName);
          const textValue = formatFieldValue(value, options);
          textField.setText(textValue);
          if (process.env.NODE_ENV === 'development') {
            console.log(`Set text field "${fieldName}" = "${textValue}"`);
          }
        } else if (field instanceof PDFCheckBox) {
          const checkBox = form.getCheckBox(fieldName);
          if (value === true || value === "true" || value === "yes") {
            checkBox.check();
            if (process.env.NODE_ENV === 'development') {
              console.log(`Checked checkbox "${fieldName}"`);
            }
          } else {
            checkBox.uncheck();
            if (process.env.NODE_ENV === 'development') {
              console.log(`Unchecked checkbox "${fieldName}"`);
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Field "${fieldName}" has unsupported type: ${field.constructor.name}`
            );
          }
        }
      } catch (fieldError) {
        console.error(`Error filling field "${fieldName}":`, fieldError);
        // Continue processing other fields
      }
    }

    // Optionally flatten the form (make non-editable)
    if (options.flatten) {
      form.flatten();
    }

    // Save and return PDF as Blob
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Successfully generated PDF: ${(blob.size / 1024).toFixed(2)} KB`
      );
    }

    return { success: true, data: blob };
  } catch (error) {
    console.error("PDF generation failed:", error);
    return {
      success: false,
      error: `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Format a field value for display in PDF
 *
 * @param value - Raw field value
 * @param options - Generation options (for date formatting)
 * @returns Formatted string value
 */
function formatFieldValue(
  value: FieldValue,
  options: PDFGenerationOptions
): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    // Format date based on options or use default US format
    const dateFormat = options.dateFormat || "MM/DD/YYYY";
    return formatDate(value, dateFormat);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

/**
 * Format a date according to the specified format string
 *
 * @param date - Date to format
 * @param format - Format string (MM/DD/YYYY, YYYY-MM-DD, etc.)
 * @returns Formatted date string
 */
function formatDate(date: Date, format: string): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    default:
      // Default to US format
      return `${month}/${day}/${year}`;
  }
}

/**
 * Check if a PDF template has form fields
 *
 * @param templateUrl - URL or path to the PDF template
 * @returns Result with boolean indicating if template has fields
 */
export async function hasFormFields(
  templateUrl: string
): Promise<Result<boolean>> {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load PDF template: ${response.statusText}`,
      };
    }

    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    return { success: true, data: fields.length > 0 };
  } catch (error) {
    return {
      success: false,
      error: `Failed to check PDF fields: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get list of field names from a PDF template
 *
 * @param templateUrl - URL or path to the PDF template
 * @returns Result with array of field names
 */
export async function getTemplateFieldNames(
  templateUrl: string
): Promise<Result<string[]>> {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load PDF template: ${response.statusText}`,
      };
    }

    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const fieldNames = fields.map((field) => field.getName());

    return { success: true, data: fieldNames };
  } catch (error) {
    return {
      success: false,
      error: `Failed to get field names: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

