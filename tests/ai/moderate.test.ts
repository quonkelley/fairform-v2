import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { moderateInput, ModerationError } from "@/lib/ai/moderate";

const ORIGINAL_API_KEY = process.env.OPENAI_API_KEY;

beforeEach(() => {
  process.env.OPENAI_API_KEY = "test-api-key";
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  process.env.OPENAI_API_KEY = ORIGINAL_API_KEY;
});

describe("moderateInput", () => {
  it("returns pass verdict when no categories flagged", async () => {
    const fetchImpl = vi.fn(async () => createResponse({
      results: [
        {
          flagged: false,
          categories: { harassment: false },
          category_scores: { harassment: 0.1 },
        },
      ],
    }));

    const result = await moderateInput({ text: "I need help with my landlord.", fetchImpl });

    expect(result.verdict).toBe("pass");
    expect(result.flaggedCategories).toEqual([]);
  });

  it("returns block verdict when flagged is true", async () => {
    const fetchImpl = vi.fn(async () => createResponse({
      results: [
        {
          flagged: true,
          categories: { self_harm: true },
          category_scores: { self_harm: 0.9 },
        },
      ],
    }));

    const result = await moderateInput({ text: "I want to hurt someone.", fetchImpl });

    expect(result.verdict).toBe("block");
    expect(result.flaggedCategories).toEqual(["self_harm"]);
  });

  it("returns review when high risk category scores detected", async () => {
    const fetchImpl = vi.fn(async () => createResponse({
      results: [
        {
          flagged: false,
          categories: { self_harm: false },
          category_scores: { self_harm: 0.7 },
        },
      ],
    }));

    const result = await moderateInput({ text: "Thinking about giving up.", fetchImpl });

    expect(result.verdict).toBe("review");
    expect(result.flaggedCategories).toEqual([]);
  });

  it("throws when OpenAI key missing", async () => {
    process.env.OPENAI_API_KEY = "";

    await expect(
      moderateInput({ text: "Missing key" }),
    ).rejects.toBeInstanceOf(ModerationError);
  });
});

function createResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
