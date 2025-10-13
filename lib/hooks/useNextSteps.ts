import { useQuery } from "@tanstack/react-query";
import { generateNextSteps, type NextStep } from "@/lib/nextSteps/generate";
import type { CaseType } from "@/lib/validation";

/**
 * Hook to fetch next steps for a case
 * @param caseType - The type of case
 * @param currentStep - The current step order (1-indexed)
 * @returns React Query result with next steps
 */
export function useNextSteps(caseType: CaseType | undefined, currentStep: number | undefined) {
  return useQuery<NextStep[]>({
    queryKey: ["nextSteps", caseType, currentStep],
    queryFn: () => {
      if (!caseType || !currentStep) {
        return [];
      }
      return generateNextSteps(caseType, currentStep);
    },
    enabled: !!caseType && !!currentStep && currentStep > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes - next steps don't change frequently
  });
}
