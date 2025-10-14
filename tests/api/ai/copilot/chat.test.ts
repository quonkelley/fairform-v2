import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const {
  mockChatCompletionCreate,
  mockModerateInput,
  mockRequireAuth,
  mockCreateSession,
  mockAppendMessage,
  mockGetSession,
  mockUpdateSessionCase,
} = vi.hoisted(() => ({
  mockChatCompletionCreate: vi.fn(),
  mockModerateInput: vi.fn(),
  mockRequireAuth: vi.fn(),
  mockCreateSession: vi.fn(),
  mockAppendMessage: vi.fn(),
  mockGetSession: vi.fn(),
  mockUpdateSessionCase: vi.fn(),
}));

// Mock dependencies before importing the route
vi.mock("@/lib/ai/moderate", () => ({
  moderateInput: mockModerateInput,
}));

vi.mock("@/lib/auth/server-auth", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/db/aiSessionsRepo", () => ({
  createSession: mockCreateSession,
  appendMessage: mockAppendMessage,
  getSession: mockGetSession,
  updateSessionCase: mockUpdateSessionCase,
}));

vi.mock("openai", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: mockChatCompletionCreate,
      },
    },
  })),
}));

let POST: typeof import("@/app/api/ai/copilot/chat/route").POST;

const ENV_DEFAULTS = {
  OPENAI_API_KEY: "test-api-key",
  AI_MODEL: "gpt-4o-mini",
  AI_TEMPERATURE: "0.2",
  AI_MAX_TOKENS: "1000",
  DEMO_TOKEN: "demo-secret-token",
} as const;

type EnvOverrides = Partial<Record<keyof typeof ENV_DEFAULTS, string | null>>;

const mockUser = {
  uid: "test-user-123",
  email: "test@example.com",
  emailVerified: true,
};

const mockSession = {
  id: "session-123",
  userId: mockUser.uid,
  caseId: null,
  title: "New Conversation",
  status: "active" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastMessageAt: Date.now(),
  contextSnapshot: { hash: "", userPrefs: {} },
  demo: false,
};

const mockOpenAIResponse = {
  id: "chatcmpl-test-123",
  created: Date.now(),
  model: "gpt-4o-mini",
  object: "chat.completion" as const,
  choices: [
    {
      index: 0,
      message: {
        role: "assistant" as const,
        content: "Hello! I'm your FairForm Copilot. How can I help you today?",
      },
      finish_reason: "stop" as const,
      logprobs: null,
    },
  ],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 20,
    total_tokens: 70,
  },
};

async function setupPost(overrides?: EnvOverrides) {
  vi.resetModules();

  (Object.keys(ENV_DEFAULTS) as Array<keyof typeof ENV_DEFAULTS>).forEach((key) => {
    const override = overrides?.[key];
    if (override === null) {
      delete process.env[key];
    } else {
      process.env[key] = override ?? ENV_DEFAULTS[key];
    }
  });

  const module = await import("@/app/api/ai/copilot/chat/route");

  vi.clearAllMocks();
  mockChatCompletionCreate.mockReset();
  mockChatCompletionCreate.mockResolvedValue(mockOpenAIResponse as any);

  mockModerateInput.mockResolvedValue({
    verdict: "pass",
    flaggedCategories: [],
    categoryScores: {},
  });

  mockRequireAuth.mockResolvedValue(mockUser);
  mockCreateSession.mockResolvedValue(mockSession);
  mockAppendMessage.mockResolvedValue({
    id: "msg-123",
    sessionId: mockSession.id,
    author: "user",
    content: "Hello",
    meta: {},
    createdAt: Date.now(),
  });
  mockUpdateSessionCase.mockResolvedValue(undefined);

  return module.POST;
}
import {
  createSession,
  appendMessage,
  getSession,
  updateSessionCase,
} from "@/lib/db/aiSessionsRepo";

