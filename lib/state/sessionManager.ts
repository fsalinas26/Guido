/**
 * In-memory session state manager
 */

import { ConversationState, ConversationMessage, ActionRecord, DecisionRecord } from '@/lib/utils/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store (for demo purposes - would use Redis in production)
const sessions = new Map<string, ConversationState>();

/**
 * Create a new conversation session
 */
export function createSession(
  callId: string,
  workerName: string = 'Jake',
  station: string = 'Line 3 - Quality Control'
): ConversationState {
  const session: ConversationState = {
    session_id: uuidv4(),
    worker_name: workerName,
    station: station,
    current_sop_id: undefined,
    current_step: undefined,
    measurements: {},
    decision_history: [],
    actions_executed: [],
    conversation_history: [],
    status: 'active',
    vapi_call_id: callId,
    timestamp_start: new Date(),
    timestamp_last_update: new Date(),
  };
  
  sessions.set(callId, session);
  return session;
}

/**
 * Get existing session by call ID
 */
export function getSession(callId: string): ConversationState | undefined {
  return sessions.get(callId);
}

/**
 * Get or create session
 */
export function getOrCreateSession(
  callId: string,
  workerName?: string,
  station?: string
): ConversationState {
  const existing = sessions.get(callId);
  if (existing) {
    return existing;
  }
  return createSession(callId, workerName, station);
}

/**
 * Update session state
 */
export function updateSession(
  callId: string,
  updates: Partial<ConversationState>
): ConversationState {
  const session = sessions.get(callId);
  if (!session) {
    throw new Error(`Session not found: ${callId}`);
  }
  
  const updated: ConversationState = {
    ...session,
    ...updates,
    timestamp_last_update: new Date(),
  };
  
  sessions.set(callId, updated);
  return updated;
}

/**
 * Add message to conversation history
 */
export function addMessage(
  callId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): void {
  const session = sessions.get(callId);
  if (!session) {
    throw new Error(`Session not found: ${callId}`);
  }
  
  const message: ConversationMessage = {
    role,
    content,
    timestamp: new Date(),
  };
  
  session.conversation_history.push(message);
  session.timestamp_last_update = new Date();
}

/**
 * Add action to executed actions
 */
export function addAction(
  callId: string,
  toolName: string,
  parameters: Record<string, any>,
  result: any
): void {
  const session = sessions.get(callId);
  if (!session) {
    throw new Error(`Session not found: ${callId}`);
  }
  
  const action: ActionRecord = {
    tool_name: toolName,
    parameters,
    result,
    timestamp: new Date(),
  };
  
  session.actions_executed.push(action);
  session.timestamp_last_update = new Date();
}

/**
 * Add decision to history
 */
export function addDecision(
  callId: string,
  step: number,
  decision: string
): void {
  const session = sessions.get(callId);
  if (!session) {
    throw new Error(`Session not found: ${callId}`);
  }
  
  const decisionRecord: DecisionRecord = {
    step,
    decision,
    timestamp: new Date(),
  };
  
  session.decision_history.push(decisionRecord);
  session.timestamp_last_update = new Date();
}

/**
 * Update measurements in session
 */
export function updateMeasurements(
  callId: string,
  measurements: Record<string, any>
): void {
  const session = sessions.get(callId);
  if (!session) {
    throw new Error(`Session not found: ${callId}`);
  }
  
  session.measurements = {
    ...session.measurements,
    ...measurements,
  };
  session.timestamp_last_update = new Date();
}

/**
 * Delete session (cleanup after call ends)
 */
export function deleteSession(callId: string): void {
  sessions.delete(callId);
}

/**
 * Get all active sessions (for debugging/monitoring)
 */
export function getAllSessions(): ConversationState[] {
  return Array.from(sessions.values());
}

/**
 * Clear all sessions (for testing)
 */
export function clearAllSessions(): void {
  sessions.clear();
}

