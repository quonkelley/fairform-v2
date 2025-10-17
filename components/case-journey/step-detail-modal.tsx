"use client";

import { Calendar, Clock, AlertCircle, MessageCircle, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CaseStep } from "@/lib/validation";
import { getStepTypeContent } from "@/lib/journeys/stepTypeContent";

export interface StepDetailModalProps {
  step: CaseStep;
  totalSteps: number;
  isOpen: boolean;
  onClose: () => void;
  onAskAI?: (message?: string) => void;
}

export function StepDetailModal({ step, totalSteps, isOpen, onClose, onAskAI }: StepDetailModalProps) {
  const { name, order, dueDate, estimatedTime, disclaimer, description, stepType } = step;

  const handleAskAI = () => {
    if (onAskAI) {
      onAskAI(`Can you help me with ${name}?`);
      onClose(); // Close modal when opening AI chat
    }
  };

  // Format due date if present
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Format estimated time
  const formattedEstimatedTime = estimatedTime
    ? estimatedTime < 60
      ? `${estimatedTime} minutes`
      : `${Math.round(estimatedTime / 60)} hour${estimatedTime >= 120 ? 's' : ''}`
    : "Varies";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-6">
            {name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Step {order} of {totalSteps}
            {description && ` • ${description}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Educational Content Section */}
          {(() => {
            const stepContent = getStepTypeContent(stepType);
            if (stepContent) {
              return (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-blue-50 dark:bg-blue-950/20 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-500" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {stepContent.title}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3 leading-relaxed">
                      {stepContent.description}
                    </p>
                    <ul className="space-y-1">
                      {stepContent.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            } else if (description) {
              return (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      About This Step
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      About This Step
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This step is part of your case journey. Use the AI Help panel to ask questions about this step.
                    </p>
                  </div>
                </div>
              );
            }
          })()}

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
              <p className="text-sm text-muted-foreground">{formattedEstimatedTime}</p>
            </div>
          </div>

          {/* Disclaimer Section */}
          {disclaimer && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Important Note
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  {disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Ask AI Button */}
          {onAskAI && (
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleAskAI}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Need help? Ask AI about this step
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Get personalized answers and guidance from our AI assistant
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

