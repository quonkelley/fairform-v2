// Shared types for database entities
// This file can be safely imported on both client and server

import type { Case, CreateCaseInput, CaseStatus } from "@/lib/validation";

// Re-export validation types
export type { Case, CreateCaseInput, CaseStatus };

// Alias for backward compatibility
export type CaseRecord = Case;
