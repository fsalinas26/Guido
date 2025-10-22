/**
 * Agent 5: Logger
 * Records conversation outcomes and incidents
 */

import { ConversationState, IncidentLog, IntentClassificationResult } from '@/lib/utils/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory log storage (would be database in production)
const incidentLogs: IncidentLog[] = [];

export async function logInteraction(
  session: ConversationState,
  intent: IntentClassificationResult,
  sopUsed: string,
  userMessage: string,
  agentResponse: string,
  toolResults?: any[]
): Promise<{ logged: boolean; log_id?: string }> {
  try {
    // Only create incident log for quality issues with decisions
    if (intent.intent === 'quality_issue' && session.decision_history.length > 0) {
      const log = createIncidentLog(session, sopUsed, toolResults);
      incidentLogs.push(log);
      
      console.log('Incident logged:', log.log_id);
      
      return {
        logged: true,
        log_id: log.log_id
      };
    }
    
    // For other interactions, just log to console
    console.log('Interaction logged:', {
      session_id: session.session_id,
      worker: session.worker_name,
      intent: intent.intent,
      sop: sopUsed,
      user_message: userMessage,
      agent_response: agentResponse
    });
    
    return { logged: true };
    
  } catch (error) {
    console.error('Error logging interaction:', error);
    return { logged: false };
  }
}

function createIncidentLog(
  session: ConversationState,
  sopUsed: string,
  toolResults?: any[]
): IncidentLog {
  const resolutionTime = Math.floor(
    (session.timestamp_last_update.getTime() - session.timestamp_start.getTime()) / 1000
  );
  
  // Extract measurements from tool results
  const measurements: Record<string, any> = {};
  if (toolResults) {
    for (const result of toolResults) {
      if (!result.error) {
        measurements[result.tool_name] = result.result;
      }
    }
  }
  
  // Get final decision
  const finalDecision = session.decision_history[session.decision_history.length - 1];
  
  return {
    log_id: `INC-${Date.now()}-${uuidv4().slice(0, 8)}`,
    session_id: session.session_id,
    timestamp: new Date(),
    worker_name: session.worker_name,
    station: session.station,
    sop_used: sopUsed,
    issue_description: extractIssueDescription(session),
    measurements: measurements,
    decision: finalDecision?.decision || 'In progress',
    actions_taken: session.actions_executed.map(a => a.tool_name),
    resolution_time_seconds: resolutionTime,
    all_steps_completed: session.status === 'completed',
    documentation_complete: true
  };
}

function extractIssueDescription(session: ConversationState): string {
  // Get first user message
  const firstUserMessage = session.conversation_history.find(msg => msg.role === 'user');
  return firstUserMessage?.content || 'Quality issue reported';
}

/**
 * Get all incident logs (for reporting/analytics)
 */
export function getAllIncidentLogs(): IncidentLog[] {
  return [...incidentLogs];
}

/**
 * Get incident log by ID
 */
export function getIncidentLog(logId: string): IncidentLog | undefined {
  return incidentLogs.find(log => log.log_id === logId);
}

/**
 * Clear all logs (for testing)
 */
export function clearLogs(): void {
  incidentLogs.length = 0;
}

