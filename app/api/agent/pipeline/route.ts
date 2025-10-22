import { NextRequest, NextResponse } from 'next/server';
import { runAgentPipeline } from '@/lib/agents/pipeline';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, callId } = body;

    if (!userMessage || !callId) {
      return NextResponse.json(
        { error: 'Missing required fields: userMessage, callId' },
        { status: 400 }
      );
    }

    // Run the agent pipeline
    const result = await runAgentPipeline({ userMessage, callId });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in pipeline API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

