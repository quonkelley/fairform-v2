import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
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
            This MVP lays the groundwork for authentication, the case dashboard,
            and the procedural journey map. As we build, we will align every
            screen with the compassionate design system documented in the FairForm
            PRD and specification.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/dashboard">View Planned Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/docs">Review Product Docs</Link>
            </Button>
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
