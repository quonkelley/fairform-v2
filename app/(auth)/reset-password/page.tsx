"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/components/auth/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: ResetFormValues) => {
    setErrorMessage(null);
    setStatusMessage(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setStatusMessage(
        "Check your email for a link to reset your password. The link expires shortly for your security.",
      );
      setTimeout(() => {
        router.push(
          `/login?status=${encodeURIComponent(
            "Password reset link sent. Check your inbox and then sign in.",
          )}`,
        );
      }, 4000);
    } catch (error) {
      const firebaseError = error as { code?: string };
      if (firebaseError?.code === "auth/user-not-found") {
        setErrorMessage(
          "We couldn't find an account with that email address. Double-check the spelling or create a new account.",
        );
      } else {
        setErrorMessage("We were unable to send a reset email. Try again soon.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Enter the email associated with your account and we&apos;ll send you a
          secure reset link.
        </p>
      </div>

      {statusMessage ? (
        <Alert variant="success" title="Email sent" className="text-sm">
          {statusMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" title="Unable to send reset email" className="text-sm">
          {errorMessage}
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending email…" : "Send reset link"}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Return to sign in
        </Link>
        .
      </p>
    </div>
  );
}

