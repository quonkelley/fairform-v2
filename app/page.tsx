"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/feedback/spinner";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Phase 1 · Legal GPS
          </span>
          <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
            FairForm empowers self-represented litigants to navigate the civil
            courts with clarity.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Track your case journey, understand court procedures, and navigate
            the legal system with confidence. FairForm provides step-by-step
            guidance tailored to your specific case type and jurisdiction.
          </p>
          <div className="flex flex-wrap gap-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner label="" />
              </div>
            ) : user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s next</CardTitle>
              <CardDescription>
                Sprint 1 focus areas from the backlog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Bootstrap Firebase Auth and protected routes.</p>
              <p>• Deliver the case dashboard with inline case creation.</p>
              <p>• Wire shared layout, nav, and accessible UI primitives.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design guardrails</CardTitle>
              <CardDescription>
                Key tokens from the Design Specification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Justice Blue <span className="font-mono text-primary">#004E7C</span>{" "}
                anchors CTAs and navigation.
              </p>
              <p>
                • Soft Neutral backgrounds ensure readability and trust.
              </p>
              <p>• Focus states use accent yellow for WCAG AA compliance.</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>FairForm MVP · Sprint 1 Foundation</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/disclaimer" className="hover:text-primary">
              Educational use only
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacy commitments
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
