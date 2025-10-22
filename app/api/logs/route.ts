import { NextRequest, NextResponse } from 'next/server';
import { getAllIncidentLogs } from '@/lib/agents/logger';

/**
 * Get all incident logs
 */
export async function GET(req: NextRequest) {
  try {
    const logs = getAllIncidentLogs();
    return NextResponse.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Error getting logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

