'use client';

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "./auth-context";
import { Spinner } from "../feedback/spinner";

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only redirect once when loading is complete and there's no user
    if (!loading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your workspace" />
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  // The redirect will happen via the useEffect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

