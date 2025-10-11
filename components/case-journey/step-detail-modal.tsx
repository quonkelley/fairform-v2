"use client";

import { Calendar, Clock, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CaseStep } from "@/lib/validation";
import { getStepInstructions, getDefaultInstructions } from "@/lib/data/step-instructions";

export interface StepDetailModalProps {
  step: CaseStep;
  totalSteps: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StepDetailModal({ step, totalSteps, isOpen, onClose }: StepDetailModalProps) {
  const { name, order, dueDate } = step;
  
  // Get instruction template for this step
  const stepInstructions = getStepInstructions(name) || getDefaultInstructions();

  // Format due date if present
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-6">
            {stepInstructions.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Step {order} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Instructions Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Instructions
            </h3>
            <ol className="space-y-2 pl-5 list-decimal">
              {stepInstructions.instructions.map((instruction, index) => (
                <li key={index} className="text-sm leading-relaxed text-foreground">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Due Date Section */}
          {formattedDueDate && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">Due Date</p>
                <p className="text-sm text-muted-foreground">{formattedDueDate}</p>
              </div>
            </div>
          )}

          {/* Estimated Time Section */}
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
            <Clock className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Estimated Time</p>
              <p className="text-sm text-muted-foreground">{stepInstructions.estimatedTime}</p>
            </div>
          </div>

          {/* Resources Section */}
          {stepInstructions.resources && stepInstructions.resources.length > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">You&apos;ll Need</p>
                <ul className="space-y-1">
                  {stepInstructions.resources.map((resource, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Help Text Section */}
          {stepInstructions.helpText && (
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                💡 <span className="font-medium">Helpful Tip:</span> {stepInstructions.helpText}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

