import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { moderateInput } from "@/lib/ai/moderate";
import { ChatRequestSchema } from "@/lib/ai/schemas";
import { requireAuth } from "@/lib/auth/server-auth";
import {
  createSession,
  appendMessage,
  getSession,
  updateSessionCase,
} from "@/lib/db/aiSessionsRepo";
import type { AISession } from "@/lib/ai/types";

// Environment configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";
const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? "0.2");
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? "1000");
const DEMO_TOKEN = process.env.DEMO_TOKEN ?? "demo-secret-token";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const SAFE_ASSISTANT_FALLBACK_RESPONSE =
  "I apologize, but I cannot provide a response to that request. Please feel free to ask me about legal processes or procedures, and I'll be happy to help with general information.";

// Custom error class for AI service errors
class AIServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public retryable: boolean = false,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "AIServiceError";
  }
}

/**
 * Check if request is a demo request with valid token
 */
function isDemoRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${DEMO_TOKEN}`;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Build system prompt for AI Copilot
 */
function buildSystemPrompt(): string {
  return `You are FairForm's AI Copilot, an intelligent assistant helping self-represented litigants navigate their legal cases. 

Your role:
- Provide helpful guidance and information about legal processes
- Explain legal terms in plain language
- Suggest practical next steps for users' cases
- Help users understand their rights and options

Important guidelines:
- NEVER provide legal advice or tell users what will happen in their case
- Always remind users to consult with an attorney for legal advice
- Use empathetic, supportive language at an 8th-grade reading level
- Focus on procedural guidance and general legal information
- If asked about specific case outcomes, explain that only an attorney can provide legal advice

