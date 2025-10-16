/**
 * useCaseSteps Hook - V2
 *
 * Fetches case steps via API.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import type { CaseStep } from "@/lib/validation";

export function useCaseSteps(caseId: string): UseQueryResult<CaseStep[], Error> {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["caseSteps", caseId],
    queryFn: async () => {
      console.log("🔍 useCaseSteps - caseId:", caseId);

      // Production mode: Use API
      if (!user) {
        throw new Error("You must be signed in to view case steps");
      }

      const idToken = await user.getIdToken();
      const response = await fetch(`/api/cases/${caseId}/steps`, {
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch steps: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Parse dates from the API response
      return (data as CaseStep[]).map((step) => ({
        ...step,
        dueDate: step.dueDate ? new Date(step.dueDate) : null,
        completedAt: step.completedAt ? new Date(step.completedAt) : null,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!caseId && !!user,
  });
}

