"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Edit2, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { IntakeClassification } from "@/lib/ai/schemas";

// Schema for editing case preview fields
const CasePreviewEditSchema = z.object({
  caseType: z.string().min(1, "Case type is required"),
  primaryIssue: z.string().min(1, "Primary issue is required"),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(600),
  jurisdiction: z.object({
    state: z.string().optional(),
    county: z.string().optional(),
    courtLevel: z.string().optional(),
  }),
  caseNumber: z.string().optional(),
  nextHearingDate: z.string().optional(),
  defendant: z.string().optional(),
  plaintiff: z.string().optional(),
  court: z.string().optional(),
  filingDate: z.string().optional(),
  propertyAddress: z.string().optional(),
});

type CasePreviewEditForm = z.infer<typeof CasePreviewEditSchema>;

interface CasePreviewCardProps {
  classification: IntakeClassification;
  caseData?: Partial<CasePreviewEditForm>;
  onConfirm: (data: CasePreviewEditForm) => void;
  onStartOver: () => void;
  isSubmitting?: boolean;
}

export function CasePreviewCard({
  classification,
  caseData,
  onConfirm,
  onStartOver,
  isSubmitting = false,
}: CasePreviewCardProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  // Merge classification data with additional case data
  const initialData: CasePreviewEditForm = {
    caseType: caseData?.caseType || classification.caseType,
    primaryIssue: caseData?.primaryIssue || classification.primaryIssue,
    summary: caseData?.summary || classification.summary,
    jurisdiction: {
      state: caseData?.jurisdiction?.state || classification.jurisdiction.state || "",
      county: caseData?.jurisdiction?.county || classification.jurisdiction.county || "",
      courtLevel: caseData?.jurisdiction?.courtLevel || classification.jurisdiction.courtLevel || "",
    },
    caseNumber: caseData?.caseNumber || "",
    nextHearingDate: caseData?.nextHearingDate || "",
    defendant: caseData?.defendant || "",
    plaintiff: caseData?.plaintiff || "",
    court: caseData?.court || "",
    filingDate: caseData?.filingDate || "",
    propertyAddress: caseData?.propertyAddress || "",
  };

  const form = useForm<CasePreviewEditForm>({
    resolver: zodResolver(CasePreviewEditSchema),
    defaultValues: initialData,
  });

  const handleConfirm = (data: CasePreviewEditForm) => {
    onConfirm(data);
  };

  const handleFieldEdit = (fieldName: string) => {
    setEditingField(fieldName);
  };

  const handleFieldSave = async (fieldName: string) => {
    const isValid = await form.trigger(fieldName as keyof CasePreviewEditForm);
    if (isValid) {
      setEditingField(null);
    }
  };

  const handleFieldCancel = (fieldName: string) => {
    form.resetField(fieldName as keyof CasePreviewEditForm);
    setEditingField(null);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderEditableField = (
    fieldName: Exclude<keyof CasePreviewEditForm, 'jurisdiction'>,
    label: string,
    value: string,
    isTextarea = false
  ) => {
    const isEditing = editingField === fieldName;
    const fieldValue = form.watch(fieldName);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFieldEdit(fieldName)}
              className="h-8 px-2"
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
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    {isTextarea ? (
                      <Textarea
                        {...field}
                        className="min-h-[80px]"
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    ) : (
                      <Input
                        {...field}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleFieldCancel(fieldName)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleFieldSave(fieldName)}
                    >
                      Save
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          </Form>
        ) : (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            {fieldValue || value || "Not specified"}
          </div>
        )}
      </div>
    );
  };

  const renderJurisdictionField = () => {
    const jurisdiction = form.watch("jurisdiction");
    const isEditing = editingField === "jurisdiction";

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Jurisdiction</h3>
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFieldEdit("jurisdiction")}
              className="h-8 px-2"
            >
              <Edit2 className="mr-1 h-3 w-3" />
              Edit
            </Button>
          )}
        </div>

        {isEditing ? (
          <Form {...form}>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="jurisdiction.state"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="State (e.g., California)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurisdiction.county"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="County (e.g., Los Angeles)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurisdiction.courtLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="Court Level (e.g., Superior Court)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleFieldCancel("jurisdiction")}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleFieldSave("jurisdiction")}
                >
                  Save
                </Button>
              </div>
            </div>
          </Form>
        ) : (
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {jurisdiction.state && (
                <Badge variant="outline">State: {jurisdiction.state}</Badge>
              )}
              {jurisdiction.county && (
                <Badge variant="outline">County: {jurisdiction.county}</Badge>
              )}
              {jurisdiction.courtLevel && (
                <Badge variant="outline">Court: {jurisdiction.courtLevel}</Badge>
              )}
              {!jurisdiction.state && !jurisdiction.county && !jurisdiction.courtLevel && (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Case Preview</CardTitle>
            <CardDescription>
              Review and edit your case information before creating it.
            </CardDescription>
          </div>
          <Badge variant={getRiskBadgeVariant(classification.riskLevel)}>
            {classification.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Case Type & Primary Issue */}
        <div className="grid gap-4 sm:grid-cols-2">
          {renderEditableField("caseType", "Case Type", form.watch("caseType") || "")}
          {renderEditableField("primaryIssue", "Primary Issue", form.watch("primaryIssue") || "")}
        </div>

        {/* Jurisdiction */}
        {renderJurisdictionField()}

        {/* Case Summary */}
        {renderEditableField("summary", "Case Summary", form.watch("summary") || "", true)}

        {/* Additional Case Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {renderEditableField("caseNumber", "Case Number", form.watch("caseNumber") || "")}
            {renderEditableField("court", "Court", form.watch("court") || "")}
            {renderEditableField("plaintiff", "Plaintiff", form.watch("plaintiff") || "")}
            {renderEditableField("defendant", "Defendant", form.watch("defendant") || "")}
            {renderEditableField("propertyAddress", "Property Address", form.watch("propertyAddress") || "")}
            {renderEditableField("filingDate", "Filing Date", formatDate(form.watch("filingDate") || ""))}
            {renderEditableField("nextHearingDate", "Next Hearing Date", formatDate(form.watch("nextHearingDate") || ""))}
          </div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onStartOver}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
          <Button
            type="button"
            onClick={() => handleConfirm(form.getValues())}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating Case..." : "Create Case"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
