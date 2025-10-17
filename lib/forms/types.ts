/**
 * Type definitions for the PDF form generation system
 */

/**
 * Result type for operations that can fail
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Supported field types for PDF forms
 */
export type FieldType = "text" | "date" | "checkbox";

/**
 * Field value can be string, boolean, or Date
 */
export type FieldValue = string | boolean | Date | null | undefined;

/**
 * Individual field definition in a form template
 */
export interface FormField {
  /** Unique field identifier */
  id: string;
  /** Human-readable label shown to user */
  label: string;
  /** Field type determines how it's rendered and validated */
  type: FieldType;
  /** Whether this field must be filled */
  required: boolean;
  /** PDF field name (must match field name in PDF template) */
  pdfFieldName: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional help text */
  helpText?: string;
}

/**
 * Complete form template definition
 */
export interface FormTemplate {
  /** Unique form identifier (e.g., "marion-appearance") */
  formId: string;
  /** Human-readable form title */
  title: string;
  /** Jurisdiction this form applies to (e.g., "marion-county-in") */
  jurisdiction: string;
  /** Description of what this form is for */
  description?: string;
  /** Array of field definitions */
  fields: FormField[];
  /** Optional PDF template URL or path */
  templateUrl?: string;
}

/**
 * Form data submitted by user
 */
export interface FormData {
  /** Form identifier */
  formId: string;
  /** Field values keyed by field ID */
  fields: Record<string, FieldValue>;
  /** Optional metadata */
  metadata?: {
    caseId?: string;
    userId?: string;
    submittedAt?: Date;
  };
}

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  /** Whether to flatten the form (make it non-editable) */
  flatten?: boolean;
  /** Custom font size (default: 12) */
  fontSize?: number;
  /** Date format string (default: "MM/DD/YYYY") */
  dateFormat?: string;
}

/**
 * HTML preview options
 */
export interface HTMLPreviewOptions {
  /** Include styles inline */
  inlineStyles?: boolean;
  /** Show disclaimer about PDF generation failure */
  showDisclaimer?: boolean;
}

