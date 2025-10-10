'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Loading your workspace" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Redirecting to login…" />
      </div>
    );
  }

  return <>{children}</>;
}

