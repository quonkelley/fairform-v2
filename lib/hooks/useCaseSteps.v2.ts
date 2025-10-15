/**
 * useCaseSteps Hook - V2 with Repo Factory
 * 
 * Fetches case steps using the repository factory pattern.
 * Automatically switches between demo and production repositories.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { isDemoMode } from "@/lib/db/repoFactory";
import type { CaseStep } from "@/lib/validation";
import { useState } from "react";

export function useCaseSteps(caseId: string): UseQueryResult<CaseStep[], Error> {
  const { user } = useAuth();
  const [demoMode] = useState(() => isDemoMode());

  return useQuery({
    queryKey: ["caseSteps", caseId, demoMode ? "demo" : "prod"],
    queryFn: async () => {
      console.log("🔍 useCaseSteps - mode:", demoMode ? "DEMO" : "PRODUCTION");
      console.log("🔍 useCaseSteps - caseId:", caseId);

      // Demo mode: Use demo repository
      if (demoMode) {
        console.log("✨ Using demo repository");
        const { demoStepsRepo } = await import("@/lib/demo/demoRepos");
        const steps = await demoStepsRepo.getCaseSteps(caseId);
        console.log("✅ Demo steps fetched:", steps.length);
        return steps;
      }

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
    enabled: !!caseId && (demoMode || !!user), // Enable if demo mode OR user is present
  });
}

