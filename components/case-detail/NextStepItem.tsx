import { Clock } from "lucide-react";
import type { NextStep } from "@/lib/nextSteps/generate";

export interface NextStepItemProps {
  step: NextStep;
  index: number;
}

export function NextStepItem({ step, index }: NextStepItemProps) {
  return (
    <li className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex-shrink-0">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          aria-label={`Step ${index + 1}`}
        >
          {index + 1}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight text-foreground">
            {step.title}
          </h4>
          {step.priority === "high" && (
            <span className="flex-shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              Priority
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{step.description}</p>

        {step.estimatedTime && step.estimatedTime > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{step.estimatedTime} min</span>
          </div>
        )}
      </div>
    </li>
  );
}
