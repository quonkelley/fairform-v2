"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { useAICopilotContext } from "@/components/ai-copilot/AICopilotProvider";

export default function DashboardPage() {
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const searchParams = useSearchParams();
  const { openChat } = useAICopilotContext();

  // Check for openCopilot query parameter
  useEffect(() => {
    const shouldOpenCopilot = searchParams.get('openCopilot') === 'true';
    if (shouldOpenCopilot) {
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        openChat();
      }, 100);
    }
  }, [searchParams, openChat]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOutUser();
    } finally {
      setSigningOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardContent
        userId={user.uid}
        userName={user.displayName ?? undefined}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    </ProtectedRoute>
  );
}
