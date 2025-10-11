export type ModerationVerdict = "pass" | "review" | "block";

export interface ModerationResult {
  verdict: ModerationVerdict;
  flaggedCategories: string[];
  categoryScores: Record<string, number>;
}

export interface ModerateInput {
  text: string;
  fetchImpl?: typeof fetch;
}

const DEFAULT_MODEL = process.env.AI_MODERATION_MODEL ?? "omni-moderation-latest";
const MODERATION_ENDPOINT = "https://api.openai.com/v1/moderations";

export class ModerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ModerationError";
  }
}

export async function moderateInput({ text, fetchImpl }: ModerateInput): Promise<ModerationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { verdict: "pass", flaggedCategories: [], categoryScores: {} };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ModerationError("Missing OpenAI API key");
  }

  const dispatcher = fetchImpl ?? globalThis.fetch;
  if (!dispatcher) {
    throw new ModerationError("No fetch implementation available");
  }

  const response = await dispatcher(MODERATION_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: trimmed,
    }),
  });

  if (!response.ok) {
    const errorBody = await safeParseJson(response);
    throw new ModerationError("OpenAI moderation request failed", {
      cause: {
        status: response.status,
        body: errorBody,
      },
    });
  }

  const payload = await response.json() as OpenAIModerationResponse;
  const [result] = payload.results ?? [];

  if (!result) {
    throw new ModerationError("OpenAI moderation response missing results");
  }

  const flaggedCategories = Object.entries(result.categories ?? {})
    .filter(([, isFlagged]) => Boolean(isFlagged))
    .map(([category]) => category);

  const categoryScores = normalizeScores(result.category_scores ?? {});

  let verdict: ModerationVerdict = "pass";

  if (result.flagged) {
    verdict = "block";
  } else if (flaggedCategories.length > 0 || hasHighRiskScore(categoryScores)) {
    verdict = "review";
  }

  return {
    verdict,
    flaggedCategories,
    categoryScores,
  };
}

function normalizeScores(scores: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, typeof value === "number" ? value : 0]),
  );
}

function hasHighRiskScore(scores: Record<string, number>): boolean {
  return Object.values(scores).some((score) => score >= 0.5);
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

type OpenAIModerationResponse = {
  results: Array<{
    flagged: boolean;
    categories?: Record<string, boolean>;
    category_scores?: Record<string, number>;
  }>;
};
