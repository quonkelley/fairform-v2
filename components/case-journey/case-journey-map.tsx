"use client";

import { useCaseSteps } from "@/lib/hooks/useCaseSteps";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/feedback/spinner";
import { StepNode } from "./step-node";

export interface CaseJourneyMapProps {
  caseId: string;
}

export function CaseJourneyMap({ caseId }: CaseJourneyMapProps) {
  const { data: steps, isLoading, isError, error } = useCaseSteps(caseId);

  // Loading state
  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card/60 p-10"
        role="region"
        aria-label="Case journey timeline"
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner label="Loading your case journey" />
          <p className="text-sm text-muted-foreground">
            Fetching your case steps...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div
        role="region"
        aria-label="Case journey timeline"
        className="space-y-4"
      >
        <Alert variant="destructive" title="Unable to load case journey">
          <p className="mb-3">
            {error?.message ||
              "An unexpected error occurred while loading your case journey."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page to try again.
          </p>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!steps || steps.length === 0) {
    return (
      <div
        role="region"
        aria-label="Case journey timeline"
        className="rounded-2xl border border-border bg-card/60 p-10 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-foreground">
            No steps found
          </p>
          <p className="text-sm text-muted-foreground">
            This case doesn&apos;t have any steps yet. Steps will appear here once they&apos;re added to your case.
          </p>
        </div>
      </div>
    );
  }

  // Success state with steps
  return (
    <div
      role="region"
      aria-label="Case journey timeline"
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Your Case Journey
        </h2>
        <p className="text-sm text-muted-foreground">
          Follow these steps to navigate your case through the legal process.
        </p>
      </div>

      <ol className="flex flex-col gap-4 md:gap-6">
        {steps.map((step) => {
          // Find index among incomplete steps to determine if this is "current"
          const incompleteSteps = steps.filter((s) => !s.isComplete);
          const incompleteIndex = incompleteSteps.findIndex((s) => s.id === step.id);

          return (
            <li key={step.id} className="list-none">
              <StepNode
                step={step}
                index={incompleteIndex}
                totalSteps={steps.length}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
