import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold text-foreground">
                FairForm Legal GPS
              </CardTitle>
              <CardDescription>
                Sign in to continue guiding your case journey.
              </CardDescription>
              <p className="text-xs text-muted-foreground">
                Educational resource · Not a substitute for legal advice.
              </p>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground">
            Need help? Visit the{" "}
            <Link href="/docs" className="font-medium text-primary underline">
              FairForm documentation
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
