'use client';

import { Loader2 } from "lucide-react";

type SpinnerProps = {
  label?: string;
};

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm font-medium">{label ?? "Loading…"}</span>
    </div>
  );
}

