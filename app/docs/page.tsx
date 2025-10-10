"use client";

import { useAuth } from "@/components/auth/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <DocsContent />
    </ProtectedRoute>
  );
}

function DocsContent() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Internal Documentation
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          FairForm Knowledge Base
        </h1>
        <p className="text-base text-muted-foreground">
          Product requirements, design specifications, and development guides
          for the FairForm MVP.
        </p>
      </header>

      <Alert variant="default" title="Access Restricted">
        <p className="mb-3">
          This documentation is for internal development use only. Product
          documentation is stored in the <code className="font-mono text-xs">/docs</code> directory
          and is accessible only to authenticated team members.
        </p>
        <p className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium">{user?.email}</span>
        </p>
      </Alert>

      <section className="space-y-3">
        <article className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-lg font-semibold text-primary">
            Development Documentation
          </p>
          <p className="text-sm text-muted-foreground">
            PRD files and technical specifications are available in your local{" "}
            <code className="font-mono text-xs">/docs</code> directory. Open them
            directly in your editor.
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-lg font-semibold text-primary">
            Quick Links
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </article>
      </section>

      <p className="text-sm text-muted-foreground">
        Note: This is a placeholder page. In production, you may want to
        implement a proper documentation viewer or CMS integration.
      </p>
    </div>
  );
}
