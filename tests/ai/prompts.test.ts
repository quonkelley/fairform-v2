import { describe, expect, it } from "vitest";

import { buildIntakeUserPrompt, INTAKE_SYSTEM_PROMPT } from "@/lib/ai/prompts/intake";

describe("AI intake prompts", () => {
  it("includes problem description and timezone context", () => {
    const request = {
      text: "My landlord has refused to fix the heating for two weeks.",
      userTimezone: "America/New_York",
    };

    const prompt = buildIntakeUserPrompt(request);

    expect(prompt).toContain(request.text);
    expect(prompt).toContain("America/New_York");
  });

  it("exposes system prompt guidance", () => {
    expect(INTAKE_SYSTEM_PROMPT).toContain("responsible AI intake assistant");
  });
});
