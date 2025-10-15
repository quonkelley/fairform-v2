/**
 * useCaseDetails Hook - V2 with Repo Factory
 * 
 * Fetches case details using the repository factory pattern.
 * Automatically switches between demo and production repositories.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { isDemoMode } from "@/lib/db/repoFactory";
import type { Case } from "@/lib/validation";
import { useState } from "react";

/**
 * Hook to fetch case details
 * @param caseId - The case ID to fetch
 * @returns React Query result with case details
 */
export function useCaseDetails(caseId: string) {
  const { user } = useAuth();
  const [demoMode] = useState(() => isDemoMode());

  return useQuery<Case>({
    queryKey: ["case", caseId, demoMode ? "demo" : "prod"],
    queryFn: async () => {
      console.log("🔍 useCaseDetails - mode:", demoMode ? "DEMO" : "PRODUCTION");
      console.log("🔍 useCaseDetails - caseId:", caseId);

      // Demo mode: Use demo repository
      if (demoMode) {
        console.log("✨ Using demo repository");
        const { demoCasesRepo } = await import("@/lib/demo/demoRepos");
        const caseData = await demoCasesRepo.getCase(caseId);
        
        if (!caseData) {
          throw new Error(`Case not found: ${caseId}`);
        }
        
        console.log("✅ Demo case fetched:", caseData.title);
        return caseData;
      }

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
    enabled: !!caseId && (demoMode || !!user), // Enable if demo mode OR user is present
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

