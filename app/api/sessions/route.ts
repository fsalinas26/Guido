import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions } from '@/lib/state/sessionManager';

/**
 * Get all active sessions
 */
export async function GET(req: NextRequest) {
  try {
    const sessions = getAllSessions();
    return NextResponse.json({ sessions, count: sessions.length });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

