"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const { user, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

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
