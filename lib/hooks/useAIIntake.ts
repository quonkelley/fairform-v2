import { useMutation } from "@tanstack/react-query";

import type { IntakeClassification, IntakeRequest } from "@/lib/ai/schemas";

interface AIIntakeResponse {
  data: IntakeClassification;
  moderation: {
    verdict: "pass" | "review" | "block";
    flaggedCategories: string[];
  };
  requiresReview: boolean;
}

interface AIIntakeError {
  error: string;
  message: string;
  details?: unknown;
}

export class AIIntakeException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AIIntakeException";
  }
}

export function useAIIntake() {
  return useMutation<AIIntakeResponse, AIIntakeException, IntakeRequest>({
    mutationFn: async (input: IntakeRequest) => {
      const response = await fetch("/api/ai/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error: AIIntakeError = await response.json();
        throw new AIIntakeException(error.error, error.message, error.details);
      }

      return response.json();
    },
  });
}
