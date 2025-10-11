import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import { POST } from "@/app/api/ai/intake/route";
import { logIntakeClassification } from "@/lib/ai/logs";
import { ModerationError } from "@/lib/ai/moderate";
import * as moderationModule from "@/lib/ai/moderate";

vi.mock("@/lib/auth/server-auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    uid: "user-123",
    email: "user@example.com",
    emailVerified: true,
  }),
}));

vi.mock("@/lib/ai/logs", () => ({
  logIntakeClassification: vi.fn().mockResolvedValue(undefined),
}));

const originalApiKey = process.env.OPENAI_API_KEY;
let fetchSpy: MockInstance<typeof fetch> | null = null;

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-api-key";
  fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Summary content long enough.",
                primaryIssue: "Habitability violation",
                caseType: "Landlord-Tenant",
                jurisdiction: { state: "CA", county: "Alameda", courtLevel: "Small Claims" },
                confidence: 0.85,
                riskLevel: "medium",
                recommendedNextSteps: ["Document communication"],
                disclaimers: ["Not legal advice"],
              }),
            },
          },
        ],
      }),
    ),
  );
});

afterEach(() => {
  fetchSpy?.mockRestore();
  fetchSpy = null;
  vi.clearAllMocks();
});

afterAll(() => {
  process.env.OPENAI_API_KEY = originalApiKey;
});

describe("POST /api/ai/intake", () => {
  it("validates request body", async () => {
    const request = createRequest({ text: "Too short" });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("ValidationError");
  });

  it("returns 400 when moderation blocks input", async () => {
    vi.spyOn(moderationModule, "moderateInput").mockResolvedValue({
      verdict: "block",
      flaggedCategories: ["self_harm"],
      categoryScores: { self_harm: 0.9 },
    });

    const request = createRequest({
      text: "This is lengthy enough to pass validation and should be moderated.",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe("ContentBlocked");
  });

  it("returns 200 with classification data", async () => {
    vi.spyOn(moderationModule, "moderateInput").mockResolvedValue({
      verdict: "pass",
      flaggedCategories: [],
      categoryScores: {},
    });

    const request = createRequest({
      text: "My landlord refuses to fix the heater after many requests which impacts my living conditions.",
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.caseType).toBe("Landlord-Tenant");
    expect(logIntakeClassification).toHaveBeenCalledTimes(1);
  });

  it("handles moderation errors gracefully", async () => {
    vi.spyOn(moderationModule, "moderateInput").mockRejectedValue(
      new ModerationError("failure"),
    );

    const request = createRequest({
      text: "Detailed description that is sufficiently long to meet validation requirements.",
    });

    const response = await POST(request);
    expect(response.status).toBe(502);
  });
});

function createRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/ai/intake", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token",
    },
  });
}
