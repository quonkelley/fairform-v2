'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, Triangle } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        success:
          "border-green-500/40 bg-green-500/10 text-green-900 dark:text-green-100",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive-foreground",
        warning:
          "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
        info: "border-primary/40 bg-primary/10 text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const variantIconMap = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: Triangle,
  info: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, title, variant, children, ...props }, ref) => {
    const Icon = variantIconMap[variant ?? "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            {title ? <p className="font-medium">{title}</p> : null}
            <div className="leading-relaxed text-muted-foreground">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

