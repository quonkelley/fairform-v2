import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { CaseStep } from "@/lib/validation";

export function useCaseSteps(caseId: string): UseQueryResult<CaseStep[], Error> {
  return useQuery({
    queryKey: ["caseSteps", caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/steps`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch steps: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data as CaseStep[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!caseId, // Only fetch if caseId is provided
  });
}
