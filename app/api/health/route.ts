import { NextResponse } from "next/server";

import { HealthResponseSchema } from "@/lib/validation";

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    const response = HealthResponseSchema.parse({
      ok: true,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      { ok: false, error: "Health check failed" },
      { status: 500 }
    );
  }
}
