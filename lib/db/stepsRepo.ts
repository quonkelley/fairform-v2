import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase";
import type { CaseStep, CreateCaseStepInput, UpdateStepCompletionInput } from "@/lib/validation";

export class StepsRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StepsRepositoryError";
  }
}

const COLLECTION_NAME = "caseSteps";

export async function listByCase(caseId: string): Promise<CaseStep[]> {
  try {
    const db = getDb();
    const stepsQuery = query(
      collection(db, COLLECTION_NAME),
      where("caseId", "==", caseId),
      orderBy("order", "asc"),
    );

    const snapshot = await getDocs(stepsQuery);
    return snapshot.docs.map(mapStepDocument);
  } catch (error) {
    console.error("Failed to list steps for case", { caseId, error });
    throw new StepsRepositoryError("Unable to load case steps", { cause: error });
  }
}

export async function createStep(input: CreateCaseStepInput): Promise<CaseStep> {
  try {
    const db = getDb();
    const stepsRef = collection(db, COLLECTION_NAME);

    const docRef = await addDoc(stepsRef, {
      caseId: input.caseId,
      name: input.name,
      order: input.order,
      dueDate: input.dueDate ? serverTimestamp() : null,
      isComplete: false,
      completedAt: null,
    });

    const persistedSnapshot = await getDoc(docRef);

    if (!persistedSnapshot.exists()) {
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
    const stepRef = doc(db, COLLECTION_NAME, stepId);

    const updateData: Partial<DocumentData> = {
      isComplete: input.isComplete,
      updatedAt: serverTimestamp(),
    };

    if (input.isComplete) {
      updateData.completedAt = serverTimestamp();
    } else {
      updateData.completedAt = null;
    }

    await updateDoc(stepRef, updateData);

    const updatedSnapshot = await getDoc(stepRef);
    if (!updatedSnapshot.exists()) {
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
    const stepRef = doc(db, COLLECTION_NAME, stepId);
    const snapshot = await getDoc(stepRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapStepDocument(snapshot);
  } catch (error) {
    console.error("Failed to get step", { stepId, error });
    throw new StepsRepositoryError("Unable to get step", { cause: error });
  }
}

function getDb(): Firestore {
  return getFirestoreDb();
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
  
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
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
