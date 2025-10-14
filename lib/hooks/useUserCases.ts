'use client';

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-context";
import type { CaseRecord } from "@/lib/db/types";

const emptyCases: CaseRecord[] = [];

export function useUserCases(
  userId: string | null | undefined,
): UseQueryResult<CaseRecord[], Error> {
  const { user } = useAuth();

  return useQuery<CaseRecord[], Error>({
    queryKey: ["cases", userId],
    enabled: Boolean(userId),
    placeholderData: emptyCases,
    queryFn: async () => {
      console.log("🔍 useUserCases - userId:", userId);
      console.log("🔍 useUserCases - user:", user ? "Present" : "Missing");
      
      if (!userId || !user) {
        console.log("❌ useUserCases - Missing userId or user, returning empty cases");
        return emptyCases;
      }

      try {
        console.log("🔑 Getting Firebase ID token...");
        const idToken = await user.getIdToken();
        console.log("✅ ID token received, length:", idToken.length);
        
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
        return (data as CaseRecord[]).map((caseData) => ({
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
