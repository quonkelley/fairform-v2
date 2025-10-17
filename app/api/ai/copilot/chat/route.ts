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
  updateContextSnapshot,
  listMessages,
} from "@/lib/db/aiSessionsRepo";
import type { AISession, ConversationStage, MinimumCaseInfo, ContextSnapshot, CaseType } from "@/lib/ai/types";
import { 
  extractCaseInfo, 
  buildAppStateContext, 
  getNextStage,
  mapToConversationState
} from "@/lib/ai/conversationStages";
import { createCaseFromConversation } from "@/lib/ai/caseCreation";

// Environment configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL ?? "gpt-4o-mini";
const AI_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? "0.2");
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? "1000");

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
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Build system prompt for AI Copilot
 */
function buildSystemPrompt(appStateContext?: string): string {
  const basePrompt = `You are FairForm's AI Copilot, an intelligent assistant helping self-represented litigants navigate their legal cases.

Priority Data Collection (ask for or extract these first):
1. CASE NUMBER - Most critical identifier. Always confirm if extracted from notice.
2. CASE TYPE - eviction, small claims, family law, etc.
3. COURT/JURISDICTION - county, state, or specific court
4. HEARING DATE - if visible or mentioned

Conversation Flow Rules:
- When user uploads a notice image, echo back the parsed case number for confirmation
- When minimum info is present (case type + jurisdiction + (case number OR hearing date)), explicitly propose: "I can create your case now. Continue?"
- When [case_creation_success] appears in context, celebrate the success and provide the case link: "🎉 Great! Your case has been created. [View your case →](/cases/{case_id})"
- When [case_creation_error] appears in context, acknowledge the issue and suggest alternatives or retry options
- After case creation, suggest next step: "Generate your plan" or "Fill the Appearance form"

FORM DETECTION:
When the user mentions any of these phrases:
- "I need to file an appearance"
- "How do I appear in court"
- "I want to represent myself"
- "File appearance form"
- "I need to file a form"
- "Help me with court forms"

Respond with helpful text AND include this JSON object at the END of your message (not in the middle):
{
  "formSuggestion": {
    "formId": "marion-appearance",
    "reason": "You need to file an Appearance form to notify the court you're representing yourself."
  }
}

Say something like: "It looks like you need to file an Appearance form. This tells the court you're representing yourself. Would you like me to help you fill it out? It only takes a few minutes."

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

  return appStateContext ? `${basePrompt}\n\n${appStateContext}` : basePrompt;
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

    const { message, sessionId, caseId } = parsedRequest.data;

    // Authentication
    let user;
    try {
      user = await requireAuth(request);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
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

    // Session management with conversation stage tracking
    let session;
    let conversationStage: ConversationStage = 'GREET';
    let collectedInfo: Partial<MinimumCaseInfo> = {};

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

      // Extract conversation state from session metadata if available
      if (session.contextSnapshot) {
        // Restore conversation stage from context snapshot
        conversationStage = session.contextSnapshot.conversationStage || 'GATHER_MIN';
        collectedInfo = session.contextSnapshot.collectedInfo || {
          caseType: session.contextSnapshot.caseType,
          jurisdiction: session.contextSnapshot.jurisdiction,
        };
      }
    } else {
      // Create new session
      session = await createSession({
        userId: user.uid,
        caseId,
        demo: false,
        title: "New Conversation",
      });
      conversationStage = 'GREET';
    }

    // Extract case info from current message
    const extractedInfo = extractCaseInfo(message);
    collectedInfo = { ...collectedInfo, ...extractedInfo };

    // Determine next conversation stage
    conversationStage = getNextStage(conversationStage, collectedInfo, message);

    // Persist conversation stage and collected info to session
    // Note: Filter out undefined values - Firestore requires null instead of undefined
    // Clean collectedInfo to remove undefined fields
    const cleanedCollectedInfo: Partial<MinimumCaseInfo> = {};
    if (collectedInfo.caseType) cleanedCollectedInfo.caseType = collectedInfo.caseType;
    if (collectedInfo.jurisdiction) cleanedCollectedInfo.jurisdiction = collectedInfo.jurisdiction;
    if (collectedInfo.caseNumber) cleanedCollectedInfo.caseNumber = collectedInfo.caseNumber;
    if (collectedInfo.hearingDate) cleanedCollectedInfo.hearingDate = collectedInfo.hearingDate;
    
    const snapshotUpdate: Partial<ContextSnapshot> = {
      ...session.contextSnapshot,
      conversationStage,
      collectedInfo: cleanedCollectedInfo,
    };
    
    // Only set caseType and jurisdiction if they have values (Firestore doesn't accept undefined)
    if (collectedInfo.caseType) {
      snapshotUpdate.caseType = collectedInfo.caseType as CaseType;
    }
    if (collectedInfo.jurisdiction) {
      snapshotUpdate.jurisdiction = collectedInfo.jurisdiction;
    }
    
    await updateContextSnapshot(session.id, snapshotUpdate);

    // Handle case creation if user confirmed
    let caseCreationResult = null;
    if (conversationStage === 'POST_CREATE_COACH') {
      // Extract user context from message history
      const messageHistory = await listMessages(session.id, { limit: 5 });
      const userContext = messageHistory.items
        .filter((msg) => msg.author === 'user')
        .map((msg) => msg.content);
      
      // Create case from conversation state
      const conversationState = mapToConversationState(collectedInfo, userContext);
      
      // Get auth token from request headers
      const authHeader = request.headers.get("authorization");
      const idToken = authHeader?.replace("Bearer ", "") || "";
      
      caseCreationResult = await createCaseFromConversation(
        conversationState,
        user.uid,
        idToken
      );
    }

    // Generate message IDs
    const assistantMessageId = generateMessageId();

    // Check if client supports SSE
    const acceptHeader = request.headers.get("accept") || "";
    const supportsSSE = acceptHeader.includes("text/event-stream");

    if (supportsSSE) {
      // Stream response via SSE
      return await handleSSEResponse(session, message, assistantMessageId, startTime, conversationStage, collectedInfo, caseCreationResult);
    } else {
      // Return JSON response
      return await handleJSONResponse(session, message, assistantMessageId, startTime, conversationStage, collectedInfo, caseCreationResult);
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
  startTime: number,
  conversationStage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>,
  caseCreationResult: { success: boolean; caseId?: string; error?: { code: string; message: string; retryable: boolean } } | null
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

        // Build app state context for AI
        let appStateContext = buildAppStateContext(conversationStage, collectedInfo);
        
        // Add case creation context if applicable
        if (caseCreationResult) {
          if (caseCreationResult.success && caseCreationResult.caseId) {
            appStateContext += `\n[case_creation_success]\ncase_id=${caseCreationResult.caseId}\n`;
          } else if (caseCreationResult.error) {
            appStateContext += `\n[case_creation_error]\nerror_code=${caseCreationResult.error.code}\nerror_message=${caseCreationResult.error.message}\n`;
          }
        }
        
        // Build messages array for OpenAI with conversation history
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: buildSystemPrompt(appStateContext) },
        ];

        // Add conversation history (last 10 messages) - BEFORE storing the new user message
        try {
          const messageHistory = await listMessages(session.id, { limit: 10 });
          // Add messages in chronological order (oldest first)
          const sortedMessages = [...messageHistory.items].reverse();
          for (const msg of sortedMessages) {
            if (msg.author === 'user') {
              messages.push({ role: 'user', content: msg.content });
            } else if (msg.author === 'assistant') {
              messages.push({ role: 'assistant', content: msg.content });
            }
          }
        } catch (error) {
          console.error('Failed to load message history:', error);
        }

        // Add current message
        messages.push({ role: "user", content: userMessage });

        // Store user message AFTER building conversation history
        await appendMessage(session.id, {
          author: "user",
          content: userMessage,
          meta: {
            model: AI_MODEL,
            latencyMs: Date.now() - startTime,
          },
        });

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

        // Send final completion event
        controller.enqueue(
          encoder.encode(`data: [DONE]\n\n`)
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

        try {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`)
          );
        } catch (enqueueError) {
          console.error("Failed to enqueue error event:", enqueueError);
        }

        try {
          controller.close();
        } catch (closeError) {
          console.error("Failed to close controller:", closeError);
        }
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
  startTime: number,
  conversationStage: ConversationStage,
  collectedInfo: Partial<MinimumCaseInfo>,
  caseCreationResult: { success: boolean; caseId?: string; error?: { code: string; message: string; retryable: boolean } } | null
): Promise<NextResponse> {
  try {
    // Build app state context for AI
    let appStateContext = buildAppStateContext(conversationStage, collectedInfo);
    
    // Add case creation context if applicable
    if (caseCreationResult) {
      if (caseCreationResult.success && caseCreationResult.caseId) {
        appStateContext += `\n[case_creation_success]\ncase_id=${caseCreationResult.caseId}\n`;
      } else if (caseCreationResult.error) {
        appStateContext += `\n[case_creation_error]\nerror_code=${caseCreationResult.error.code}\nerror_message=${caseCreationResult.error.message}\n`;
      }
    }
    
    // Build messages array for OpenAI with conversation history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt(appStateContext) },
    ];

    // Add conversation history (last 10 messages) - BEFORE storing the new user message
    try {
      const messageHistory = await listMessages(session.id, { limit: 10 });
      // Add messages in chronological order (oldest first)
      const sortedMessages = [...messageHistory.items].reverse();
      for (const msg of sortedMessages) {
        if (msg.author === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.author === 'assistant') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      }
    } catch (error) {
      console.error('Failed to load message history:', error);
    }

    // Add current message
    messages.push({ role: "user", content: userMessage });

    // Store user message AFTER building conversation history
    await appendMessage(session.id, {
      author: "user",
      content: userMessage,
      meta: {
        model: AI_MODEL,
        latencyMs: Date.now() - startTime,
      },
    });

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
