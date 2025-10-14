import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  FieldValue,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Case, CreateCaseInput, CaseStatus, CaseType } from "@/lib/validation";
import { listByCase as listStepsByCase } from "./stepsRepo";
import { generateCaseJourney } from "@/lib/journeys/generate";
import { hasTemplate } from "@/lib/journeys/templates";

// Re-export types for backward compatibility
export type { Case as CaseRecord, CreateCaseInput, CaseStatus };

// Interface for Firebase Admin SDK Timestamp
interface FirebaseTimestamp {
  toDate: () => Date;
  _seconds: number;
}

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
 * Create a case with journey steps from template
 * @param input - Case creation input with userId
 * @returns Created case with generated journey steps
 */
export async function createCaseWithJourney(
  input: CreateCaseInput & { userId: string }
): Promise<Case> {
  try {
    // Create the case first
    const newCase = await createCase(input);

    // Generate journey steps from template if available
    const caseType = input.caseType as CaseType;
    if (hasTemplate(caseType)) {
      await generateCaseJourney(newCase.id, caseType);

      // Recalculate progress with new steps
      return await calculateCaseProgress(newCase.id);
    }

    return newCase;
  } catch (error) {
    console.error("Failed to create case with journey", { input, error });
    throw new CasesRepositoryError("Unable to create case with journey", {
      cause: error,
    });
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

    // Calculate currentStep: lowest order among incomplete steps, or totalSteps + 1 if all complete
    const incompleteSteps = steps.filter(step => !step.isComplete);
    const currentStep = incompleteSteps.length > 0
      ? Math.min(...incompleteSteps.map(s => s.order))
      : totalSteps > 0 ? totalSteps + 1 : 1;

    // Update case document with calculated values
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(caseId).update({
      progressPct,
      totalSteps,
      completedSteps,
      currentStep,
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
    currentStep: Number.isFinite(data.currentStep) ? data.currentStep : undefined,
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
    return (value as FirebaseTimestamp).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  // Admin SDK Timestamp also has _seconds property
  if (value && typeof value === "object" && "_seconds" in value) {
    return new Date((value as FirebaseTimestamp)._seconds * 1000);
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
