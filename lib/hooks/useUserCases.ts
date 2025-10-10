'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { listByUser, type CaseRecord } from "@/lib/db/casesRepo";

const emptyCases: CaseRecord[] = [];

export function useUserCases(
  userId: string | null | undefined,
): UseQueryResult<CaseRecord[], Error> {
  return useQuery<CaseRecord[], Error>({
    queryKey: ["cases", userId],
    enabled: Boolean(userId),
    placeholderData: emptyCases,
    queryFn: () => {
      if (!userId) {
        return Promise.resolve(emptyCases);
      }
      return listByUser(userId);
    },
    staleTime: 60_000,
  });
}