describe("POST /api/ai/copilot/chat", () => {
  beforeEach(async () => {
    POST = await setupPost();
  });

  describe("Request validation", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: "invalid json",
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      console.log("Response status:", response.status);
      console.log("Response data:", data);

      expect(response.status).toBe(400);
      expect(data.error).toBe("InvalidJSON");
    });

    it("should return 400 for missing message", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ValidationError");
      expect(data.details.fieldErrors.message).toBeDefined();
    });

    it("should return 400 for message too long", async () => {
      const longMessage = "a".repeat(2001);
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: longMessage }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ValidationError");
    });

    it("should accept valid request with optional fields", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Hello",
          sessionId: "existing-session",
          caseId: "case-123",
          demo: false,
        }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      mockGetSession.mockResolvedValue(mockSession);

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Authentication", () => {
    it("should return 401 for missing authentication", async () => {
      mockRequireAuth.mockRejectedValue(new Error("UNAUTHORIZED"));

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should accept demo mode with valid token", async () => {
      mockRequireAuth.mockRejectedValue(new Error("UNAUTHORIZED"));

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello", demo: true }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer demo-secret-token",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Content moderation", () => {
    it("should block inappropriate content", async () => {
      mockModerateInput.mockResolvedValue({
        verdict: "block",
        flaggedCategories: ["hate"],
        categoryScores: { hate: 0.9 },
      });

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "inappropriate content" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("ContentBlocked");
      expect(data.moderation.verdict).toBe("block");
    });

    it("should handle moderation failure gracefully", async () => {
      mockModerateInput.mockRejectedValue(new Error("Moderation API error"));

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe("ModerationFailure");
    });
  });

  describe("Session management", () => {
    it("should create new session when sessionId not provided", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);

      expect(createSession).toHaveBeenCalledWith({
        userId: mockUser.uid,
        caseId: undefined,
        demo: false,
        title: "New Conversation",
      });
      expect(response.status).toBe(200);
    });

    it("should use existing session when sessionId provided", async () => {
      mockGetSession.mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello", sessionId: "existing-session" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);

      expect(getSession).toHaveBeenCalledWith("existing-session");
      expect(updateSessionCase).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it("should update session case when new caseId supplied", async () => {
      mockGetSession.mockResolvedValue({ ...mockSession, caseId: null });

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello", sessionId: "existing-session", caseId: "case-abc" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);

      expect(updateSessionCase).toHaveBeenCalledWith(mockSession.id, "case-abc");
      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent session", async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello", sessionId: "non-existent" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("SessionNotFound");
    });
  });

  describe("JSON fallback response", () => {
    it("should return JSON response when SSE not supported", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
          "accept": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe(mockSession.id);
      expect(data.messageId).toMatch(/^msg_\d+_/);
      expect(data.reply).toBe("Hello! I'm your FairForm Copilot. How can I help you today?");
      expect(data.meta).toEqual(
        expect.objectContaining({
          tokensIn: 50,
          tokensOut: 20,
          latencyMs: expect.any(Number),
          model: "gpt-4o-mini",
          blocked: false,
        }),
      );
    });

    it("should store both user and assistant messages", async () => {
      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
          "accept": "application/json",
        },
      });

      await POST(request);

      expect(appendMessage).toHaveBeenCalledTimes(2);
      
      // First call should be user message
      expect(appendMessage).toHaveBeenNthCalledWith(1, mockSession.id, {
        author: "user",
        content: "Hello",
        meta: {
          model: "gpt-4o-mini",
          latencyMs: expect.any(Number),
        },
      });

      // Second call should be assistant message
      expect(appendMessage).toHaveBeenNthCalledWith(2, mockSession.id, {
        author: "assistant",
        content: "Hello! I'm your FairForm Copilot. How can I help you today?",
        meta: expect.objectContaining({
          tokensIn: 50,
          tokensOut: 20,
          latencyMs: expect.any(Number),
          model: "gpt-4o-mini",
          blocked: false,
        }),
      });
    });
  });

  describe("SSE streaming response", () => {
    it("should return SSE response when supported", async () => {
      const mockStreamResponse = {
        [Symbol.asyncIterator]: async function* () {
          yield {
            choices: [{ delta: { content: "Hello! " } }],
            usage: { prompt_tokens: 50 },
          };
          yield {
            choices: [{ delta: { content: "I'm your FairForm Copilot." } }],
            usage: { prompt_tokens: 50, completion_tokens: 20 },
          };
        },
      };

      mockChatCompletionCreate.mockResolvedValue(mockStreamResponse as any);

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
          "accept": "text/event-stream",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/event-stream");
      expect(response.headers.get("cache-control")).toBe("no-cache");
      expect(response.headers.get("connection")).toBe("keep-alive");
    });

    it("should emit moderation block event and store fallback when output flagged", async () => {
      const mockStreamResponse = {
        [Symbol.asyncIterator]: async function* () {
          yield {
            choices: [{ delta: { content: "Unsafe content" } }],
            usage: { prompt_tokens: 25, completion_tokens: 10 },
          };
        },
      };

      mockChatCompletionCreate.mockResolvedValue(mockStreamResponse as any);

      mockModerateInput
        .mockResolvedValueOnce({ verdict: "pass", flaggedCategories: [], categoryScores: {} })
        .mockResolvedValueOnce({ verdict: "block", flaggedCategories: ["violence"], categoryScores: {} });

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
          "accept": "text/event-stream",
        },
      });

      const response = await POST(request);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let payload = "";

      if (reader) {
        let done = false;
        while (!done) {
          const result = await reader.read();
          if (result.value) {
            payload += decoder.decode(result.value, { stream: !result.done });
          }
          done = result.done;
        }
      }

      expect(payload).toContain("event: moderation_blocked");
      expect(payload).toContain("violence");
      expect(payload).toContain("event: done");
      expect(payload).toContain('"blocked":true');

      expect(appendMessage).toHaveBeenNthCalledWith(2, mockSession.id, {
        author: "assistant",
        content: expect.stringContaining("I apologize, but I cannot provide a response"),
        meta: expect.objectContaining({
          blocked: true,
          moderation: { flaggedCategories: ["violence"] },
        }),
      });
    });
  });

  describe("OpenAI error handling", () => {
    it("should handle rate limit errors", async () => {
      const rateLimitError = new Error("Rate limit exceeded");
      (rateLimitError as any).status = 429;

      mockChatCompletionCreate.mockRejectedValue(rateLimitError);

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("AIServiceError");
      expect(data.retryable).toBe(false);
    });

    it("should handle OpenAI service errors with retry", async () => {
      const serviceError = new Error("Internal server error");
      (serviceError as any).status = 500;

      mockChatCompletionCreate
        .mockRejectedValueOnce(serviceError)
        .mockRejectedValueOnce(serviceError)
        .mockRejectedValueOnce(serviceError);

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toBe("AIServiceError");
      expect(data.retryable).toBe(true);
    });

    it("should handle missing OpenAI API key", async () => {
      const postWithoutKey = await setupPost({ OPENAI_API_KEY: null });

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
        },
      });

      const response = await postWithoutKey(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("ConfigurationError");
    });
  });

  describe("Post-call moderation", () => {
    it("should replace blocked assistant output with safe message", async () => {
      mockModerateInput
        .mockResolvedValueOnce({ verdict: "pass", flaggedCategories: [], categoryScores: {} }) // User input passes
        .mockResolvedValueOnce({ verdict: "block", flaggedCategories: ["hate"], categoryScores: {} }); // Assistant output blocked

      const request = new NextRequest("http://localhost:3000/api/ai/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Hello" }),
        headers: {
          "content-type": "application/json",
          "authorization": "Bearer test-token",
          "accept": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reply).toContain("I apologize, but I cannot provide a response");
      expect(data.meta.blocked).toBe(true);
      
      // Should store the safe message with blocked flag
      expect(appendMessage).toHaveBeenNthCalledWith(2, mockSession.id, {
        author: "assistant",
        content: expect.stringContaining("I apologize, but I cannot provide a response"),
        meta: expect.objectContaining({
          tokensIn: 50,
          tokensOut: 20,
          latencyMs: expect.any(Number),
          model: "gpt-4o-mini",
          blocked: true,
          moderation: { flaggedCategories: ["hate"] },
        }),
      });
    });
  });
});
