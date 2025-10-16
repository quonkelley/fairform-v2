import { NextResponse } from "next/server";

import { HealthResponseSchema, type HealthResponse } from "@/lib/validation";

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    const payload: HealthResponse = {
      ok: true,
      demo: false,
      timestamp: new Date().toISOString(),
    };
    const response = HealthResponseSchema.parse(payload);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      { ok: false, error: "Health check failed" },
      { status: 500 }
    );
  }
}
