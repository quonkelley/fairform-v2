import { NextRequest, NextResponse } from "next/server";

import { createReminder } from "@/lib/db/remindersRepo";
import { getCase } from "@/lib/db/casesRepo";
import { CreateReminderSchema, CreateReminderResponseSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth/server-auth";

// POST /api/reminders - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    // Validate request body
    const validationResult = CreateReminderSchema.safeParse(body);
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

    const reminderData = validationResult.data;

    // Verify user owns the case this reminder is for
    const caseRecord = await getCase(reminderData.caseId);
    if (!caseRecord || caseRecord.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newReminder = await createReminder({
      ...reminderData,
      userId: user.uid,
    });

    const response = CreateReminderResponseSchema.parse({
      reminderId: newReminder.id,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.error("Failed to create reminder", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Unable to create reminder" },
      { status: 500 }
    );
  }
}
