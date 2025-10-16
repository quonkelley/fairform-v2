'use client';

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCase } from "@/lib/hooks/useCreateCase";

const schema = z.object({
  title: z
    .string()
    .min(3, "Enter a short name to help you recognize this case")
    .max(80, "Keep the title under 80 characters"),
  caseType: z.string().min(1, "Select the main case type"),
  jurisdiction: z
    .string()
    .min(2, "Select where this case is filed")
    .max(60),
  notes: z
    .string()
    .max(240, "Keep notes brief (240 characters)")
    .optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  title: "",
  caseType: "",
  jurisdiction: "",
  notes: undefined,
};

const CASE_TYPE_OPTIONS = [
  { value: "eviction", label: "Eviction" },
  { value: "small_claims", label: "Small claims" },
  { value: "family_law", label: "Family law" },
  { value: "other_civil", label: "Other civil matter" },
];

const JURISDICTION_OPTIONS = [
  { value: "marion_in", label: "Marion County, IN" },
  { value: "allen_in", label: "Allen County, IN" },
  { value: "lake_in", label: "Lake County, IN" },
  { value: "other", label: "Other jurisdiction" },
];

type StartCaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null | undefined;
  onSuccess?: () => void;
};

export function StartCaseDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: StartCaseDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createCase = useCreateCase(userId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await createCase.mutateAsync({
        ...values,
      });
      form.reset(DEFAULT_VALUES);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your case.",
      );
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null);
      createCase.reset();
      form.reset(DEFAULT_VALUES);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create case manually</DialogTitle>
          <DialogDescription>
            If you&apos;ve already gathered your case details, you can create a case manually here. 
            Otherwise, consider talking to FairForm for guided assistance with your legal situation.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <Alert variant="destructive" title="We couldn’t save your case">
            <p>{submitError}</p>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case nickname</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Example: Johnson eviction"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CASE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select jurisdiction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JURISDICTION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Share anything we should keep in mind about this case."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="text-xs text-muted-foreground sm:mr-auto">
                💡 Need help? Try talking to FairForm instead for guided assistance.
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCase.isPending}>
                  {createCase.isPending ? "Saving…" : "Save case"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
