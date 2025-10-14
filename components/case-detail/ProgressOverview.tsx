"use client";

import { Progress } from "@/components/ui/progress";

export interface ProgressOverviewProps {
  progressPct: number;
  currentStep?: number;
  totalSteps?: number;
  caseType: string;
}

export function ProgressOverview({
  progressPct,
  currentStep,
  totalSteps,
  caseType,
}: ProgressOverviewProps) {
  // Format case type for display
  const formattedCaseType = caseType.replace(/_/g, " ");

  // Calculate steps remaining
  const stepsRemaining =
    currentStep && totalSteps && totalSteps >= currentStep
      ? totalSteps - currentStep + 1
      : 0;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      role="region"
      aria-label="Case progress overview"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Case Progress</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {formattedCaseType} case
          </p>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span
              className="text-2xl font-bold text-foreground"
              aria-label={`${progressPct} percent complete`}
            >
              {progressPct}%
            </span>
          </div>

          <Progress
            value={progressPct}
            className="h-3 w-full"
            aria-label="Case progress bar"
          />
        </div>

        {/* Step Information */}
        {currentStep !== undefined && totalSteps !== undefined && totalSteps > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Current Step</span>
              <span className="text-xs text-muted-foreground">
                Step {currentStep > totalSteps ? totalSteps : currentStep} of {totalSteps}
              </span>
            </div>

            {stepsRemaining > 0 && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-semibold text-foreground">{stepsRemaining}</span>
                <span className="text-xs text-muted-foreground">
                  {stepsRemaining === 1 ? "step remaining" : "steps remaining"}
                </span>
              </div>
            )}

            {stepsRemaining === 0 && currentStep > totalSteps && (
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Complete!
                </span>
                <span className="text-xs text-muted-foreground">All steps done</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
