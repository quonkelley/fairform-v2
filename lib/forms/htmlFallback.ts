/**
 * HTML Fallback Preview Generator
 * Creates printable HTML preview when PDF generation fails
 */

import type { FormTemplate, FieldValue, HTMLPreviewOptions } from "./types";

/**
 * Generate an HTML preview of form data
 * Used as fallback when PDF generation fails
 *
 * @param template - Form template definition
 * @param fields - Record of field values keyed by field ID
 * @param options - Optional preview settings
 * @returns HTML string ready to be rendered or printed
 */
export function generateHTMLPreview(
  template: FormTemplate,
  fields: Record<string, FieldValue>,
  options: HTMLPreviewOptions = {}
): string {
  const { inlineStyles = true, showDisclaimer = true } = options;

  const styles = inlineStyles ? getInlineStyles() : "";
  const disclaimer = showDisclaimer ? getDisclaimerHTML() : "";

  const fieldsHTML = template.fields
    .map((field) => {
      const value = fields[field.id];
      const displayValue = formatValueForDisplay(value, field.type);

      return `
        <div class="field-row">
          <div class="field-label">
            ${field.label}${field.required ? ' <span class="required">*</span>' : ""}
          </div>
          <div class="field-value">
            ${displayValue}
          </div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.title} - Form Preview</title>
    ${styles}
  </head>
  <body>
    ${disclaimer}
    
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">${template.title}</h1>
        <div class="form-meta">
          <div class="meta-item">
            <strong>Jurisdiction:</strong> ${formatJurisdiction(template.jurisdiction)}
          </div>
          <div class="meta-item">
            <strong>Form ID:</strong> ${template.formId}
          </div>
        </div>
      </div>

      <div class="form-body">
        ${fieldsHTML}
      </div>

      <div class="form-footer">
        <p class="footer-note">
          This is a preview document. Please ensure all information is correct before filing.
        </p>
        <p class="footer-note">
          Generated: ${new Date().toLocaleString()}
        </p>
      </div>
    </div>

    <div class="print-instructions">
      <h3>Printing Instructions:</h3>
      <ol>
        <li>Press <kbd>Ctrl+P</kbd> (Windows) or <kbd>Cmd+P</kbd> (Mac) to print</li>
        <li>Select "Save as PDF" as the destination</li>
        <li>Ensure margins are set to "Default" or "Minimal"</li>
        <li>Click "Save" to save the PDF</li>
      </ol>
    </div>
  </body>
</html>
  `.trim();
}

/**
 * Format field value for HTML display
 *
 * @param value - Raw field value
 * @param fieldType - Type of field
 * @returns Formatted string for display
 */
function formatValueForDisplay(
  value: FieldValue,
  fieldType: string
): string {
  if (value === null || value === undefined || value === "") {
    return '<span class="empty-value">(Not provided)</span>';
  }

  if (fieldType === "checkbox") {
    return value === true || value === "true" || value === "yes"
      ? '<span class="checkbox-checked">☑ Yes</span>'
      : '<span class="checkbox-unchecked">☐ No</span>';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Escape HTML special characters
  const escaped = String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return escaped;
}

/**
 * Format jurisdiction code to readable name
 *
 * @param jurisdiction - Jurisdiction code (e.g., "marion-county-in")
 * @returns Formatted name (e.g., "Marion County, IN")
 */
function formatJurisdiction(jurisdiction: string): string {
  const parts = jurisdiction.split("-");
  if (parts.length >= 2) {
    const county = parts
      .slice(0, -1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const state = parts[parts.length - 1].toUpperCase();
    return `${county}, ${state}`;
  }
  return jurisdiction;
}

/**
 * Get disclaimer HTML for PDF generation failure
 *
 * @returns HTML string for disclaimer banner
 */
function getDisclaimerHTML(): string {
  return `
    <div class="disclaimer-banner">
      <div class="disclaimer-icon">⚠️</div>
      <div class="disclaimer-content">
        <h2 class="disclaimer-title">PDF Generation Failed</h2>
        <p class="disclaimer-text">
          We were unable to generate the standard PDF form. This is a printable 
          preview of your form data. You can print this page to PDF using your 
          browser's print function.
        </p>
      </div>
    </div>
  `;
}

/**
 * Get inline CSS styles for the HTML preview
 *
 * @returns Style tag with embedded CSS
 */
function getInlineStyles(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                     "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background: #f9fafb;
        padding: 2rem 1rem;
      }

      @media print {
        body {
          background: white;
          padding: 0;
        }
        .disclaimer-banner,
        .print-instructions {
          display: none;
        }
      }

      .disclaimer-banner {
        max-width: 800px;
        margin: 0 auto 2rem;
        background: #fef2f2;
        border: 2px solid #ef4444;
        border-radius: 8px;
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
      }

      .disclaimer-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .disclaimer-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #dc2626;
        margin-bottom: 0.5rem;
      }

      .disclaimer-text {
        color: #7f1d1d;
        line-height: 1.5;
      }

      .form-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .form-header {
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
      }

      .form-title {
        font-size: 1.875rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 1rem;
      }

      .form-meta {
        display: flex;
        gap: 2rem;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .meta-item strong {
        color: #374151;
      }

      .form-body {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .field-row {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 1rem;
        padding: 0.75rem;
        border-bottom: 1px solid #f3f4f6;
      }

      .field-row:last-child {
        border-bottom: none;
      }

      .field-label {
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: flex-start;
      }

      .required {
        color: #ef4444;
        margin-left: 0.25rem;
      }

      .field-value {
        color: #1f2937;
        word-break: break-word;
      }

      .empty-value {
        color: #9ca3af;
        font-style: italic;
      }

      .checkbox-checked {
        color: #059669;
        font-weight: 600;
      }

      .checkbox-unchecked {
        color: #6b7280;
      }

      .form-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 2px solid #e5e7eb;
      }

      .footer-note {
        color: #6b7280;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .print-instructions {
        max-width: 800px;
        margin: 2rem auto 0;
        background: #eff6ff;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .print-instructions h3 {
        color: #1e40af;
        margin-bottom: 1rem;
        font-size: 1.125rem;
      }

      .print-instructions ol {
        margin-left: 1.5rem;
        color: #1e3a8a;
      }

      .print-instructions li {
        margin-bottom: 0.5rem;
      }

      kbd {
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 3px;
        padding: 0.125rem 0.375rem;
        font-family: monospace;
        font-size: 0.875em;
      }

      @media (max-width: 640px) {
        body {
          padding: 1rem 0.5rem;
        }

        .field-row {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .form-meta {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    </style>
  `;
}

