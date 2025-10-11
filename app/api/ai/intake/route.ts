import { NextRequest, NextResponse } from "next/server";

import { logIntakeClassification } from "@/lib/ai/logs";
import { moderateInput, ModerationError } from "@/lib/ai/moderate";
import { INTAKE_SYSTEM_PROMPT, buildIntakeUserPrompt } from "@/lib/ai/prompts/intake";
import {
  IntakeClassificationSchema,
  IntakeRequestSchema,
  type IntakeClassification,
} from "@/lib/ai/schemas";
import { requireAuth } from "@/lib/auth/server-auth";

const CHAT_COMPLETIONS_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_INTAKE_MODEL ?? "gpt-4o-mini";
const DEFAULT_TEMPERATURE = Number(process.env.AI_INTAKE_TEMP ?? "0.2");

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ConfigurationError", message: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  const body = await safeReadJson(request);
  const parsedRequest = IntakeRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        error: "ValidationError",
        message: "Invalid intake request.",
        details: parsedRequest.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const moderation = await moderateInput({ text: parsedRequest.data.text });

    if (moderation.verdict === "block") {
      return NextResponse.json(
        {
          error: "ContentBlocked",
          message: "We’re unable to process this request. Please review your description and try again.",
          moderation,
        },
        { status: 400 },
      );
    }

    const response = await fetch(CHAT_COMPLETIONS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INTAKE_SYSTEM_PROMPT.trim() },
          { role: "user", content: buildIntakeUserPrompt(parsedRequest.data) },
        ],
      }),
    });

    if (!response.ok) {
      const errorDetails = await safeParseJson(response);
      return NextResponse.json(
        {
          error: "UpstreamError",
          message: "The AI service is unavailable right now. Try again shortly.",
          details: errorDetails,
        },
        { status: 502 },
      );
    }

    const completion = await response.json() as ChatCompletionResponse;
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "UnexpectedResponse", message: "AI response missing content." },
        { status: 502 },
      );
    }

    const parsedContent = parseJson(content);
    const classificationResult = IntakeClassificationSchema.safeParse(parsedContent);

    if (!classificationResult.success) {
      return NextResponse.json(
        {
          error: "SchemaMismatch",
          message: "AI response did not match the expected schema.",
          details: classificationResult.error.flatten(),
        },
        { status: 502 },
      );
    }

    await logIntakeClassification({
      userId: user.uid,
      originalInput: parsedRequest.data.text,
      classification: classificationResult.data,
      moderation,
    });

    return NextResponse.json(
      {
        data: classificationResult.data satisfies IntakeClassification,
        moderation,
        requiresReview: moderation.verdict === "review",
      },
      { status: moderation.verdict === "review" ? 202 : 200 },
    );
  } catch (error) {
    if (error instanceof ModerationError) {
      return NextResponse.json(
        {
          error: "ModerationFailure",
          message: "Content moderation failed. Please try again.",
        },
        { status: 502 },
      );
    }

    console.error("AI intake processing failed", error);
    return NextResponse.json(
      { error: "ServerError", message: "Unable to process intake request." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    {
      error: "MethodNotAllowed",
      message: "Use POST to invoke the AI intake pipeline.",
    },
    { status: 405 },
  );
}

async function safeReadJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseJson(content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Failed to parse AI JSON response", { cause: error });
  }
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};
