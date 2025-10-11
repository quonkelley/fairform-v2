"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CaseJourneyMap } from "@/components/case-journey/case-journey-map";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const caseId = params.id;

  return (
    <ProtectedRoute>
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">Case Details</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Case Details</h1>
          <p className="text-base text-muted-foreground">
            Track your progress through each step of your case.
          </p>
        </header>

        {/* Case Journey Timeline */}
        <main>
          <CaseJourneyMap caseId={caseId} />
        </main>
      </div>
    </ProtectedRoute>
  );
}
