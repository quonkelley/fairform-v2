"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IntakeRequestSchema, type IntakeRequest, type IntakeClassification } from "@/lib/ai/schemas";
import { useAIIntake, AIIntakeException } from "@/lib/hooks/useAIIntake";
import { formDataToContext, updateIntakeContext } from "@/lib/ai/contextStorage";

interface ModerationResult {
  verdict: "pass" | "review" | "block";
  flaggedCategories: string[];
}

interface AIIntakeFormProps {
  onSuccess: (data: {
    classification: IntakeClassification;
    moderation: ModerationResult;
    requiresReview: boolean;
  }) => void;
  initialText?: string;
}

export function AIIntakeForm({ onSuccess, initialText }: AIIntakeFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate, isPending } = useAIIntake();

  const form = useForm<IntakeRequest>({
    resolver: zodResolver(IntakeRequestSchema),
    defaultValues: {
      text: initialText || "",
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  // Debounced save to context - save form data as user types
  const saveToContext = useCallback((text: string) => {
    if (text.trim()) {
      const context = formDataToContext({
        notes: text,
      });
      updateIntakeContext(context);
      console.log('Saved form data to context:', { notes: text });
    }
  }, []);

  // Watch form text field and save to context with debounce
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'text' && value.text) {
        // Debounce: save after 1 second of no typing
        const timeoutId = setTimeout(() => {
          saveToContext(value.text);
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, saveToContext]);

  const onSubmit = (data: IntakeRequest) => {
    setErrorMessage(null);

    mutate(data, {
      onSuccess: (response) => {
        onSuccess({
          classification: response.data,
          moderation: response.moderation,
          requiresReview: response.requiresReview,
        });
      },
      onError: (error: AIIntakeException) => {
        // Handle specific error types with user-friendly messages
        switch (error.code) {
          case "ContentBlocked":
            setErrorMessage(
              "We're unable to process this request. Please review your description and try again.",
            );
            break;
          case "ModerationFailure":
            setErrorMessage(
              "Content moderation is temporarily unavailable. Please try again in a moment.",
            );
            break;
          case "UpstreamError":
            setErrorMessage(
              "The AI service is unavailable right now. Please try again shortly.",
            );
            break;
          case "SchemaMismatch":
            setErrorMessage(
              "We received an unexpected response. Our team has been notified. Please try again.",
            );
            break;
          default:
            setErrorMessage("Unable to process your request. Please try again.");
        }
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe Your Legal Issue</CardTitle>
        <CardDescription>
          Tell us about your situation in your own words. Our AI assistant will help classify your
          case and suggest next steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What&apos;s going on?</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Example: My landlord refuses to fix the heater after many requests, and it's affecting my living conditions..."
                      className="min-h-[200px]"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide at least 20 characters so we can better understand your
                    situation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && (
              <Alert variant="destructive">
                {errorMessage}
              </Alert>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Analyzing..." : "Continue"}
              </Button>

              {isPending && (
                <p className="text-sm text-muted-foreground">
                  This may take a few seconds...
                </p>
              )}
            </div>

            <Alert>
              <span className="text-xs">
                <strong>Disclaimer:</strong> AI features in FairForm are educational tools only and
                do not provide legal advice. Always consult with a qualified attorney for legal
                guidance.
              </span>
            </Alert>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
