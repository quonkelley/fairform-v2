/**
 * useCaseDetails Hook - V2
 *
 * Fetches case details via API.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import type { Case } from "@/lib/validation";

/**
 * Hook to fetch case details
 * @param caseId - The case ID to fetch
 * @returns React Query result with case details
 */
export function useCaseDetails(caseId: string) {
  const { user } = useAuth();

  return useQuery<Case>({
    queryKey: ["case", caseId],
    queryFn: async () => {
      console.log("🔍 useCaseDetails - caseId:", caseId);

      // Production mode: Use API
      if (!user) {
        throw new Error("You must be signed in to view case details");
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/cases/${caseId}`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch case details: ${response.statusText}`
        );
      }

      return response.json();
    },
    enabled: !!caseId && !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

