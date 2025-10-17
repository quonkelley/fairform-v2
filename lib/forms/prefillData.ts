/**
 * Pre-fill form fields from case data
 */

import type { FormTemplate } from './types';
import type { Case } from '@/lib/db/types';

/**
 * Map case data fields to form fields for pre-filling
 * 
 * @param caseData - The case data to extract values from
 * @param template - The form template with field definitions
 * @returns Record of field IDs to pre-filled values
 */
export function prefillFromCase(
  caseData: Case, 
  template: FormTemplate
): Record<string, unknown> {
  const prefilled: Record<string, unknown> = {};

  for (const field of template.fields) {
    // Map known fields based on field ID conventions
    switch (field.id) {
      case 'case_number':
      case 'caseNumber':
        if (caseData.caseNumber) {
          prefilled[field.id] = caseData.caseNumber;
        }
        break;

      case 'hearing_date':
      case 'hearingDate':
      case 'next_hearing_date':
      case 'nextHearingDate':
        if (caseData.nextHearingDate) {
          prefilled[field.id] = caseData.nextHearingDate;
        }
        break;

      case 'defendant_name':
      case 'defendantName':
      case 'defendant':
        if (caseData.defendant) {
          prefilled[field.id] = caseData.defendant;
        }
        break;

      case 'plaintiff_name':
      case 'plaintiffName':
      case 'plaintiff':
        if (caseData.plaintiff) {
          prefilled[field.id] = caseData.plaintiff;
        }
        break;

      case 'court_name':
      case 'courtName':
      case 'court':
        if (caseData.court) {
          prefilled[field.id] = caseData.court;
        }
        break;

      case 'case_type':
      case 'caseType':
        if (caseData.caseType) {
          prefilled[field.id] = caseData.caseType;
        }
        break;

      case 'filing_date':
      case 'filingDate':
      case 'date_filed':
      case 'dateFiled':
        if (caseData.filingDate) {
          prefilled[field.id] = caseData.filingDate;
        }
        break;

      // User information (if available in case data)
      case 'user_name':
      case 'userName':
      case 'your_name':
      case 'yourName':
      case 'full_name':
      case 'fullName':
        // This might come from user profile or case metadata
        // For now, check if defendant matches user (self-represented)
        if (caseData.defendant) {
          // In self-represented cases, defendant is often the user
          prefilled[field.id] = caseData.defendant;
        }
        break;

      case 'address':
      case 'user_address':
      case 'userAddress':
        if (caseData.propertyAddress) {
          prefilled[field.id] = caseData.propertyAddress;
        }
        break;

      // Check for exact matches in case metadata
      default:
        // Check if the field ID exists in case data (exact match)
        const caseDataAny = caseData as Record<string, unknown>;
        if (caseDataAny[field.id] !== undefined) {
          prefilled[field.id] = caseDataAny[field.id];
        }
        // Also check camelCase to snake_case conversion
        const camelCaseId = field.id.replace(/_([a-z])/g, (_, letter) => 
          letter.toUpperCase()
        );
        if (caseDataAny[camelCaseId] !== undefined) {
          prefilled[field.id] = caseDataAny[camelCaseId];
        }
        break;
    }
  }

  // Log pre-filled fields for debugging
  const prefilledCount = Object.keys(prefilled).length;
  if (prefilledCount > 0) {
    console.log(`Pre-filled ${prefilledCount} fields from case data:`, 
      Object.keys(prefilled)
    );
  }

  return prefilled;
}

/**
 * Format a date value for display in form fields
 * 
 * @param date - Date value from case data
 * @returns Formatted date string or Date object
 */
export function formatDateForForm(date: unknown): Date | null {
  if (!date) return null;
  
  // Handle Firestore Timestamp
  if (typeof date === 'object' && date !== null && 'toDate' in date && 
      typeof (date as { toDate: unknown }).toDate === 'function') {
    return (date as { toDate: () => Date }).toDate();
  }
  
  // Handle Date object
  if (date instanceof Date) {
    return date;
  }
  
  // Handle string date
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // Handle timestamp number
  if (typeof date === 'number') {
    return new Date(date);
  }
  
  return null;
}

/**
 * Validate that all required fields have values
 * 
 * @param template - Form template with field definitions
 * @param values - Current field values
 * @returns Array of missing required field IDs
 */
export function getMissingRequiredFields(
  template: FormTemplate,
  values: Record<string, unknown>
): string[] {
  const missing: string[] = [];
  
  for (const field of template.fields) {
    if (field.required && !values[field.id]) {
      missing.push(field.id);
    }
  }
  
  return missing;
}
