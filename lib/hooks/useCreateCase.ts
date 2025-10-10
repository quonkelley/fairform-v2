'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import type { CaseRecord, CreateCaseInput } from "@/lib/db/casesRepo";

export type CreateCaseFormInput = Omit<CreateCaseInput, "userId">;

export function useCreateCase(
  userId: string | null | undefined,
): UseMutationResult<CaseRecord, Error, CreateCaseFormInput> {
  const queryClient = useQueryClient();

  return useMutation<CaseRecord, Error, CreateCaseFormInput>({
    mutationFn: async (formInput) => {
      if (!userId) {
        throw new Error("You must be signed in to create cases");
      }

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formInput),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create case: ${response.statusText}`
        );
      }

      const data = await response.json();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", userId] });
    },
  });
}
