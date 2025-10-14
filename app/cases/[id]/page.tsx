"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CaseJourneyMap } from "@/components/case-journey/case-journey-map";
import { ProgressOverview } from "@/components/case-detail/ProgressOverview";
import { NextStepsCard } from "@/components/case-detail/NextStepsCard";
import { useCaseDetails } from "@/lib/hooks/useCaseDetails";
import { Spinner } from "@/components/feedback/spinner";
import { AICopilotProvider } from "@/components/ai-copilot";
import type { CaseType } from "@/lib/validation";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const caseId = params.id;
  const { data: caseData, isLoading } = useCaseDetails(caseId);

  return (
    <ProtectedRoute>
      <AICopilotProvider caseId={caseId}>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8">
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <Spinner label="Loading case details" />
            </div>
          )}

          {/* Main Content - Only show when data is loaded */}
          {!isLoading && caseData && (
            <>
              {/* Progress Overview */}
              <ProgressOverview
                progressPct={caseData.progressPct || 0}
                currentStep={caseData.currentStep}
                totalSteps={caseData.totalSteps}
                caseType={caseData.caseType}
              />

              {/* Two-Column Layout: Case Journey (left) and Next Steps (right) */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Case Journey Timeline (2/3 width on large screens) */}
                <main className="lg:col-span-2">
                  <CaseJourneyMap caseId={caseId} />
                </main>

                {/* Right Column: Next Steps Panel (1/3 width on large screens) */}
                <aside className="lg:col-span-1">
                  <NextStepsCard
                    caseType={caseData.caseType as CaseType}
                    currentStep={caseData.currentStep}
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </AICopilotProvider>
    </ProtectedRoute>
  );
}
