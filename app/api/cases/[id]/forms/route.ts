import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/server-auth";
import { getCase } from "@/lib/db/casesRepo";
import { listByCase } from "@/lib/db/formsRepo";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const caseId = params.id;

    if (!caseId || typeof caseId !== "string") {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Invalid case ID",
        },
        { status: 400 }
      );
    }

    const caseRecord = await getCase(caseId);
    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (caseRecord.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formsResult = await listByCase(caseId, user.uid);
    if (!formsResult.success) {
      return NextResponse.json(
        {
          error: "Unable to load forms",
          message: formsResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(formsResult.data, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Failed to list completed forms for case", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
