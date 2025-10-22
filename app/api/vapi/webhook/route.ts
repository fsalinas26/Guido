import { NextRequest, NextResponse } from 'next/server';
import { runAgentPipeline } from '@/lib/agents/pipeline';
import { createSession, deleteSession } from '@/lib/state/sessionManager';

/**
 * Vapi Webhook Handler
 * Handles events from Vapi voice calls
 */
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    
    console.log('Vapi webhook event:', event.type);
    
    switch (event.type) {
      case 'call-start':
        // Initialize session when call starts
        const callId = event.call.id;
        createSession(callId);
        
        return NextResponse.json({
          message: "Hi, this is your AI Supervisor. I'm here to help you with any questions about procedures, quality issues, or equipment. What can I help you with today?"
        });
      
      case 'transcript':
        // Worker spoke - run agent pipeline
        const userMessage = event.transcript?.text;
        const transcriptCallId = event.call.id;
        
        if (!userMessage) {
          return NextResponse.json({
            message: "I didn't catch that. Could you repeat?"
          });
        }
        
        // Run the agent pipeline
        const response = await runAgentPipeline({
          userMessage,
          callId: transcriptCallId,
        });
        
        // Return response for Vapi to speak
        return NextResponse.json({
          message: response.agentResponse
        });
      
      case 'call-end':
        // Clean up session when call ends
        const endCallId = event.call.id;
        deleteSession(endCallId);
        
        return NextResponse.json({ success: true });
      
      case 'function-call':
        // Handle function calls if needed
        return NextResponse.json({
          result: 'Function call handled'
        });
      
      default:
        console.log('Unhandled Vapi event type:', event.type);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error in Vapi webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

