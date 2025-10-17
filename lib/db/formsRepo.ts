import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  FieldValue,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Result, FieldValue as FormFieldValue } from "@/lib/forms/types";
import type {
  CompletedFormInput,
  CompletedFormRecord,
} from "@/lib/forms/completedForm";

export class FormsRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "FormsRepositoryError";
  }
}

interface FirebaseTimestamp {
  toDate: () => Date;
  _seconds: number;
}

const COLLECTION_NAME = "completedForms";

export async function saveCompletedForm(
  metadata: CompletedFormInput
): Promise<Result<string>> {
  try {
    const db = getDb();

    const docRef = await db.collection(COLLECTION_NAME).add({
      formId: metadata.formId,
      formTitle: metadata.formTitle ?? null,
      userId: metadata.userId,
      caseId: metadata.caseId,
      storagePath: metadata.storagePath,
      downloadUrl: metadata.downloadUrl,
      fileName: metadata.fileName,
      status: metadata.status ?? "generated",
      fields: serializeFields(metadata.fields),
      createdAt: metadata.createdAt ?? FieldValue.serverTimestamp(),
    });

    return { success: true, data: docRef.id };
  } catch (error) {
    console.error("Failed to save completed form metadata", {
      metadata,
      error,
    });
    return {
      success: false,
      error: "Unable to save completed form metadata",
    };
  }
}

export async function listByCase(
  caseId: string,
  userId: string
): Promise<Result<CompletedFormRecord[]>> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("caseId", "==", caseId)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const forms = snapshot.docs.map(mapFormDocument);
    return { success: true, data: forms };
  } catch (error) {
    console.error("Failed to list completed forms", {
      caseId,
      userId,
      error,
    });
    return {
      success: false,
      error: "Unable to load completed forms",
    };
  }
}

function serializeFields(fields: Record<string, FormFieldValue>) {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) {
      serialized[key] = null;
      continue;
    }

    if (value instanceof Date) {
      serialized[key] = value;
      continue;
    }

    serialized[key] = value;
  }

  return serialized;
}

function mapFormDocument(
  snapshot: DocumentSnapshot<DocumentData>
): CompletedFormRecord {
  const data = snapshot.data();
  if (!data) {
    throw new FormsRepositoryError("Completed form document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    formId: String(data.formId ?? ""),
    formTitle: data.formTitle ? String(data.formTitle) : null,
    userId: String(data.userId ?? ""),
    caseId: String(data.caseId ?? ""),
    storagePath: String(data.storagePath ?? ""),
    downloadUrl: String(data.downloadUrl ?? ""),
    fileName: String(data.fileName ?? ""),
    status: (data.status ?? "generated") as CompletedFormRecord["status"],
    fields: deserializeFields(data.fields),
    createdAt: resolveTimestamp(data.createdAt) ?? new Date(),
  };
}

function deserializeFields(
  storedFields: unknown
): Record<string, FormFieldValue> {
  if (!storedFields || typeof storedFields !== "object") {
    return {};
  }

  const entries = Object.entries(storedFields as Record<string, unknown>).map(
    ([key, value]) => [key, resolveFieldValue(value)]
  );

  return Object.fromEntries(entries);
}

function resolveFieldValue(value: unknown): FormFieldValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as FirebaseTimestamp).toDate();
    } catch (error) {
      console.warn("Failed to convert Firestore timestamp to Date", { value, error });
    }
  }

  if (
    typeof value === "object" &&
    value &&
    "_seconds" in value &&
    typeof (value as FirebaseTimestamp)._seconds === "number"
  ) {
    return new Date((value as FirebaseTimestamp)._seconds * 1000);
  }

  return value as FormFieldValue;
}

function resolveTimestamp(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value && "toDate" in value) {
    return (value as FirebaseTimestamp).toDate();
  }

  if (
    typeof value === "object" &&
    value &&
    "_seconds" in value &&
    typeof (value as FirebaseTimestamp)._seconds === "number"
  ) {
    return new Date((value as FirebaseTimestamp)._seconds * 1000);
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  return null;
}

function getDb(): Firestore {
  return getAdminFirestore();
}
