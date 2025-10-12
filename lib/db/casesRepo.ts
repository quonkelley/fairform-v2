import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  FieldValue,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Case, CreateCaseInput, CaseStatus } from "@/lib/validation";
import { listByCase as listStepsByCase } from "./stepsRepo";

// Re-export types for backward compatibility
export type { Case as CaseRecord, CreateCaseInput, CaseStatus };

export class CasesRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CasesRepositoryError";
  }
}

const COLLECTION_NAME = "cases";

export async function listByUser(userId: string): Promise<Case[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const cases = snapshot.docs.map(mapCaseDocument);
    return cases;
  } catch (error) {
    console.error("Failed to list cases for user", { userId, error });
    throw new CasesRepositoryError("Unable to load cases", { cause: error });
  }
}

export async function getCase(caseId: string): Promise<Case | null> {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION_NAME).doc(caseId).get();

    if (!snapshot.exists) {
      return null;
    }

    return mapCaseDocument(snapshot);
  } catch (error) {
    console.error("Failed to get case", { caseId, error });
    throw new CasesRepositoryError("Unable to get case", { cause: error });
  }
}

export async function createCase(input: CreateCaseInput & { userId: string }): Promise<Case> {
  try {
    const db = getDb();

    const docRef = await db.collection(COLLECTION_NAME).add({
      userId: input.userId,
      title: input.title,
      caseType: input.caseType,
      jurisdiction: input.jurisdiction,
      status: "active" satisfies CaseStatus,
      progressPct: 0,
      totalSteps: 0,
      completedSteps: 0,
      notes: input.notes ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const persistedSnapshot = await docRef.get();

    if (!persistedSnapshot.exists) {
      // Fallback for eventual consistency: synthesize a record
      return {
        id: docRef.id,
        userId: input.userId,
        title: input.title,
        caseType: input.caseType,
        jurisdiction: input.jurisdiction,
        status: "active",
        progressPct: 0,
        totalSteps: 0,
        completedSteps: 0,
        notes: input.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return mapCaseDocument(persistedSnapshot);
  } catch (error) {
    console.error("Failed to create case", { input, error });
    throw new CasesRepositoryError("Unable to create case", { cause: error });
  }
}

/**
 * Calculate and update case progress based on completed steps
 * @param caseId - The case ID to calculate progress for
 * @returns Updated case with progress fields
 */
export async function calculateCaseProgress(caseId: string): Promise<Case> {
  try {
    // Fetch all steps for this case
    const steps = await listStepsByCase(caseId);

    // Calculate progress
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.isComplete).length;
    const progressPct = totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

    // Update case document with calculated values
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(caseId).update({
      progressPct,
      totalSteps,
      completedSteps,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Fetch and return updated case
    const updatedCase = await getCase(caseId);
    if (!updatedCase) {
      throw new CasesRepositoryError("Case not found after progress update", {
        cause: { caseId },
      });
    }

    return updatedCase;
  } catch (error) {
    console.error("Failed to calculate case progress", { caseId, error });
    throw new CasesRepositoryError("Unable to calculate case progress", { cause: error });
  }
}

function getDb(): Firestore {
  return getAdminFirestore();
}

function mapCaseDocument(
  snapshot: DocumentSnapshot<DocumentData>,
): Case {
  const data = snapshot.data();
  if (!data) {
    throw new CasesRepositoryError("Case document is empty", {
      cause: { id: snapshot.id },
    });
  }
  return {
    id: snapshot.id,
    userId: String(data.userId ?? ""),
    title: typeof data.title === "string" && data.title.trim().length
      ? data.title
      : formatCaseTitle(data.caseType, data.jurisdiction),
    caseType: String(data.caseType ?? "unknown"),
    jurisdiction: String(data.jurisdiction ?? "unknown"),
    status: (data.status ?? "active") as CaseStatus,
    progressPct: Number.isFinite(data.progressPct) ? data.progressPct : 0,
    totalSteps: Number.isFinite(data.totalSteps) ? data.totalSteps : undefined,
    completedSteps: Number.isFinite(data.completedSteps) ? data.completedSteps : undefined,
    notes:
      typeof data.notes === "string" && data.notes.trim().length
        ? data.notes
        : null,
    createdAt: resolveTimestamp(data.createdAt),
    updatedAt: resolveTimestamp(data.updatedAt),
  };
}

function resolveTimestamp(value: unknown): Date {
  // Admin SDK Timestamp has toDate() method
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as any).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  // Admin SDK Timestamp also has _seconds property
  if (value && typeof value === "object" && "_seconds" in value) {
    return new Date((value as any)._seconds * 1000);
  }
  if (typeof value === "number") {
    return new Date(value);
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return new Date();
}

function formatCaseTitle(caseType: unknown, jurisdiction: unknown): string {
  const formattedType = humanize(String(caseType ?? "Case"));
  const formattedJurisdiction = humanize(String(jurisdiction ?? ""));
  return formattedJurisdiction
    ? `${formattedType} (${formattedJurisdiction})`
    : formattedType;
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
