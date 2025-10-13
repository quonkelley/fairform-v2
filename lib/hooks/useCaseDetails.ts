import { useQuery } from "@tanstack/react-query";
import type { Case } from "@/lib/validation";

/**
 * Hook to fetch case details
 * @param caseId - The case ID to fetch
 * @returns React Query result with case details
 */
export function useCaseDetails(caseId: string) {
  return useQuery<Case>({
    queryKey: ["case", caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch case details");
      }
      return response.json();
    },
    enabled: !!caseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
