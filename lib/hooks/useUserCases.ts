'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import type { CaseRecord } from "@/lib/db/types";

const emptyCases: CaseRecord[] = [];

export function useUserCases(
  userId: string | null | undefined,
): UseQueryResult<CaseRecord[], Error> {
  const { user } = useAuth();

  return useQuery<CaseRecord[], Error>({
    queryKey: ["cases", userId],
    enabled: Boolean(userId),
    placeholderData: emptyCases,
    queryFn: async () => {
      if (!userId || !user) {
        return emptyCases;
      }

      const idToken = await user.getIdToken();
      const response = await fetch("/api/cases", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const data = await response.json();

      // Parse dates from the API response
      return data.map((caseData: any) => ({
        ...caseData,
        createdAt: new Date(caseData.createdAt),
        updatedAt: new Date(caseData.updatedAt),
      }));
    },
    staleTime: 60_000,
  });
}
