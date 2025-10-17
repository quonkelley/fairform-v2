/**
 * Session Lifecycle Cron Job
 *
 * Scheduled endpoint for automated session archiving and cleanup.
 * Runs daily at 2 AM UTC via Vercel Cron.
 *
 * @see docs/stories/13.12.session-lifecycle-management.md
 */

// Mark as dynamic route to prevent static generation
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { SessionLifecycleManager } from "@/lib/ai/sessionLifecycle";
import { LifecycleMonitor } from "@/lib/ai/lifecycleMonitor";

/**
 * GET handler for cron job execution
 *
 * Vercel Cron will call this endpoint on schedule.
 * Protected by authorization header with CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const expectedAuth = process.env.CRON_SECRET
      ? `Bearer ${process.env.CRON_SECRET}`
      : null;

    if (!expectedAuth) {
      console.warn("CRON_SECRET not configured, cron job is unsecured");
    } else if (authHeader !== expectedAuth) {
      console.error("Unauthorized cron job attempt", {
        hasAuth: !!authHeader,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting session lifecycle cleanup...", {
      timestamp: new Date().toISOString(),
    });

    const lifecycleManager = new SessionLifecycleManager();
    const monitor = new LifecycleMonitor();

    // Run cleanup cycle
    const { archive, deletion } = await lifecycleManager.runCleanupCycle();

    // Update metrics
    monitor.updateArchiveMetrics(archive);
    monitor.updateDeleteMetrics(deletion);

    // Collect storage metrics
    const storageUsage = await monitor.collectStorageMetrics();

    // Log metrics
    monitor.logMetrics();

    // Build summary response
    const summary = {
      timestamp: new Date().toISOString(),
      archive: {
        sessionsArchived: archive.archived,
        errors: archive.errors,
        durationMs: archive.duration,
      },
      deletion: {
        sessionsDeleted: deletion.deleted,
        errors: deletion.errors,
        durationMs: deletion.duration,
      },
      totalDuration: archive.duration + deletion.duration,
      storageUsage,
      metrics: monitor.getMetrics(),
    };

    console.log("Session lifecycle cleanup completed:", summary);

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error("Session lifecycle cleanup failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
