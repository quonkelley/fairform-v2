import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI Intake Preview",
};

export default function IntakePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>AI Intake Preview</CardTitle>
          <CardDescription>
            Smart intake is currently available for internal testing only. Share feedback with the team
            to refine the experience before launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              The AI intake flow will guide self-represented litigants through describing their legal issue,
              validating jurisdiction details, and preparing for next steps. This preview confirms the feature
              flag and routing are wired correctly.
            </p>
            <p className="text-sm text-muted-foreground">
              Stub content only — UI and interaction design will be delivered in Sprint 3 stories once the tech
              spike is approved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
