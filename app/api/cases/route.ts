import { NextRequest, NextResponse } from "next/server";

import { createCaseWithJourney, listByUser } from "@/lib/db/casesRepo";
import { CreateCaseSchema, CreateCaseResponseSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth/server-auth";

// GET /api/cases - List all cases for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const cases = await listByUser(user.uid);
    
    return NextResponse.json(cases, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to list cases", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to load cases" },
      { status: 500 }
    );
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  console.log("[POST /api/cases] Request received");
  try {
    console.log("[POST /api/cases] Authenticating user...");
    const user = await requireAuth(request);
    console.log("[POST /api/cases] User authenticated:", user.uid);

    const body = await request.json();
    console.log("[POST /api/cases] Request body:", body);

    // Validate request body
    const validationResult = CreateCaseSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("[POST /api/cases] Validation failed:", validationResult.error.issues);
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Invalid request data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const caseData = validationResult.data;
    console.log("[POST /api/cases] Creating case with data:", caseData);

    const newCase = await createCaseWithJourney({
      ...caseData,
      userId: user.uid,
    });

    console.log("[POST /api/cases] Case created successfully:", newCase.id);

    const response = CreateCaseResponseSchema.parse({
      caseId: newCase.id,
    });

    console.log("[POST /api/cases] Sending response:", response);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      console.error("[POST /api/cases] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[POST /api/cases] Error creating case:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to create case" },
      { status: 500 }
    );
  }
}
