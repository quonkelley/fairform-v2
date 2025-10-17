'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth-context";
import type { CompletedFormRecord } from "@/lib/db/types";

const emptyForms: CompletedFormRecord[] = [];

export function useCompletedForms(
  caseId: string | null | undefined
): UseQueryResult<CompletedFormRecord[], Error> {
  const { user } = useAuth();

  return useQuery<CompletedFormRecord[], Error>({
    queryKey: ["completedForms", caseId],
    enabled: Boolean(caseId && user),
    placeholderData: emptyForms,
    queryFn: async () => {
      if (!caseId || !user) {
        return emptyForms;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/cases/${caseId}/forms`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to load completed forms: ${response.statusText}`
        );
      }

      const data = (await response.json()) as CompletedFormRecord[];

      return data.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    },
    staleTime: 60_000,
  });
}
