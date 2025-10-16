import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/server-auth';
import * as aiSessionsRepo from '@/lib/db/aiSessionsRepo';

/**
 * GET /api/ai/sessions/[sessionId]/messages
 * List messages for a specific session with pagination
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

    // Get session to verify ownership
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const after = searchParams.get('after')
      ? parseInt(searchParams.get('after')!, 10)
      : undefined;

    // List messages with pagination
    const result = await aiSessionsRepo.listMessages(params.sessionId, {
      limit,
      after,
    });

    return NextResponse.json({
      items: result.items,
      hasMore: result.hasMore,
      total: result.items.length,
    });
  } catch (error) {
    console.error('Failed to list messages:', error);
    return NextResponse.json(
      { error: 'Failed to list messages' },
      { status: 500 }
    );
  }
}
