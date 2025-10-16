/**
 * useUserCases Hook - V2
 *
 * Fetches user's cases via API.
 */

'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import type { Case } from "@/lib/validation";

const emptyCases: Case[] = [];

export function useUserCases(
  userId: string | null | undefined,
): UseQueryResult<Case[], Error> {
  const { user } = useAuth();

  return useQuery<Case[], Error>({
    queryKey: ["cases", userId],
    enabled: Boolean(userId),
    placeholderData: emptyCases,
    queryFn: async () => {
      console.log("🔍 useUserCases - userId:", userId);

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

