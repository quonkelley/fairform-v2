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
  where,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase";
import type { Case, CreateCaseInput, CaseStatus } from "@/lib/validation";

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
    const casesQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(casesQuery);
    return snapshot.docs.map(mapCaseDocument);
  } catch (error) {
    console.error("Failed to list cases for user", { userId, error });
    throw new CasesRepositoryError("Unable to load cases", { cause: error });
  }
}

export async function getCase(caseId: string): Promise<Case | null> {
  try {
    const db = getDb();
    const caseRef = doc(db, COLLECTION_NAME, caseId);
    const snapshot = await getDoc(caseRef);

    if (!snapshot.exists()) {
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
    const casesRef = collection(db, COLLECTION_NAME);

    const docRef = await addDoc(casesRef, {
      userId: input.userId,
      title: input.title,
      caseType: input.caseType,
      jurisdiction: input.jurisdiction,
      status: "active" satisfies CaseStatus,
      progressPct: 0,
      notes: input.notes ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const persistedSnapshot = await getDoc(docRef);

    if (!persistedSnapshot.exists()) {
      // Fallback for eventual consistency: synthesize a record
      return {
        id: docRef.id,
        title: input.title,
        caseType: input.caseType,
        jurisdiction: input.jurisdiction,
        status: "active",
        progressPct: 0,
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

function getDb(): Firestore {
  return getFirestoreDb();
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
    title: typeof data.title === "string" && data.title.trim().length
      ? data.title
      : formatCaseTitle(data.caseType, data.jurisdiction),
    caseType: String(data.caseType ?? "unknown"),
    jurisdiction: String(data.jurisdiction ?? "unknown"),
    status: (data.status ?? "active") as CaseStatus,
    progressPct: Number.isFinite(data.progressPct) ? data.progressPct : 0,
    notes:
      typeof data.notes === "string" && data.notes.trim().length
        ? data.notes
        : null,
    createdAt: resolveTimestamp(data.createdAt),
    updatedAt: resolveTimestamp(data.updatedAt),
  };
}

function resolveTimestamp(value: unknown): Date {
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
