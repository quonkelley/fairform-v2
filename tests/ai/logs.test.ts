import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { logIntakeClassification } from "@/lib/ai/logs";
import type { IntakeClassification } from "@/lib/ai/schemas";
import type { ModerationResult } from "@/lib/ai/moderate";
import { getAdminFirestore } from "@/lib/firebase-admin";

vi.mock("@/lib/firebase-admin", () => {
  return {
    getAdminFirestore: vi.fn(),
  };
});

describe("logIntakeClassification", () => {
  const add = vi.fn().mockResolvedValue(undefined);
  const collection = vi.fn().mockReturnValue({ add });

  beforeEach(() => {
    collection.mockClear();
    add.mockClear();
    (getAdminFirestore as unknown as Mock).mockReturnValue({
      collection,
    });
  });

  it("writes anonymized log entries", async () => {
    const classification: IntakeClassification = {
      summary: "Summary value",
      primaryIssue: "Issue",
      caseType: "Landlord-Tenant",
      jurisdiction: { state: "CA" },
      confidence: 0.9,
      riskLevel: "low",
      recommendedNextSteps: ["Document issues"],
      disclaimers: ["Not legal advice"],
    };

    const moderation: ModerationResult = {
      verdict: "pass",
      flaggedCategories: [],
      categoryScores: {},
    };

    await logIntakeClassification({
      userId: "user-123",
      originalInput: "Example input to hash",
      classification,
      moderation,
    });

    expect(collection).toHaveBeenCalledWith("aiIntakeLogs");
    expect(add).toHaveBeenCalledTimes(1);

    const payload = add.mock.calls[0][0];
    expect(payload.userId).toBe("user-123");
    expect(payload.inputPreview).toBe("Example input to hash");
    expect(payload.inputHash).not.toBe("Example input to hash");
    expect(payload.classification).toEqual(classification);
    expect(payload.moderation).toEqual({
      verdict: "pass",
      flaggedCategories: [],
    });
    expect(payload.createdAt).toBeInstanceOf(Date);
  });
});
