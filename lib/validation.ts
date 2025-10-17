import { z } from "zod";

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  createdAt: z.date(),
  role: z.literal("user"),
  // Optional AI preferences
  aiParticipation: z.boolean().optional(),
  timeZone: z.string().optional(),
  tone: z.enum(["formal", "friendly", "helpful"]).optional(),
  complexity: z.enum(["simple", "detailed"]).optional(),
});

export type User = z.infer<typeof UserSchema>;

// Case schemas
export const CaseStatusSchema = z.enum(["active", "closed", "archived"]);

export const CaseTypeSchema = z.enum([
  "small_claims",
  "employment",
  "housing",
  "consumer",
  "contract",
  "discrimination",
  "eviction",
  "family_law",
  "other_civil",
  "other",
]);

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
  progressPct: z.number().min(0).max(100).optional(),
  totalSteps: z.number().int().min(0).optional(),
  completedSteps: z.number().int().min(0).optional(),
  currentStep: z.number().int().min(0).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().optional(),
  notes: z.string().nullable().optional(),
  // Additional properties for case data
  caseNumber: z.string().optional(),
  nextHearingDate: z.date().optional(),
  defendant: z.string().optional(),
  plaintiff: z.string().optional(),
  court: z.string().optional(),
  filingDate: z.date().optional(),
  propertyAddress: z.string().optional(),
});

export type Case = z.infer<typeof CaseSchema>;
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;
export type CaseStatus = z.infer<typeof CaseStatusSchema>;
export type CaseType = z.infer<typeof CaseTypeSchema>;

// Case Step schemas
export const StepTypeSchema = z.enum([
  "form",
  "document",
  "review",
  "submit",
  "wait",
  "meeting",
  "communication",
]);

export const CreateCaseStepSchema = z.object({
  caseId: z.string(),
  name: z.string().min(1),
  order: z.number().int().min(0),
  dueDate: z.date().nullable().optional(),
  description: z.string().optional(),
  stepType: StepTypeSchema.optional(),
  instructions: z.array(z.string()).optional(),
  estimatedTime: z.number().optional(),
  disclaimer: z.string().optional(),
});

export const CaseStepSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  name: z.string(),
  order: z.number(),
  dueDate: z.date().nullable(),
  isComplete: z.boolean(),
  completedAt: z.date().nullable(),
  // Journey template fields
  description: z.string().optional(),
  stepType: StepTypeSchema.optional(),
  instructions: z.array(z.string()).optional(),
  estimatedTime: z.number().optional(),
  disclaimer: z.string().optional(),
});

export const UpdateStepCompletionSchema = z.object({
  isComplete: z.boolean(),
});

export type StepType = z.infer<typeof StepTypeSchema>;
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
  demo: z.boolean(),
  timestamp: z.string().datetime(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type CreateCaseResponse = z.infer<typeof CreateCaseResponseSchema>;
export type CreateReminderResponse = z.infer<typeof CreateReminderResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
