/**
 * Core TypeScript types for the AI Supervisor application
 */

// ============================================================================
// Weaviate Schema Types
// ============================================================================

export interface SOPChunk {
  sop_id: string;              // e.g., "SOP-QC-015"
  sop_title: string;           // e.g., "Surface Defect Evaluation..."
  category: string;            // e.g., "Quality Control"
  chunk_text: string;          // Main content of this chunk
  chunk_type: 'step' | 'warning' | 'decision' | 'requirement' | 'reference';
  step_number?: number;        // For sequential steps
  equipment_required: string[]; // e.g., ["surface roughness gauge"]
  measurements: string[];      // e.g., ["0.02mm tolerance"]
  decision_point: boolean;     // True if this step requires decision-making
  safety_critical: boolean;    // True if safety-related
  page_number?: number;        // Source page in PDF
}

// ============================================================================
// Session State Types
// ============================================================================

export interface ConversationState {
  session_id: string;
  worker_name: string;
  station: string;              // e.g., "Line 3, Quality Control"
  
  // Current context
  current_sop_id?: string;
  current_step?: number;
  
  // Collected data
  measurements: {
    defect_depth?: string;
    surface_roughness?: string;
    defect_pattern?: string;
  };
  
  // Decision tracking
  decision_history: DecisionRecord[];
  
  // Actions taken
  actions_executed: ActionRecord[];
  
  // Conversation history
  conversation_history: ConversationMessage[];
  
  // Status
  status: 'active' | 'awaiting_input' | 'completed' | 'escalated';
  
  // Vapi call info
  vapi_call_id: string;
  
  timestamp_start: Date;
  timestamp_last_update: Date;
}

export interface DecisionRecord {
  step: number;
  decision: string;
  timestamp: Date;
}

export interface ActionRecord {
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
  timestamp: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// ============================================================================
// Agent Pipeline Types
// ============================================================================

export interface IntentClassificationResult {
  intent: 'quality_issue' | 'procedure_query' | 'equipment_issue' | 'general_question' | 'confirmation';
  confidence: number;
  extracted_entities: {
    part_type?: string;
    issue_type?: string;
    location?: string;
    [key: string]: any;
  };
}

export interface SOPRetrievalResult {
  sop_id: string;
  sop_title: string;
  relevant_chunks: Array<{
    step_number?: number;
    chunk_text: string;
    chunk_type: string;
    similarity: number;
  }>;
  full_sop_context: string;
}

export interface NavigationResult {
  agent_response: string;
  next_step?: number;
  tool_calls: ToolCall[];
  decision_made?: {
    criteria: string;
    outcome: 'QUARANTINE' | 'ACCEPT' | 'ESCALATE';
    reasoning: string;
  };
  requires_user_input: boolean;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResult {
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
  error?: boolean;
  message?: string;
}

// ============================================================================
// Tool Definitions Types
// ============================================================================

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

// ============================================================================
// Logging Types
// ============================================================================

export interface IncidentLog {
  log_id: string;
  session_id: string;
  timestamp: Date;
  
  // Context
  worker_name: string;
  station: string;
  sop_used: string;
  
  // Issue details
  issue_description: string;
  measurements: Record<string, any>;
  
  // Outcome
  decision: string;
  actions_taken: string[];
  resolution_time_seconds: number;
  
  // Compliance
  all_steps_completed: boolean;
  documentation_complete: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AgentPipelineRequest {
  userMessage: string;
  callId: string;
}

export interface AgentPipelineResponse {
  agentResponse: string;
  sessionState: ConversationState;
  error?: string;
}

export interface VapiWebhookEvent {
  type: 'transcript' | 'call-start' | 'call-end' | 'function-call';
  transcript?: {
    text: string;
  };
  call: {
    id: string;
  };
  functionCall?: {
    name: string;
    parameters: Record<string, any>;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

export interface SystemViewState {
  currentAgent: 'intent' | 'retrieval' | 'navigation' | 'execution' | 'logging' | null;
  retrievedChunks: SOPChunk[];
  toolExecutions: ToolResult[];
  pipelineProgress: number;
}

