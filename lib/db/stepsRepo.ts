import {
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  FieldValue,
} from "firebase-admin/firestore";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { CaseStep, CreateCaseStepInput, UpdateStepCompletionInput } from "@/lib/validation";

export class StepsRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StepsRepositoryError";
  }
}

// Interface for Firebase Admin SDK Timestamp
interface FirebaseTimestamp {
  toDate: () => Date;
  _seconds: number;
}

const COLLECTION_NAME = "caseSteps";

export async function listByCase(caseId: string): Promise<CaseStep[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("caseId", "==", caseId)
      .get();

    const steps = snapshot.docs.map(mapStepDocument);

    // Sort in memory to avoid composite index requirement
    return steps.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Failed to list steps for case", { caseId, error });
    throw new StepsRepositoryError("Unable to load case steps", { cause: error });
  }
}

export async function createStep(input: CreateCaseStepInput): Promise<CaseStep> {
  try {
    const db = getDb();

    const docRef = await db.collection(COLLECTION_NAME).add({
      caseId: input.caseId,
      name: input.name,
      order: input.order,
      dueDate: input.dueDate ? FieldValue.serverTimestamp() : null,
      isComplete: false,
      completedAt: null,
    });

    const persistedSnapshot = await docRef.get();

    if (!persistedSnapshot.exists) {
      // Fallback for eventual consistency: synthesize a record
      return {
        id: docRef.id,
        caseId: input.caseId,
        name: input.name,
        order: input.order,
        dueDate: input.dueDate || null,
        isComplete: false,
        completedAt: null,
      };
    }

    return mapStepDocument(persistedSnapshot);
  } catch (error) {
    console.error("Failed to create step", { input, error });
    throw new StepsRepositoryError("Unable to create case step", { cause: error });
  }
}

export async function updateStepCompletion(
  stepId: string,
  input: UpdateStepCompletionInput,
): Promise<CaseStep> {
  try {
    const db = getDb();

    const updateData = {
      isComplete: input.isComplete,
      updatedAt: FieldValue.serverTimestamp(),
      completedAt: input.isComplete ? FieldValue.serverTimestamp() : null,
    };

    await db.collection(COLLECTION_NAME).doc(stepId).update(updateData);

    const updatedSnapshot = await db.collection(COLLECTION_NAME).doc(stepId).get();
    if (!updatedSnapshot.exists) {
      throw new StepsRepositoryError("Step not found after update", {
        cause: { stepId },
      });
    }

    return mapStepDocument(updatedSnapshot);
  } catch (error) {
    console.error("Failed to update step completion", { stepId, input, error });
    throw new StepsRepositoryError("Unable to update step completion", { cause: error });
  }
}

export async function getStep(stepId: string): Promise<CaseStep | null> {
  try {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION_NAME).doc(stepId).get();

    if (!snapshot.exists) {
      return null;
    }

    return mapStepDocument(snapshot);
  } catch (error) {
    console.error("Failed to get step", { stepId, error });
    throw new StepsRepositoryError("Unable to get step", { cause: error });
  }
}

function getDb(): Firestore {
  return getAdminFirestore();
}

function mapStepDocument(snapshot: DocumentSnapshot<DocumentData>): CaseStep {
  const data = snapshot.data();
  if (!data) {
    throw new StepsRepositoryError("Step document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    caseId: String(data.caseId ?? ""),
    name: String(data.name ?? ""),
    order: Number.isFinite(data.order) ? data.order : 0,
    dueDate: resolveTimestamp(data.dueDate),
    isComplete: Boolean(data.isComplete),
    completedAt: resolveTimestamp(data.completedAt),
  };
}

function resolveTimestamp(value: unknown): Date | null {
  if (!value) return null;

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
  return null;
}
