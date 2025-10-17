'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, ExternalLink, Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormSuccessCardProps {
  formId: string;
  formTitle: string;
  caseId: string;
  fields: Record<string, unknown>;
  caseNumber?: string;
  hearingDate?: Date | string | null;
  onDownloadComplete?: (result: { downloadUrl: string; fileName: string }) => void;
}

interface DownloadInfo {
  downloadUrl: string;
  fileName: string;
}

export function FormSuccessCard({
  formId,
  formTitle,
  caseId,
  fields,
  caseNumber,
  hearingDate,
  onDownloadComplete,
}: FormSuccessCardProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    void import("canvas-confetti")
      .then(({ default: confetti }) => {
        if (cancelled) return;
        confetti({
          particleCount: 140,
          spread: 65,
          origin: { y: 0.6 },
        });
      })
      .catch((confettiError) => {
        console.warn("Confetti animation failed to load", confettiError);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedHearingDate = useMemo(() => {
    if (!hearingDate) {
      return null;
    }

    const value =
      hearingDate instanceof Date ? hearingDate : new Date(hearingDate);

    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [hearingDate]);

  const summaryItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];

    if (caseNumber) {
      items.push({
        label: "Case Number",
        value: String(caseNumber),
      });
    }

    if (formattedHearingDate) {
      items.push({
        label: "Hearing Date",
        value: formattedHearingDate,
      });
    }

    return items;
  }, [caseNumber, formattedHearingDate]);

  const downloadPDF = useCallback(async () => {
    if (!user) {
      setError("You need to be signed in to download your form.");
      return;
    }

    setError(null);

    if (downloadInfo) {
      triggerBrowserDownload(downloadInfo);
      onDownloadComplete?.(downloadInfo);
      return;
    }

    setIsDownloading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/forms/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          formId,
          caseId,
          fields: serializeFields(fields),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Failed to generate form: ${response.statusText}`
        );
      }

      const data = (await response.json()) as {
        downloadUrl?: string;
        fileName?: string;
      };

      if (!data.downloadUrl) {
        throw new Error("No download URL returned from server.");
      }

      const info: DownloadInfo = {
        downloadUrl: data.downloadUrl,
        fileName: data.fileName || `${formId}.pdf`,
      };

      setDownloadInfo(info);
      triggerBrowserDownload(info);
      onDownloadComplete?.(info);
    } catch (downloadError) {
      console.error("Failed to download form PDF", downloadError);
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download PDF. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  }, [user, downloadInfo, onDownloadComplete, formId, caseId, fields]);

  return (
    <Card className="border-green-200 bg-green-50/80 shadow-none">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-green-800">
              Your {formTitle} is ready!
            </CardTitle>
            <CardDescription className="text-sm text-green-700">
              Download and review your completed form. You can always find it in your case dashboard.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {summaryItems.length > 0 && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-lg border border-green-100 bg-white/70 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-green-600">
                  {item.label}
                </dt>
                <dd className="text-sm font-medium text-green-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-green-700">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          Saved to your secure case documents
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={downloadPDF}
            disabled={isDownloading || !user}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Generating…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </>
            )}
          </Button>

          <Button variant="ghost" asChild className="gap-2 text-green-700 hover:text-green-900">
            <Link href={`/cases/${caseId}`}>
              View in Dashboard
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function serializeFields(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => {
      if (value instanceof Date) {
        return [key, value.toISOString()];
      }
      if (typeof value === "object" && value && "toDate" in (value as object)) {
        try {
          const dateValue = (value as { toDate: () => Date }).toDate();
          return [key, dateValue.toISOString()];
        } catch {
          return [key, value];
        }
      }
      return [key, value];
    })
  );
}

function triggerBrowserDownload(info: DownloadInfo) {
  const anchor = document.createElement("a");
  anchor.href = info.downloadUrl;
  anchor.download = info.fileName;
  anchor.rel = "noopener";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
