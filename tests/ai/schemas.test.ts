import { describe, expect, it } from "vitest";

import {
  IntakeClassificationSchema,
  IntakeRequestSchema,
} from "@/lib/ai/schemas";

describe("IntakeRequestSchema", () => {
  it("passes with valid input", () => {
    const result = IntakeRequestSchema.safeParse({
      text: "My landlord refuses to fix the heater and it's winter time.",
      userTimezone: "America/Los_Angeles",
    });

    expect(result.success).toBe(true);
  });

  it("fails when description is too short", () => {
    const result = IntakeRequestSchema.safeParse({
      text: "Too short",
    });

    expect(result.success).toBe(false);
  });
});

describe("IntakeClassificationSchema", () => {
  it("validates expected response shape", () => {
    const result = IntakeClassificationSchema.safeParse({
      summary: "Landlord has not repaired the heating unit after multiple requests.",
      primaryIssue: "Habitability violation",
      caseType: "Landlord-Tenant",
      jurisdiction: {
        state: "California",
        county: "San Francisco",
        courtLevel: "Small Claims",
      },
      confidence: 0.82,
      riskLevel: "medium",
      recommendedNextSteps: [
        "Document all communication with the landlord.",
        "Send a certified demand letter requesting repairs.",
      ],
      disclaimers: [
        "This information is educational and not a substitute for legal advice.",
      ],
    });

    expect(result.success).toBe(true);
  });

  it("fails when confidence is outside allowed range", () => {
    const result = IntakeClassificationSchema.safeParse({
      summary: "Valid summary content that is long enough.",
      primaryIssue: "Issue",
      caseType: "Case Type",
      jurisdiction: {},
      confidence: 1.4,
      riskLevel: "low",
      recommendedNextSteps: ["Do something"],
      disclaimers: ["Disclaimer"],
    });

    expect(result.success).toBe(false);
  });
});