You are here to empower and educate, not to replace legal counsel.`;
}

type ChatCompletionStream = AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
type ChatCompletionResult = OpenAI.Chat.Completions.ChatCompletion;

interface ChatCompletionBaseOptions {
  maxRetries?: number;
}

interface StreamingOptions extends ChatCompletionBaseOptions {
  stream: true;
}

interface NonStreamingOptions extends ChatCompletionBaseOptions {
  stream?: false;
}

/**
 * Handle chat completion with retry logic for both streaming and JSON flows
 */
async function chatCompletionWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: StreamingOptions
): Promise<ChatCompletionStream>;
async function chatCompletionWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: NonStreamingOptions
): Promise<ChatCompletionResult>;
async function chatCompletionWithRetry(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: StreamingOptions | NonStreamingOptions = {}
): Promise<ChatCompletionStream | ChatCompletionResult> {
  const { stream = false, maxRetries = 2 } = options;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages,
        temperature: AI_TEMPERATURE,
        max_tokens: AI_MAX_TOKENS,
        stream,
      });

      return response as ChatCompletionStream | ChatCompletionResult;
    } catch (error: unknown) {
      lastError = error;

      const status = getErrorStatus(error);

      // Don't retry on client errors (4xx), surface them immediately
      if (status !== null && status >= 400 && status < 500) {
        const message = getErrorMessage(error, "OpenAI API error");
        throw new AIServiceError(message, status, status >= 500, { cause: error });
      }

      if (attempt === maxRetries) {
        break;
      }

      await delay(Math.pow(2, attempt) * 1000);
    }
  }

  const message = getErrorMessage(lastError, "OpenAI API failed after retries");
  throw new AIServiceError(message, 502, true, { cause: lastError });
}

/**
 * Utility delay helper for retry backoff
 */
function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function getErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : null;
  }
  return null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isChatCompletionStream(value: unknown): value is ChatCompletionStream {
  return Boolean(value) && typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function";
}

/**
 * POST /api/ai/copilot/chat - Chat with AI Copilot
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check for API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "ConfigurationError", message: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "InvalidJSON", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const parsedRequest = ChatRequestSchema.safeParse(body);
    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Invalid request data",
          details: parsedRequest.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { message, sessionId, caseId, demo } = parsedRequest.data;

    // Authentication (skip for demo mode)
    let user;
    if (demo && isDemoRequest(request)) {
      // Demo mode - use placeholder user
      user = { uid: "demo-user", email: "demo@fairform.ai", emailVerified: true };
    } else {
      try {
        user = await requireAuth(request);
      } catch {
        return NextResponse.json(
          { error: "Unauthorized", message: "Authentication required" },
          { status: 401 }
        );
      }
    }

    // Content moderation - check user input
    try {
      const moderation = await moderateInput({ text: message });
      if (moderation.verdict === "block") {
        return NextResponse.json(
          {
            error: "ContentBlocked",
            message: "We're unable to process this request. Please review your message and try again.",
            moderation,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Moderation failed:", error);
      return NextResponse.json(
        { error: "ModerationFailure", message: "Content moderation failed" },
        { status: 502 }
      );
    }

    // Session management
    let session;
    if (sessionId) {
      session = await getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "SessionNotFound", message: "Session not found" },
          { status: 404 }
        );
      }

      if (caseId && session.caseId !== caseId) {
        await updateSessionCase(session.id, caseId);
        session = { ...session, caseId };
      }
    } else {
      // Create new session
      session = await createSession({
        userId: user.uid,
        caseId,
        demo: demo || false,
        title: "New Conversation",
      });
    }

    // Generate message IDs
    const assistantMessageId = generateMessageId();

    // Store user message immediately
    await appendMessage(session.id, {
      author: "user",
      content: message,
      meta: {
        model: AI_MODEL,
        latencyMs: Date.now() - startTime,
      },
    });

    // Check if client supports SSE
    const acceptHeader = request.headers.get("accept") || "";
    const supportsSSE = acceptHeader.includes("text/event-stream");

    if (supportsSSE) {
      // Stream response via SSE
      return await handleSSEResponse(session, message, assistantMessageId, startTime);
    } else {
      // Return JSON response
      return await handleJSONResponse(session, message, assistantMessageId, startTime);
    }

  } catch (error) {
    console.error("Chat API error:", error);
    
    if (error instanceof AIServiceError) {
      return NextResponse.json(
        {
          error: "AIServiceError",
          message: error.message,
          retryable: error.retryable,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "InternalError", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Handle SSE streaming response
 */
async function handleSSEResponse(
  session: AISession,
  userMessage: string,
  messageId: string,
  startTime: number
): Promise<Response> {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send meta event
        const metaEvent = {
          sessionId: session.id,
          messageId,
          model: AI_MODEL,
          startedAt: startTime,
        };
        
        controller.enqueue(
          encoder.encode(`event: meta\ndata: ${JSON.stringify(metaEvent)}\n\n`)
        );

        // Build messages array for OpenAI
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ];

        // Get OpenAI streaming response with retry coverage
        const completionResponse = await chatCompletionWithRetry(messages, { stream: true });
        if (!isChatCompletionStream(completionResponse)) {
          throw new AIServiceError("Streaming response unavailable", 502, true);
        }
        const completion = completionResponse;

        let fullResponse = "";
        let tokensIn = 0;
        let tokensOut = 0;

        // Stream chunks
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;

            const deltaEvent = { chunk: content };
            controller.enqueue(
              encoder.encode(`event: delta\ndata: ${JSON.stringify(deltaEvent)}\n\n`)
            );
          }

          if (chunk.usage?.prompt_tokens) {
            tokensIn = chunk.usage.prompt_tokens;
          }

          if (chunk.usage?.completion_tokens) {
            tokensOut = chunk.usage.completion_tokens;
          }
        }

        const moderationResult = await moderateAssistantOutput(fullResponse);
        const latencyMs = Date.now() - startTime;

        const metaForStorage = {
          tokensIn,
          tokensOut: tokensOut || estimateTokens(fullResponse),
          latencyMs,
          model: AI_MODEL,
          blocked: moderationResult.blocked,
          moderation: moderationResult.flaggedCategories.length > 0
            ? { flaggedCategories: moderationResult.flaggedCategories }
            : undefined,
        };

        if (moderationResult.blocked) {
          controller.enqueue(
            encoder.encode(
              `event: moderation_blocked\ndata: ${JSON.stringify({
                fallback: SAFE_ASSISTANT_FALLBACK_RESPONSE,
                categories: moderationResult.flaggedCategories,
              })}\n\n`
            )
          );
        }

        const doneEvent: Record<string, unknown> = {
          tokensIn,
          tokensOut: metaForStorage.tokensOut,
          latencyMs,
          blocked: moderationResult.blocked,
        };

        if (moderationResult.blocked) {
          doneEvent.fallback = SAFE_ASSISTANT_FALLBACK_RESPONSE;
        }

        controller.enqueue(
          encoder.encode(`event: done\ndata: ${JSON.stringify(doneEvent)}\n\n`)
        );

        await appendMessage(session.id, {
          author: "assistant",
          content: moderationResult.blocked ? SAFE_ASSISTANT_FALLBACK_RESPONSE : fullResponse,
          meta: metaForStorage,
        });

        controller.close();
      } catch (error) {
        console.error("SSE streaming error:", error);

        const aiError = error instanceof AIServiceError ? error : null;
        const errorEvent = {
          message: aiError?.message ?? "Streaming failed",
          retryable: aiError?.retryable ?? false,
        };

        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`)
        );

        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

