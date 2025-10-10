"use client";

import { useMemo, useState } from "react";
import { LogOut, Plus } from "lucide-react";

import { CaseCard } from "@/components/dashboard/case-card";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StartCaseDialog } from "@/components/dashboard/start-case-dialog";
import { Spinner } from "@/components/feedback/spinner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { type CaseRecord } from "@/lib/db/casesRepo";
import { useUserCases } from "@/lib/hooks/useUserCases";

type DashboardContentProps = {
  userId: string;
  userName?: string;
  onSignOut: () => Promise<void>;
  signingOut: boolean;
};

export function DashboardContent({
  userId,
  userName,
  onSignOut,
  signingOut,
}: DashboardContentProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const casesQuery = useUserCases(userId);

  const cases = useMemo(
    () => (casesQuery.data ?? []).slice().sort(sortByCreatedDate),
    [casesQuery.data],
  );

  const handleStartCaseClick = () => {
    setDialogOpen(true);
  };

  const handleCaseCreated = () => {
    setFlashMessage("Case created successfully.");
  };

  const handleDismissFlash = () => setFlashMessage(null);

  return (
    <>
      <DashboardLayout
        eyebrow="Dashboard"
        title={`Welcome back${userName ? `, ${userName}` : ""}!`}
        description="Review your cases, jump back into the next step, or start a new case when you're ready."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleStartCaseClick}
              className="gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Start new case
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSignOut}
              disabled={signingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {flashMessage ? (
            <Alert
              variant="success"
              title="All set"
              className="flex items-start justify-between gap-4"
            >
              <div>{flashMessage}</div>
              <button
                type="button"
                onClick={handleDismissFlash}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Dismiss
              </button>
            </Alert>
          ) : null}

          {casesQuery.isLoading ? (
            <LoadingState />
          ) : casesQuery.isError ? (
            <Alert variant="destructive" title="We can't load your cases">
              <p className="mb-3">
                {casesQuery.error?.message ??
                  "An unexpected error occurred while loading your cases."}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => casesQuery.refetch()}
              >
                Try again
              </Button>
            </Alert>
          ) : cases.length === 0 ? (
            <EmptyState onCreateCase={handleStartCaseClick} />
          ) : (
            <section aria-label="Your cases">
              <div className="grid gap-6 sm:grid-cols-2">
                {cases.map((item) => (
                  <CaseCard key={item.id} record={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </DashboardLayout>

      <StartCaseDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        onSuccess={handleCaseCreated}
      />
    </>
  );
}

function LoadingState() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="rounded-2xl border border-border bg-card/60 p-10 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner label="Loading your cases" />
        <p className="text-sm text-muted-foreground">
          Fetching the latest cases…
        </p>
      </div>
    </div>
  );
}

function sortByCreatedDate(a: CaseRecord, b: CaseRecord) {
  return b.createdAt.getTime() - a.createdAt.getTime();
}
