"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AIIntakeForm } from "@/components/intake/ai-intake-form";
import { AISummaryCard } from "@/components/intake/ai-summary-card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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

export default function IntakePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<IntakeStep>("input");
  const [state, setState] = useState<IntakeState>({
    classification: null,
    moderation: null,
    requiresReview: false,
  });

  const { mutate: createCase, isPending: isCreatingCase } = useCreateCase(user?.uid);

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

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">AI-Powered Case Intake</h1>
        <p className="mt-2 text-muted-foreground">
          Describe your legal issue and let our AI assistant help you get started.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
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

      {/* Beta Notice */}
      <Alert className="mb-6">
        <span>
          <strong>Beta Feature:</strong> AI Intake is currently in testing. The AI provides
          educational guidance only and does not constitute legal advice. Always consult with a
          qualified attorney for legal matters.
        </span>
      </Alert>

      {/* Step Content */}
      {step === "input" && (
        <AIIntakeForm onSuccess={handleIntakeSuccess} />
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
