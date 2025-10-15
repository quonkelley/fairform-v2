/**
 * useUserCases Hook - V2 with Repo Factory
 * 
 * Fetches user's cases using the repository factory pattern.
 * Automatically switches between demo and production repositories.
 */

'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import { isDemoMode } from "@/lib/db/repoFactory";
import type { Case } from "@/lib/validation";
import { useState } from "react";

const emptyCases: Case[] = [];

export function useUserCases(
  userId: string | null | undefined,
): UseQueryResult<Case[], Error> {
  const { user } = useAuth();
  const [demoMode] = useState(() => isDemoMode());

  return useQuery<Case[], Error>({
    queryKey: ["cases", userId, demoMode ? "demo" : "prod"],
    enabled: Boolean(userId) || demoMode,
    placeholderData: emptyCases,
    queryFn: async () => {
      console.log("🔍 useUserCases - mode:", demoMode ? "DEMO" : "PRODUCTION");
      console.log("🔍 useUserCases - userId:", userId);
      
      // Demo mode: Use demo repository
      if (demoMode) {
        console.log("✨ Using demo repository");
        const { demoCasesRepo } = await import("@/lib/demo/demoRepos");
        const cases = await demoCasesRepo.getUserCases('demo-user');
        console.log("✅ Demo cases fetched:", cases.length);
        return cases;
      }

      // Production mode: Use API repository
      if (!userId || !user) {
        console.log("❌ useUserCases - Missing userId or user, returning empty cases");
        return emptyCases;
      }

      try {
        console.log("🔑 Getting Firebase ID token...");
        const idToken = await user.getIdToken();
        
        const response = await fetch("/api/cases", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });

        console.log("📡 API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API request failed:", response.status, errorText);
          throw new Error(`Failed to fetch cases: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Cases fetched successfully:", data.length, "cases");

        // Parse dates from the API response
        return (data as Case[]).map((caseData) => ({
          ...caseData,
          createdAt: new Date(caseData.createdAt),
          updatedAt: new Date(caseData.updatedAt),
        }));
      } catch (error) {
        console.error("❌ Error in useUserCases:", error);
        throw error;
      }
    },
    staleTime: 60_000,
  });
}

