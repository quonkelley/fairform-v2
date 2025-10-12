import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";

import type { CaseStep } from "@/lib/validation";

export function useCaseSteps(caseId: string): UseQueryResult<CaseStep[], Error> {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["caseSteps", caseId],
    queryFn: async () => {
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
      return data.map((step: any) => ({
        ...step,
        dueDate: step.dueDate ? new Date(step.dueDate) : null,
        completedAt: step.completedAt ? new Date(step.completedAt) : null,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!caseId && !!user, // Only fetch if caseId and user are provided
  });
}
