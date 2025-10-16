"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntakeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?openCopilot=true");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to FairForm...</p>
      </div>
    </div>
  );
}
