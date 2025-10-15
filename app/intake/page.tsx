"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, FileText, X } from "lucide-react";
import Link from "next/link";

import { AIIntakeForm } from "@/components/intake/ai-intake-form";
import { AISummaryCard } from "@/components/intake/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-context";
import type { IntakeClassification } from "@/lib/ai/schemas";
import { useCreateCase } from "@/lib/hooks/useCreateCase";

type IntakeStep = "input" | "review" | "confirm";

interface IntakeState {
  classification: IntakeClassification | null;
  moderation: {
    verdict: "pass" | "review" | "block";
    flaggedCategories: string[];
  } | null;
  requiresReview: boolean;
}

const COPILOT_CTA_DISMISSED_KEY = 'copilot-cta-dismissed';

export default function IntakePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<IntakeStep>("input");
  const [state, setState] = useState<IntakeState>({
    classification: null,
    moderation: null,
    requiresReview: false,
  });
  const [showCopilotCTA, setShowCopilotCTA] = useState(true);

  const { mutate: createCase, isPending: isCreatingCase } = useCreateCase(user?.uid);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(COPILOT_CTA_DISMISSED_KEY);
    if (dismissed === 'true') {
      setShowCopilotCTA(false);
    }
  }, []);

  const handleIntakeSuccess = (data: {
    classification: IntakeClassification;
    moderation: { verdict: "pass" | "review" | "block"; flaggedCategories: string[] };
    requiresReview: boolean;
  }) => {
    setState({
      classification: data.classification,
      moderation: data.moderation,
      requiresReview: data.requiresReview,
    });
    setStep("review");
  };

  const handleBackToInput = () => {
    setStep("input");
  };

  const handleConfirmAndCreateCase = (editedSummary: string) => {
    if (!state.classification) return;

    // Build jurisdiction string
    const jurisdictionParts = [
      state.classification.jurisdiction.county,
      state.classification.jurisdiction.state,
    ].filter(Boolean);
    const jurisdiction = jurisdictionParts.length > 0
      ? jurisdictionParts.join(", ")
      : "Not specified";

    // Create the case
    createCase(
      {
        caseType: state.classification.caseType,
        jurisdiction,
        title: state.classification.primaryIssue,
        notes: editedSummary,
      },
      {
        onSuccess: (response) => {
          // Redirect to the newly created case
          router.push(`/cases/${response.id}`);
        },
        onError: (error) => {
          console.error("Failed to create case:", error);
          // Error handling is already in the useCreateCase hook
        },
      },
    );
  };

  const handleDismissCTA = () => {
    setShowCopilotCTA(false);
    localStorage.setItem(COPILOT_CTA_DISMISSED_KEY, 'true');
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Quick Form Intake</h1>
        <p className="mt-2 text-muted-foreground">
          Prefer a structured form? Fill out the details below and we&apos;ll help you get started.
        </p>
      </div>

      {/* Copilot CTA - Prominent placement */}
      {showCopilotCTA && step === "input" && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Prefer to chat?</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissCTA}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Our <strong>AI Assistant</strong> can guide you through the process conversationally,
              answer your questions, and help you understand your options as you go.
            </CardDescription>
            <Link href="/dashboard?openCopilot=true">
              <Button className="w-full sm:w-auto">
                <Bot className="mr-2 h-4 w-4" />
                Try AI Assistant →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Method Comparison (Optional - Collapsible) */}
      {step === "input" && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Compare intake methods ↓
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4" />
                  AI Assistant (Recommended)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Guided conversation</li>
                  <li>✓ Ask questions anytime</li>
                  <li>✓ Context-aware help</li>
                  <li>✓ Natural language</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Quick Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Fast if you have details</li>
                  <li>✓ Direct data entry</li>
                  <li>✓ Familiar interface</li>
                  <li>✓ No conversation needed</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </details>
      )}

      {/* Progress Indicator */}
      {step !== "input" && (
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === "input"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              1
            </div>
            <div className="h-1 flex-1 bg-primary/20">
              <div
                className={`h-full bg-primary transition-all ${
                  step === "review" ? "w-full" : "w-0"
                }`}
              />
            </div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step === "review"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              }`}
            >
              2
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Describe Issue</span>
            <span>Review & Confirm</span>
          </div>
        </div>
      )}

      {/* Beta Notice */}
      <Alert>
        <span>
          <strong>Beta Feature:</strong> AI Intake is currently in testing. The AI provides
          educational guidance only and does not constitute legal advice. Always consult with a
          qualified attorney for legal matters.
        </span>
      </Alert>

      {/* Step Content */}
      {step === "input" && (
        <div className="pt-4">
          <AIIntakeForm onSuccess={handleIntakeSuccess} />
        </div>
      )}

      {step === "review" && state.classification && (
        <AISummaryCard
          classification={state.classification}
          requiresReview={state.requiresReview}
          onConfirm={handleConfirmAndCreateCase}
          onBack={handleBackToInput}
          isSubmitting={isCreatingCase}
        />
      )}
    </div>
  );
}
