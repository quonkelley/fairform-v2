import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/server-auth";
import { getCase } from "@/lib/db/casesRepo";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await requireAuth(request);

    // Get case from repository
    const caseData = await getCase(params.id);

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Verify case belongs to user
    if (caseData.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
