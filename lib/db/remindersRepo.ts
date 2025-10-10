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
import type { Reminder, CreateReminderInput } from "@/lib/validation";

export class RemindersRepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "RemindersRepositoryError";
  }
}

const COLLECTION_NAME = "reminders";

export async function createReminder(input: CreateReminderInput & { userId: string }): Promise<Reminder> {
  try {
    const db = getDb();
    const remindersRef = collection(db, COLLECTION_NAME);

    const dueDate = new Date(input.dueDate);
    const docRef = await addDoc(remindersRef, {
      userId: input.userId,
      caseId: input.caseId,
      dueDate: dueDate,
      channel: input.channel,
      message: input.message || generateDefaultMessage(input.channel),
      sent: false,
      createdAt: serverTimestamp(),
    });

    const persistedSnapshot = await getDoc(docRef);

    if (!persistedSnapshot.exists()) {
      // Fallback for eventual consistency: synthesize a record
      return {
        id: docRef.id,
        userId: input.userId,
        caseId: input.caseId,
        dueDate: dueDate,
        channel: input.channel,
        message: input.message || generateDefaultMessage(input.channel),
        sent: false,
        createdAt: new Date(),
      };
    }

    return mapReminderDocument(persistedSnapshot);
  } catch (error) {
    console.error("Failed to create reminder", { input, error });
    throw new RemindersRepositoryError("Unable to create reminder", { cause: error });
  }
}

export async function listByUser(userId: string): Promise<Reminder[]> {
  try {
    const db = getDb();
    const remindersQuery = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("dueDate", "asc"),
    );

    const snapshot = await getDocs(remindersQuery);
    return snapshot.docs.map(mapReminderDocument);
  } catch (error) {
    console.error("Failed to list reminders for user", { userId, error });
    throw new RemindersRepositoryError("Unable to load reminders", { cause: error });
  }
}

export async function listPendingReminders(): Promise<Reminder[]> {
  try {
    const db = getDb();
    const now = new Date();
    const remindersQuery = query(
      collection(db, COLLECTION_NAME),
      where("sent", "==", false),
      where("dueDate", "<=", now),
      orderBy("dueDate", "asc"),
    );

    const snapshot = await getDocs(remindersQuery);
    return snapshot.docs.map(mapReminderDocument);
  } catch (error) {
    console.error("Failed to list pending reminders", { error });
    throw new RemindersRepositoryError("Unable to load pending reminders", { cause: error });
  }
}

export async function getReminder(reminderId: string): Promise<Reminder | null> {
  try {
    const db = getDb();
    const reminderRef = doc(db, COLLECTION_NAME, reminderId);
    const snapshot = await getDoc(reminderRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapReminderDocument(snapshot);
  } catch (error) {
    console.error("Failed to get reminder", { reminderId, error });
    throw new RemindersRepositoryError("Unable to get reminder", { cause: error });
  }
}

function getDb(): Firestore {
  return getFirestoreDb();
}

function mapReminderDocument(snapshot: DocumentSnapshot<DocumentData>): Reminder {
  const data = snapshot.data();
  if (!data) {
    throw new RemindersRepositoryError("Reminder document is empty", {
      cause: { id: snapshot.id },
    });
  }

  return {
    id: snapshot.id,
    userId: String(data.userId ?? ""),
    caseId: String(data.caseId ?? ""),
    dueDate: resolveTimestamp(data.dueDate) || new Date(),
    channel: String(data.channel ?? "email") as "email" | "sms",
    message: String(data.message ?? ""),
    sent: Boolean(data.sent),
    createdAt: resolveTimestamp(data.createdAt) || new Date(),
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

function generateDefaultMessage(channel: "email" | "sms"): string {
  if (channel === "sms") {
    return "Reminder: You have an upcoming case deadline. Check your FairForm dashboard for details.";
  }
  return "This is a reminder about your upcoming case deadline. Please check your FairForm dashboard for more details.";
}
