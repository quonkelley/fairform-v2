'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import type { CaseRecord, CreateCaseInput } from "@/lib/db/types";
import { useAuth } from "@/components/auth/auth-context";

export type CreateCaseFormInput = Omit<CreateCaseInput, "userId">;

export function useCreateCase(
  userId: string | null | undefined,
  onSuccess?: (caseRecord: CaseRecord) => void
): UseMutationResult<CaseRecord, Error, CreateCaseFormInput> {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<CaseRecord, Error, CreateCaseFormInput>({
    mutationFn: async (formInput) => {
      console.log("[useCreateCase] Starting mutation with input:", formInput);

      if (!userId || !user) {
        throw new Error("You must be signed in to create cases");
      }

      // Get the Firebase ID token
      console.log("[useCreateCase] Getting ID token...");
      const idToken = await user.getIdToken();
      console.log("[useCreateCase] ID token obtained");

      console.log("[useCreateCase] Making POST request to /api/cases");
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(formInput),
      });

      console.log("[useCreateCase] Response received:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[useCreateCase] Error response:", errorData);
        throw new Error(
          errorData.message || `Failed to create case: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[useCreateCase] Success response data:", data);

      // The API returns { caseId }, but we need to return the full case
      // For now, we'll refetch or return a minimal case object
      // The query invalidation will trigger a refetch anyway
      return {
        id: data.caseId,
        userId,
        ...formInput,
        status: "active",
        progressPct: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CaseRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cases", userId] });
      onSuccess?.(data);
    },
  });
}
