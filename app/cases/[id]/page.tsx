"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CaseJourneyMap } from "@/components/case-journey/case-journey-map";
import { ProgressOverview } from "@/components/case-detail/ProgressOverview";
import { CaseHelpChatPanel } from "@/components/case-detail/CaseHelpChatPanel";
import { CaseDetailsCard } from "@/components/case-detail/CaseDetailsCard";
import { useCaseDetails } from "@/lib/hooks/useCaseDetails";
import { useCaseSteps } from "@/lib/hooks/useCaseSteps";
import { Spinner } from "@/components/feedback/spinner";
import { AICopilotProvider } from "@/components/ai-copilot";
import { CompletedFormsList } from "@/components/forms/CompletedFormsList";
import { useCompletedForms } from "@/lib/hooks/useCompletedForms";
import { Alert } from "@/components/ui/alert";

interface CaseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const caseId = params.id;
  const { data: caseData, isLoading, isError, error } = useCaseDetails(caseId);
  const { data: steps } = useCaseSteps(caseId);
  const completedFormsQuery = useCompletedForms(caseId);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [aiMessage, setAiMessage] = useState<string | undefined>();

  // Get the current step (first incomplete step)
  const currentStep = steps?.find(s => !s.isComplete);

  // Handle AI chat request from step modal
  const handleAskAI = (message?: string) => {
    // Set the message to be sent to AI
    setAiMessage(message);
    
    // Scroll to chat panel
    const chatPanel = document.querySelector('[aria-label="AI Help chat panel"]');
    if (chatPanel) {
      chatPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Focus chat input and optionally pre-fill with step-specific question
    if (chatInputRef.current) {
      chatInputRef.current.focus();
      // The chat panel will handle the context automatically via currentStep prop
    }
  };

  return (
    <ProtectedRoute>
      <AICopilotProvider caseId={caseId} hideWidget={true}>
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

          {/* Error State */}
          {isError && (
            <Alert variant="destructive" title="Failed to load case">
              <p className="text-sm">
                {error?.message || "We couldn't load your case details. Please try again."}
              </p>
            </Alert>
          )}

          {/* Main Content - Only show when data is loaded */}
          {!isLoading && !isError && caseData && (
            <>
              {/* Progress Overview */}
              <ProgressOverview
                progressPct={caseData.progressPct || 0}
                currentStep={caseData.currentStep}
                totalSteps={caseData.totalSteps}
                caseType={caseData.caseType}
              />

              {/* Two-Column Layout: Case Journey (left) and AI Help (right) */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left Column: Case Journey Timeline (2/3 width on large screens) */}
                <main className="lg:col-span-2 space-y-8">
                  {/* Case Details Card */}
                  <CaseDetailsCard caseData={caseData} />

                  <CaseJourneyMap caseId={caseId} onAskAI={handleAskAI} />

                  <section aria-labelledby="case-documents-header" className="rounded-2xl border border-border bg-card/60 p-6">
                    <div className="mb-4">
                      <h2 id="case-documents-header" className="text-xl font-semibold text-foreground">
                        Documents
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Download forms you have completed for this case.
                      </p>
                    </div>

                    {completedFormsQuery.isLoading ? (
                      <div className="rounded-lg border border-dashed border-border/60 bg-background/60 p-6 text-center">
                        <Spinner label="Loading documents" />
                      </div>
                    ) : completedFormsQuery.isError ? (
                      <Alert variant="destructive" title="We couldn't load documents">
                        <p className="text-sm">
                          {completedFormsQuery.error?.message ?? "Please try again in a moment."}
                        </p>
                      </Alert>
                    ) : (
                      <CompletedFormsList forms={completedFormsQuery.data ?? []} />
                    )}
                  </section>
                </main>

                {/* Right Column: AI Help Chat Panel (1/3 width on large screens) */}
                <aside className="lg:col-span-1">
                  <div className="lg:sticky lg:top-8 h-[600px]">
                    <CaseHelpChatPanel 
                      caseId={caseId} 
                      currentStep={currentStep} 
                      initialMessage={aiMessage}
                      onMessageSent={() => setAiMessage(undefined)}
                    />
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </AICopilotProvider>
    </ProtectedRoute>
  );
}
