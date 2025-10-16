import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/server-auth';
import * as aiSessionsRepo from '@/lib/db/aiSessionsRepo';

/**
 * POST /api/ai/sessions
 * Create a new AI session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { caseId } = body;

    // Create session
    const session = await aiSessionsRepo.createSession({
      userId: user.uid,
      caseId: caseId || null,
      title: 'New Conversation',
    });

    return NextResponse.json({
      sessionId: session.id,
      session,
    });
  } catch (error) {
    console.error('Failed to create AI session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/sessions
 * List user's AI sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // List sessions for user
    const sessions = await aiSessionsRepo.listUserSessions(user.uid);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to list AI sessions:', error);
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 }
    );
  }
}
