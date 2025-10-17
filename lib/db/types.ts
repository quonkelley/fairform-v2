// Shared types for database entities
// This file can be safely imported on both client and server

import type { Case, CreateCaseInput, CaseStatus, CaseStep, Reminder } from "@/lib/validation";
import type { CompletedFormRecord } from "@/lib/forms/completedForm";

// Re-export validation types
export type { Case, CreateCaseInput, CaseStatus, CaseStep, Reminder };
export type { CompletedFormRecord };

// Alias for backward compatibility
export type CaseRecord = Case;