interface AssistedModerationResult {
  blocked: boolean;
  flaggedCategories: string[];
}

async function moderateAssistantOutput(text: string): Promise<AssistedModerationResult> {
  if (!text.trim()) {
    return { blocked: false, flaggedCategories: [] };
  }

  try {
    const moderation = await moderateInput({ text });
    if (moderation.verdict === "block") {
      return {
        blocked: true,
        flaggedCategories: moderation.flaggedCategories ?? [],
      };
    }

    return {
      blocked: false,
      flaggedCategories: moderation.flaggedCategories ?? [],
    };
  } catch (error) {
    console.error("Post-moderation failed:", error);
    return { blocked: false, flaggedCategories: [] };
  }
}

function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }

  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Handle JSON fallback response
 */
async function handleJSONResponse(
  session: AISession,
  userMessage: string,
  messageId: string,
  startTime: number
): Promise<NextResponse> {
  try {
    // Build messages array for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userMessage },
    ];

    // Get OpenAI response (non-streaming)
    const completion = await chatCompletionWithRetry(messages) as ChatCompletionResult;
    const reply = completion.choices[0]?.message?.content || "";
    const latencyMs = Date.now() - startTime;
    const tokensIn = completion.usage?.prompt_tokens ?? 0;
    const tokensOut = completion.usage?.completion_tokens ?? estimateTokens(reply);

    const moderationResult = await moderateAssistantOutput(reply);
    const responseBody = moderationResult.blocked ? SAFE_ASSISTANT_FALLBACK_RESPONSE : reply;

    await appendMessage(session.id, {
      author: "assistant",
      content: responseBody,
      meta: {
        tokensIn,
        tokensOut,
        latencyMs,
        model: AI_MODEL,
        blocked: moderationResult.blocked,
        moderation: moderationResult.flaggedCategories.length > 0
          ? { flaggedCategories: moderationResult.flaggedCategories }
          : undefined,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      messageId,
      reply: responseBody,
      meta: {
        tokensIn,
        tokensOut,
        latencyMs,
        model: AI_MODEL,
        blocked: moderationResult.blocked,
      },
    });

  } catch (error) {
    console.error("JSON response error:", error);
    throw error;
  }
}

/**
 * GET /api/ai/copilot/chat - Method not allowed
 */
export function GET() {
  return NextResponse.json(
    {
      error: "MethodNotAllowed",
      message: "Use POST to chat with the AI Copilot",
    },
    { status: 405 }
  );
}
