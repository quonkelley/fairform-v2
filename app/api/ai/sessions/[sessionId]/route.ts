import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/server-auth';
import * as aiSessionsRepo from '@/lib/db/aiSessionsRepo';

/**
 * GET /api/ai/sessions/[sessionId]
 * Get a specific AI session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get session
    const session = await aiSessionsRepo.getSession(params.sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user owns this session
    if (session.userId !== user.uid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to get AI session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}
