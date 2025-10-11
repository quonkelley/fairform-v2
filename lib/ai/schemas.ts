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
