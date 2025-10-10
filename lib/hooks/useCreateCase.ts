'use client';

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

import {
  createCase,
  CasesRepositoryError,
  type CaseRecord,
  type CreateCaseInput,
} from "@/lib/db/casesRepo";

export type CreateCaseFormInput = Omit<CreateCaseInput, "userId">;

export function useCreateCase(
  userId: string | null | undefined,
): UseMutationResult<CaseRecord, Error, CreateCaseFormInput> {
  const queryClient = useQueryClient();

  return useMutation<CaseRecord, Error, CreateCaseFormInput>({
    mutationFn: async (formInput) => {
      if (!userId) {
        throw new CasesRepositoryError("You must be signed in to create cases");
      }

      return createCase({
        ...formInput,
        userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", userId] });
    },
  });
}
