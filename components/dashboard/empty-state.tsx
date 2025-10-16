'use client';

import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAICopilotContext } from "@/components/ai-copilot/AICopilotProvider";

type EmptyStateProps = {
  onCreateCase: () => void;
};

export function EmptyState({ onCreateCase }: EmptyStateProps) {
  const { openChat } = useAICopilotContext();

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center shadow-inner">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Hero Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>

        {/* Main Heading */}
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Let&apos;s get you started
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            Talk to FairForm about your legal situation
          </h2>
        </div>

        {/* Description */}
        <p className="text-base text-muted-foreground">
          Describe your notice or legal situation, and I&apos;ll help you understand your next steps. 
          FairForm will guide you through the process and create your case automatically.
        </p>

        {/* Primary CTA */}
        <Button size="lg" onClick={openChat} className="px-8 gap-2">
          <Bot className="h-5 w-5" />
          Talk to FairForm
        </Button>

        {/* Manual Creation Option */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">
            Already have all your case details?
          </p>
          <Button variant="ghost" size="sm" onClick={onCreateCase} className="text-xs">
            Create case manually
          </Button>
        </div>
      </div>
    </div>
  );
}
