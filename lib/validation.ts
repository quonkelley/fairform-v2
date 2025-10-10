import { z } from "zod";

// User schemas
export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().nullable(),
  createdAt: z.date(),
  role: z.literal("user"),
});

export type User = z.infer<typeof UserSchema>;

// Case schemas
export const CaseStatusSchema = z.enum(["active", "closed", "archived"]);

export const CreateCaseSchema = z.object({
  caseType: z.string().min(1),
  jurisdiction: z.string().min(1),
  title: z.string().optional(),
  notes: z.string().optional(),
});

export const CaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  caseType: z.string(),
  jurisdiction: z.string(),
  status: CaseStatusSchema,
  progressPct: z.number().min(0).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export type Case = z.infer<typeof CaseSchema>;
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;
export type CaseStatus = z.infer<typeof CaseStatusSchema>;

// Case Step schemas
export const CreateCaseStepSchema = z.object({
  caseId: z.string(),
  name: z.string().min(1),
  order: z.number().int().min(0),
  dueDate: z.date().nullable().optional(),
});

export const CaseStepSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  name: z.string(),
  order: z.number(),
  dueDate: z.date().nullable(),
  isComplete: z.boolean(),
  completedAt: z.date().nullable(),
});

export const UpdateStepCompletionSchema = z.object({
  isComplete: z.boolean(),
});

export type CaseStep = z.infer<typeof CaseStepSchema>;
export type CreateCaseStepInput = z.infer<typeof CreateCaseStepSchema>;
export type UpdateStepCompletionInput = z.infer<typeof UpdateStepCompletionSchema>;

// Glossary schemas
export const GlossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
  jurisdiction: z.string().nullable(),
  lastReviewed: z.date(),
});

export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

// Reminder schemas
export const ReminderChannelSchema = z.enum(["email", "sms"]);

export const CreateReminderSchema = z.object({
  caseId: z.string(),
  dueDate: z.string().datetime(),
  channel: ReminderChannelSchema,
  message: z.string().optional(),
});

export const ReminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  caseId: z.string(),
  dueDate: z.date(),
  channel: ReminderChannelSchema,
  message: z.string(),
  sent: z.boolean(),
  createdAt: z.date(),
});

export type Reminder = z.infer<typeof ReminderSchema>;
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
export type ReminderChannel = z.infer<typeof ReminderChannelSchema>;

// API Response schemas
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
});

export const CreateCaseResponseSchema = z.object({
  caseId: z.string(),
});

export const CreateReminderResponseSchema = z.object({
  reminderId: z.string(),
});

export const HealthResponseSchema = z.object({
  ok: z.boolean(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type CreateCaseResponse = z.infer<typeof CreateCaseResponseSchema>;
export type CreateReminderResponse = z.infer<typeof CreateReminderResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
