import { NextRequest, NextResponse } from "next/server";

import { updateStepCompletion, getStep } from "@/lib/db/stepsRepo";
import { getCase } from "@/lib/db/casesRepo";
import { UpdateStepCompletionSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth/server-auth";

// PATCH /api/steps/[id]/complete - Update step completion status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    const stepId = params.id;
    
    // Validate step ID
    if (!stepId || typeof stepId !== "string") {
      return NextResponse.json(
        { error: "Validation error", message: "Invalid step ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = UpdateStepCompletionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "Invalid request data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Verify user owns the case this step belongs to
    const step = await getStep(stepId);
    if (!step) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    const caseRecord = await getCase(step.caseId);
    if (!caseRecord || caseRecord.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedStep = await updateStepCompletion(stepId, updateData);
    
    return NextResponse.json({ success: true, step: updatedStep }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to update step completion", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to update step completion" },
      { status: 500 }
    );
  }
}
