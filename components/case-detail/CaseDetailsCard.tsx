"use client";

import { Calendar, MapPin, FileText, Scale, Briefcase, User } from "lucide-react";
import type { Case } from "@/lib/validation";

interface CaseDetailsCardProps {
  caseData: Case;
}

export function CaseDetailsCard({ caseData }: CaseDetailsCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    // Check if date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCaseType = (caseType: string) => {
    return caseType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const detailItems = [
    {
      icon: Briefcase,
      label: "Case Type",
      value: formatCaseType(caseData.caseType),
      show: true,
    },
    {
      icon: MapPin,
      label: "Jurisdiction",
      value: caseData.jurisdiction,
      show: true,
    },
    {
      icon: FileText,
      label: "Case Number",
      value: caseData.caseNumber,
      show: !!caseData.caseNumber,
    },
    {
      icon: Scale,
      label: "Court",
      value: caseData.court,
      show: !!caseData.court,
    },
    {
      icon: User,
      label: "Plaintiff",
      value: caseData.plaintiff,
      show: !!caseData.plaintiff,
    },
    {
      icon: User,
      label: "Defendant",
      value: caseData.defendant,
      show: !!caseData.defendant,
    },
    {
      icon: MapPin,
      label: "Property Address",
      value: caseData.propertyAddress,
      show: !!caseData.propertyAddress,
    },
    {
      icon: Calendar,
      label: "Filing Date",
      value: formatDate(caseData.filingDate),
      show: !!caseData.filingDate,
    },
    {
      icon: Calendar,
      label: "Next Hearing Date",
      value: formatDate(caseData.nextHearingDate),
      show: !!caseData.nextHearingDate,
    },
    {
      icon: Calendar,
      label: "Created",
      value: formatDate(caseData.createdAt),
      show: true,
    },
  ];

  const visibleDetails = detailItems.filter((item) => item.show);

  return (
    <section
      aria-labelledby="case-details-header"
      className="rounded-2xl border border-border bg-card/60 p-6"
    >
      <div className="mb-6">
        <h2
          id="case-details-header"
          className="text-xl font-semibold text-foreground"
        >
          Case Information
        </h2>
        {caseData.title && (
          <p className="mt-1 text-base font-medium text-foreground/90">
            {caseData.title}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Overview of your case details and information
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleDetails.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/40 p-4"
            >
              <div className="rounded-md bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {item.value || "Not specified"}
                </dd>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Section */}
      {caseData.notes && (
        <div className="mt-6 rounded-lg border border-border/50 bg-background/40 p-4">
          <dt className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Case Notes
          </dt>
          <dd className="whitespace-pre-wrap text-sm text-foreground/90">
            {caseData.notes}
          </dd>
        </div>
      )}
    </section>
  );
}
