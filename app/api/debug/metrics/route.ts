import { NextRequest, NextResponse } from "next/server";
import { caseCreationMonitor } from "@/lib/monitoring/case-creation-monitor";

export async function GET(request: NextRequest) {
  try {
    // In production, you might want to add authentication/authorization here
    // to ensure only authorized users can access monitoring data
    
    const metrics = caseCreationMonitor.getMetrics();
    const healthStatus = caseCreationMonitor.getHealthStatus();
    const recentEvents = caseCreationMonitor.getRecentEvents(20);

    return NextResponse.json({
      metrics,
      healthStatus,
      recentEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch monitoring metrics:', error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
