import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { calculateCaseProgress } from "@/lib/db/casesRepo";

/**
 * API endpoint to migrate existing cases to have currentStep calculated
 *
 * POST /api/admin/migrate-case-progress
 *
 * This is a one-time migration for Epic 6.5
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user (add admin check in production)
    const user = await requireAuth(request);

    // TODO: In production, verify user is admin
    // For now, any authenticated user can run this

    const db = getAdminFirestore();
    const casesSnapshot = await db.collection("cases").get();

    const results = {
      total: casesSnapshot.size,
      success: 0,
      skipped: 0,
      errors: [] as { caseId: string; error: string }[],
    };

    // Process each case
    for (const doc of casesSnapshot.docs) {
      const caseId = doc.id;
      const caseData = doc.data();

      try {
        // Skip if currentStep already exists
        if (typeof caseData.currentStep === "number") {
          results.skipped++;
          continue;
        }

        // Calculate progress (includes currentStep)
        await calculateCaseProgress(caseId);
        results.success++;
      } catch (error) {
        results.errors.push({
          caseId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      message: "Migration complete",
      results,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error in migration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
