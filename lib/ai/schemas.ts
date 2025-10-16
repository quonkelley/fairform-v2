import { z } from "zod";

export const IntakeRequestSchema = z.object({
  text: z
    .string({ message: "Description is required" })
    .min(20, "Tell us a bit more about your issue so we can help"),
  userTimezone: z.string().optional(),
});

export const IntakeClassificationSchema = z.object({
  summary: z
    .string()
    .min(10)
    .max(500),
  primaryIssue: z
    .string()
    .min(3)
    .max(120),
  caseType: z
    .string()
    .min(3)
    .max(120),
  jurisdiction: z.object({
    state: z.string().min(2).max(50).optional(),
    county: z.string().min(2).max(70).optional(),
    courtLevel: z.string().min(2).max(70).optional(),
  }),
  confidence: z.number().min(0).max(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendedNextSteps: z.array(z.string().min(3)).min(1).max(5),
  disclaimers: z.array(z.string().min(5)).min(1).max(3),
});

export type IntakeRequest = z.infer<typeof IntakeRequestSchema>;
export type IntakeClassification = z.infer<typeof IntakeClassificationSchema>;

// Chat API schemas for Story 13.2
export const ChatRequestSchema = z.object({
  message: z
    .string({ message: "Message is required" })
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long (max 2000 characters)"),
  sessionId: z.string().optional(),
  caseId: z.string().optional(),
});

export const ChatResponseSchema = z.object({
  sessionId: z.string(),
  messageId: z.string(),
  reply: z.string(),
  meta: z.object({
    tokensIn: z.number(),
    tokensOut: z.number(),
    latencyMs: z.number(),
    model: z.string(),
  }),
});

// SSE event schemas
export const SSEMetaEventSchema = z.object({
  sessionId: z.string(),
  messageId: z.string(),
  model: z.string(),
  startedAt: z.number(),
});

export const SSEDeltaEventSchema = z.object({
  chunk: z.string(),
});

export const SSEDoneEventSchema = z.object({
  tokensIn: z.number(),
  tokensOut: z.number(),
  latencyMs: z.number(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type SSEMetaEvent = z.infer<typeof SSEMetaEventSchema>;
export type SSEDeltaEvent = z.infer<typeof SSEDeltaEventSchema>;
export type SSEDoneEvent = z.infer<typeof SSEDoneEventSchema>;
