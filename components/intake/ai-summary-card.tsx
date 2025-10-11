"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Edit2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { IntakeClassification } from "@/lib/ai/schemas";

interface AISummaryCardProps {
  classification: IntakeClassification;
  requiresReview: boolean;
  onConfirm: (editedSummary: string) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const EditSummarySchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters").max(600),
});

type EditSummaryForm = z.infer<typeof EditSummarySchema>;

export function AISummaryCard({
  classification,
  requiresReview,
  onConfirm,
  onBack,
  isSubmitting = false,
}: AISummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<EditSummaryForm>({
    resolver: zodResolver(EditSummarySchema),
    defaultValues: {
      summary: classification.summary,
    },
  });

  const handleConfirm = (data: EditSummaryForm) => {
    onConfirm(data.summary);
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>AI Classification Results</CardTitle>
            <CardDescription>
              Review the information below and make any necessary edits before saving your case.
            </CardDescription>
          </div>
          <Badge variant={getRiskBadgeVariant(classification.riskLevel)}>
            {classification.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {requiresReview && (
          <Alert>
            This submission has been flagged for review. The classification is provided for
            informational purposes.
          </Alert>
        )}

        {/* Case Type & Primary Issue */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Case Type</h3>
            <p className="mt-1 text-lg font-semibold">{classification.caseType}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Primary Issue</h3>
            <p className="mt-1 text-lg font-semibold">{classification.primaryIssue}</p>
          </div>
        </div>

        {/* Jurisdiction */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Jurisdiction</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {classification.jurisdiction.state && (
              <Badge variant="outline">State: {classification.jurisdiction.state}</Badge>
            )}
            {classification.jurisdiction.county && (
              <Badge variant="outline">County: {classification.jurisdiction.county}</Badge>
            )}
            {classification.jurisdiction.courtLevel && (
              <Badge variant="outline">Court: {classification.jurisdiction.courtLevel}</Badge>
            )}
            {!classification.jurisdiction.state &&
              !classification.jurisdiction.county &&
              !classification.jurisdiction.courtLevel && (
                <span className="text-sm text-muted-foreground">Not specified</span>
              )}
          </div>
        </div>

        {/* Summary - Editable */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Case Summary</h3>
            {!isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="mr-1 h-3 w-3" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <Form {...form}>
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset({ summary: classification.summary });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={async () => {
                    const isValid = await form.trigger("summary");
                    if (isValid) setIsEditing(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <p className="rounded-md border bg-muted/50 p-3 text-sm">
              {form.watch("summary")}
            </p>
          )}
        </div>

        {/* AI Confidence */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">AI Confidence</h3>
          <p className={`mt-1 text-lg font-semibold ${getConfidenceColor(classification.confidence)}`}>
            {Math.round(classification.confidence * 100)}%
          </p>
        </div>

        {/* Recommended Next Steps */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Recommended Next Steps
          </h3>
          <ul className="space-y-2">
            {classification.recommendedNextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimers */}
        <div className="space-y-2">
          {classification.disclaimers.map((disclaimer, index) => (
            <Alert key={index} variant="default">
              <span className="text-xs">{disclaimer}</span>
            </Alert>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            type="button"
            onClick={() => handleConfirm(form.getValues())}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating Case..." : "Confirm & Create Case"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
