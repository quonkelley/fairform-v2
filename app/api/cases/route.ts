import { NextRequest, NextResponse } from "next/server";

import { createCase, listByUser } from "@/lib/db/casesRepo";
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
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    // Validate request body
    const validationResult = CreateCaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          message: "Invalid request data",
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const caseData = validationResult.data;
    const newCase = await createCase({
      ...caseData,
      userId: user.uid,
    });

    const response = CreateCaseResponseSchema.parse({
      caseId: newCase.id,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to create case", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to create case" },
      { status: 500 }
    );
  }
}
