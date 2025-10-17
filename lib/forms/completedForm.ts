import type { FieldValue } from "./types";

export type CompletedFormStatus = "generated" | "failed";

export interface CompletedFormRecord {
  id: string;
  formId: string;
  formTitle: string | null;
  userId: string;
  caseId: string;
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  status: CompletedFormStatus;
  fields: Record<string, FieldValue>;
  createdAt: Date;
}

export interface CompletedFormInput {
  formId: string;
  formTitle?: string | null;
  userId: string;
  caseId: string;
  storagePath: string;
  downloadUrl: string;
  fileName: string;
  status?: CompletedFormStatus;
  fields: Record<string, FieldValue>;
  createdAt?: Date;
}
