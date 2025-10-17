import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";

import type { CaseStep } from "@/lib/validation";

export interface CompleteStepVariables {
  stepId: string;
  caseId: string;
}

interface CompleteStepResponse {
  success: boolean;
  step: CaseStep;
}

export function useCompleteStep() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<CompleteStepResponse, Error, CompleteStepVariables, { previousSteps?: CaseStep[] }>({
    mutationFn: async ({ stepId }: CompleteStepVariables) => {
      if (!user) {
        throw new Error("You must be signed in to complete steps");
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/steps/${stepId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isComplete: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to complete step");
      }

      const data = await response.json();
      return data as CompleteStepResponse;
    },

    // Optimistic update
    onMutate: async ({ stepId, caseId }: CompleteStepVariables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["caseSteps", caseId] });

      // Snapshot the previous value for rollback
      const previousSteps = queryClient.getQueryData<CaseStep[]>(["caseSteps", caseId]);

      // Optimistically update the cache
      queryClient.setQueryData<CaseStep[]>(["caseSteps", caseId], (old) => {
        return old?.map((step) =>
          step.id === stepId
            ? { ...step, isComplete: true, completedAt: new Date() }
            : step
        );
      });

      // Return context with snapshot for rollback
      return { previousSteps };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousSteps) {
        queryClient.setQueryData(
          ["caseSteps", variables.caseId],
          context.previousSteps
        );
      }
      console.error("Failed to complete step:", err);
    },

    // Refetch on success to ensure data consistency
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["caseSteps", variables.caseId] });
      // Invalidate case details to update progress
      queryClient.invalidateQueries({ queryKey: ["case", variables.caseId] });
      // Invalidate cases query to update dashboard progress
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}
