'use client';

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  onCreateCase: () => void;
};

export function EmptyState({ onCreateCase }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center shadow-inner">
      <div className="mx-auto max-w-xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          No cases yet
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Let’s start your first case
        </h2>
        <p className="text-base text-muted-foreground">
          When you create a case, we’ll bookmark your progress and surface the
          next best step every time you sign in. You can revisit details at any
          time.
        </p>
        <Button size="lg" onClick={onCreateCase} className="px-8">
          Start new case
        </Button>
      </div>
    </div>
  );
}
