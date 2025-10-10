import { NextRequest, NextResponse } from "next/server";

import { listByCase } from "@/lib/db/stepsRepo";
import { getCase } from "@/lib/db/casesRepo";
import { requireAuth } from "@/lib/auth/server-auth";

// GET /api/cases/[id]/steps - Get steps for a specific case
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const caseId = params.id;
    
    // Validate case ID
    if (!caseId || typeof caseId !== "string") {
      return NextResponse.json(
        { error: "Validation error", message: "Invalid case ID" },
        { status: 400 }
      );
    }

    // Verify user owns the case
    const caseRecord = await getCase(caseId);
    if (!caseRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    if (caseRecord.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const steps = await listByCase(caseId);
    
    return NextResponse.json(steps, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to get case steps", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to load case steps" },
      { status: 500 }
    );
  }
}
