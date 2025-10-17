'use client';

import { DownloadCloud } from "lucide-react";
import Link from "next/link";

import type { CompletedFormRecord } from "@/lib/db/types";
import { Button } from "@/components/ui/button";

interface CompletedFormsListProps {
  forms: CompletedFormRecord[];
  emptyStateMessage?: string;
}

export function CompletedFormsList({
  forms,
  emptyStateMessage = "No forms completed yet.",
}: CompletedFormsListProps) {
  if (!forms || forms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {forms.map((form) => (
        <li
          key={form.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {form.formTitle || formatFormTitle(form.formId)}
            </p>
            <p className="text-xs text-muted-foreground">
              Completed {formatDate(form.createdAt)} · {form.fileName}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 self-start sm:self-auto"
          >
            <Link
              href={form.downloadUrl}
              download={form.fileName}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DownloadCloud className="h-4 w-4" aria-hidden="true" />
              Download
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatFormTitle(formId: string): string {
  return formId
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
