"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseStep } from "@/lib/validation";
import { useCompleteStep } from "@/lib/hooks/useCompleteStep";
import { StepDetailModal } from "./step-detail-modal";
import { StepCompletionCelebration } from "./StepCompletionCelebration";

export interface StepNodeProps {
  step: CaseStep;
  index: number;
  totalSteps: number;
  onAskAI?: (message?: string) => void;
}

export function StepNode({ step, index, totalSteps, onAskAI }: StepNodeProps) {
  const { id: stepId, caseId, name, order, dueDate, isComplete, description } = step;
  const completeStep = useCompleteStep();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine if this is the current step (first incomplete step)
  const isCurrent = !isComplete && index === 0;

  // Visual state styling
  const isCompleted = isComplete;
  const isUpcoming = !isComplete && !isCurrent;

  // Icon selection based on state
  const Icon = isCompleted ? CheckCircle2 : isCurrent ? Clock : Circle;

  // Handle complete button click
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    completeStep.mutate({ stepId, caseId }, {
      onSuccess: () => {
        // Show celebration on successful completion
        setShowCelebration(true);
      },
    });
  };

  // Handle card click to open modal (only if not clicking the button)
  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md relative",
          isCompleted &&
            "border-success/50 bg-success/5",
          isCurrent && "border-primary bg-primary/5 ring-2 ring-primary/20",
          isUpcoming && "border-border bg-card"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => description && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
      <div className="flex items-start gap-4 p-5">
        {/* Step Number Circle */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isCompleted &&
              "border-success bg-success/10 text-success",
            isCurrent &&
              "border-primary bg-primary/10 text-primary",
            isUpcoming &&
              "border-muted-foreground bg-background text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "text-lg font-semibold leading-tight",
                isCompleted && "text-success",
                isCurrent && "text-primary",
                isUpcoming && "text-foreground"
              )}
            >
              {name}
            </h3>
            <span
              className={cn(
                "shrink-0 text-xs font-medium px-2 py-1 rounded-full",
                isCompleted && "bg-success/20 text-success",
                isCurrent && "bg-primary/20 text-primary",
                isUpcoming && "bg-muted text-muted-foreground"
              )}
            >
              {order}/{totalSteps}
            </span>
          </div>

          {/* Due Date and Status in a row */}
          <div className="flex items-center gap-3 flex-wrap">
            {dueDate && (
              <p className="text-xs text-muted-foreground">
                Due: {new Date(dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                isCompleted &&
                  "bg-success/20 text-success",
                isCurrent && "bg-primary/20 text-primary",
                isUpcoming && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted && "✓ Complete"}
              {isCurrent && "→ In Progress"}
              {isUpcoming && "○ Upcoming"}
            </span>
          </div>

          {/* Mark Complete Button - Only show for incomplete steps */}
          {!isComplete && (
            <div className="mt-3 flex items-start gap-2">
              <Button
                onClick={handleComplete}
                disabled={completeStep.isPending}
                aria-label={`Mark ${name} as complete`}
                className="max-w-xs"
                size="sm"
              >
                {completeStep.isPending ? "Completing..." : "Mark Complete"}
              </Button>

              {/* Error Message */}
              {completeStep.isError && (
                <p className="text-sm text-destructive" role="alert" aria-live="polite">
                  Unable to mark step complete. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && description && (
        <div className="absolute left-0 right-0 top-full mt-2 z-10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
      </Card>

      {/* Step Detail Modal */}
      <StepDetailModal
        step={step}
        totalSteps={totalSteps}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAskAI={onAskAI}
      />

      {/* Celebration Animation */}
      <StepCompletionCelebration
        isVisible={showCelebration}
        stepName={name}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
}
