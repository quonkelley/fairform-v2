"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseStep } from "@/lib/validation";
import { useCompleteStep } from "@/lib/hooks/useCompleteStep";
import { StepDetailModal } from "./step-detail-modal";

export interface StepNodeProps {
  step: CaseStep;
  index: number;
  totalSteps: number;
}

export function StepNode({ step, index, totalSteps }: StepNodeProps) {
  const { id: stepId, caseId, name, order, dueDate, isComplete } = step;
  const completeStep = useCompleteStep();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    completeStep.mutate({ stepId, caseId });
  };

  // Handle card click to open modal (only if not clicking the button)
  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md",
          isCompleted &&
            "border-success/50 bg-success/5",
          isCurrent && "border-primary bg-primary/5 ring-2 ring-primary/20",
          isUpcoming && "border-border bg-card"
        )}
        onClick={handleCardClick}
      >
      <div className="flex items-start gap-4 p-4">
        {/* Step Number Circle */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isCompleted &&
              "border-success bg-success/10 text-success",
            isCurrent &&
              "border-primary bg-primary/10 text-primary",
            isUpcoming &&
              "border-muted-foreground bg-background text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Step Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-base font-semibold leading-tight",
                isCompleted && "text-success",
                isCurrent && "text-primary",
                isUpcoming && "text-foreground"
              )}
            >
              {name}
            </h3>
            <span
              className={cn(
                "shrink-0 text-xs font-medium",
                isCompleted && "text-success",
                isCurrent && "text-primary",
                isUpcoming && "text-muted-foreground"
              )}
            >
              {order}/{totalSteps}
            </span>
          </div>

          {/* Due Date */}
          {dueDate && (
            <p className="text-xs text-muted-foreground">
              Due: {new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {/* Status Badge */}
          <div className="pt-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
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
            <div className="mt-4 flex flex-col gap-2">
              <Button
                onClick={handleComplete}
                disabled={completeStep.isPending}
                aria-label={`Mark ${name} as complete`}
                className="w-full"
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
      </Card>

      {/* Step Detail Modal */}
      <StepDetailModal
        step={step}
        totalSteps={totalSteps}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
