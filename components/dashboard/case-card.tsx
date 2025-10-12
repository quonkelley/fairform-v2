'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { type CaseRecord } from "@/lib/db/types";
import { Progress } from "@/components/ui/progress";

type CaseCardProps = {
  record: CaseRecord;
};

export function CaseCard({ record }: CaseCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(record.createdAt);

  return (
    <Link
      href={`/cases/${record.id}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card outline-none transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Open case ${record.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Active case
          </p>
          <h2 className="text-xl font-semibold text-foreground">
            {record.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatCaseType(record.caseType)} · {formatStatus(record.status)}
          </p>
        </div>
        <ArrowRight
          className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
      <dl className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div>
          <dt className="font-medium text-foreground">Created</dt>
          <dd>{formattedDate}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Jurisdiction</dt>
          <dd>{formatJurisdiction(record.jurisdiction)}</dd>
        </div>
      </dl>

      {/* Progress Section */}
      {(record.totalSteps !== undefined && record.totalSteps > 0) ? (
        <div className="mt-4 space-y-2">
          <Progress 
            value={record.progressPct || 0}
            aria-label="Case progress"
            aria-valuenow={record.progressPct || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <p className="text-xs text-muted-foreground">
            {record.completedSteps || 0} of {record.totalSteps} steps complete
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">
            No steps defined for this case
          </p>
        </div>
      )}
    </Link>
  );
}

function formatStatus(status: CaseRecord["status"]) {
  switch (status) {
    case "active":
      return "In progress";
    case "closed":
      return "Closed";
    case "archived":
      return "Archived";
    default:
      return "Status unknown";
  }
}

function formatCaseType(value: string) {
  return humanize(value || "Case");
}

function formatJurisdiction(value: string) {
  if (!value) return "Not set";
  if (value.includes("_")) {
    const [county, state] = value.split("_");
    return `${humanize(county)} County, ${state.toUpperCase()}`;
  }
  return humanize(value);
}

function humanize(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
