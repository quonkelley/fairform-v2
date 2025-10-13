"use client";

import { AlertCircle } from "lucide-react";
import { useNextSteps } from "@/lib/hooks/useNextSteps";
import type { CaseType } from "@/lib/validation";
import { Spinner } from "@/components/feedback/spinner";
import { NextStepItem } from "./NextStepItem";

export interface NextStepsCardProps {
  caseType: CaseType;
  currentStep?: number;
}

export function NextStepsCard({ caseType, currentStep }: NextStepsCardProps) {
  const { data: nextSteps, isLoading, isError } = useNextSteps(caseType, currentStep);

  // Format case type for display
  const formattedCaseType = caseType.replace(/_/g, " ");

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      role="region"
      aria-label="Next steps for your case"
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-bold text-foreground">Your Next Steps</h2>
        <p className="text-sm text-muted-foreground">
          Here's what you need to do next for your {formattedCaseType} case
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <Spinner label="Loading next steps" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-destructive">Unable to load next steps</h3>
            <p className="mt-1 text-sm text-destructive/80">
              Please refresh the page to try again.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!nextSteps || nextSteps.length === 0) && (
        <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {currentStep
              ? "No specific next steps available for this stage."
              : "Complete your first step to see next steps."}
          </p>
        </div>
      )}

      {/* Next Steps List */}
      {!isLoading && !isError && nextSteps && nextSteps.length > 0 && (
        <ul className="space-y-3" role="list">
          {nextSteps.map((step, index) => (
            <NextStepItem key={step.id} step={step} index={index} />
          ))}
        </ul>
      )}
    </div>
  );
}
