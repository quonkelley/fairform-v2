"use client";

import { useState } from "react";

import Link from "next/link";
import { LogOut } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function DashboardPlaceholder() {
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

  return (
    <ProtectedRoute>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Dashboard preview
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ""}!
            </h1>
            <p className="text-base text-muted-foreground">
              Sprint 1 will deliver authenticated access, case creation, and a
              visual journey map. This placeholder confirms routing, guardrails,
              and design tokens are in place after authentication.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full gap-2 sm:w-auto"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </header>

        <section className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            What&apos;s coming in Sprint 1
          </p>
          <ul className="mt-3 space-y-2">
            <li>• Case listing with inline creation modal.</li>
            <li>• Progress indicators that sync with the Case Journey Map.</li>
            <li>• Glossary access and upcoming hearing reminders.</li>
          </ul>
          <p className="mt-4">
            Until those features ship, explore the{" "}
            <Link href="/docs" className="font-medium text-primary underline">
              product documentation
            </Link>{" "}
            or return to the home screen.
          </p>
        </section>
      </div>
    </ProtectedRoute>
  );
}
