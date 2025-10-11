import { createHash } from "crypto";

import { getAdminFirestore } from "@/lib/firebase-admin";
import type { IntakeClassification } from "@/lib/ai/schemas";
import type { ModerationResult } from "@/lib/ai/moderate";

const COLLECTION = "aiIntakeLogs";
const MAX_PREVIEW_LENGTH = 160;

export interface IntakeLogEntry {
  userId: string;
  inputPreview: string;
  inputHash: string;
  classification: IntakeClassification;
  moderation: Pick<ModerationResult, "verdict" | "flaggedCategories">;
  createdAt: Date;
}

export async function logIntakeClassification(params: {
  userId: string;
  originalInput: string;
  classification: IntakeClassification;
  moderation: ModerationResult;
}): Promise<void> {
  try {
    const db = getAdminFirestore();
    const cleanPreview = params.originalInput.trim().slice(0, MAX_PREVIEW_LENGTH);
    const document: IntakeLogDocument = {
      userId: params.userId,
      inputPreview: cleanPreview,
      inputHash: hashInput(params.originalInput),
      classification: params.classification,
      moderation: {
        verdict: params.moderation.verdict,
        flaggedCategories: params.moderation.flaggedCategories,
      },
      createdAt: new Date(),
    };

    await db.collection(COLLECTION).add(document);
  } catch (error) {
    console.error("Failed to log AI intake classification", error);
  }
}

function hashInput(value: string): string {
  return createHash("sha256").update(value.trim()).digest("hex");
}

type IntakeLogDocument = Omit<IntakeLogEntry, "createdAt"> & {
  createdAt: Date;
};
