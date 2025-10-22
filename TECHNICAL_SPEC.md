# Comprehensive Technical Specification: AI Supervisor for Manufacturing SOP Retrieval

## Executive Summary

**Project Name**: AI Supervisor - Voice-Enabled Manufacturing SOP Assistant  
**Target**: Hackathon demo showcasing multi-agent orchestration for enterprise manufacturing  
**Demo Scenario**: Quality control worker "Jake" receives real-time, voice-based guidance through surface defect evaluation procedures on brake rotors

### Value Proposition
- **Current State**: 15-20 minutes downtime while finding supervisor, manual SOP lookup, missed steps, poor documentation
- **Our Solution**: Instant voice access to procedures, step-by-step guidance, real-time decision support, automatic logging

---

## 1. Technical Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Worker Jake)                       │
│                     Voice Input/Output via Vapi                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (localhost)                  │
│  ┌────────────────────┐        ┌──────────────────────────┐    │
│  │   Worker View      │        │    System View           │    │
│  │ - Call controls    │        │ - Agent reasoning        │    │
│  │ - Transcript       │        │ - SOP chunks retrieved   │    │
│  │ - Guidance steps   │        │ - Tools being called     │    │
│  └────────────────────┘        └──────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Next.js API Routes (Backend)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Sequential Agent Pipeline                     │    │
│  │                                                          │    │
│  │  1. Intent Classifier                                   │    │
│  │     ↓                                                    │    │
│  │  2. SOP Retriever (Weaviate Cloud)                      │    │
│  │     ↓                                                    │    │
│  │  3. Decision Tree Navigator (LlamaIndex + Friendli)     │    │
│  │     ↓                                                    │    │
│  │  4. Action Executor (Simulated Tools)                   │    │
│  │     ↓                                                    │    │
│  │  5. Logger                                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Conversation State: Hybrid                                      │
│  - Vapi: Conversation transcript                                │
│  - Backend: Decision state (current SOP, measurements, actions) │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services (Cloud)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │    Vapi     │  │  Weaviate    │  │  Friendli API       │   │
│  │ (STT/TTS)   │  │ (Vector DB)  │  │ (Open-source LLMs)  │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            LlamaParse (LlamaCloud)                       │   │
│  │      (PDF Parsing for SOP ingestion)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend Framework** | Next.js 14+ (App Router) | React-based UI, API routes |
| **Voice Interface** | Vapi ([docs](https://docs.vapi.ai/quickstart/introduction)) | Speech-to-text & text-to-speech |
| **Agent Framework** | LlamaIndex.TS ([docs](https://developers.llamaindex.ai/typescript/framework/)) | Retrieval, reasoning, action execution |
| **LLM Provider** | Friendli ([docs](https://friendli.ai/docs/guides/overview)) | Open-source models with OpenAI compatibility |
| **Vector Database** | Weaviate Cloud ([docs](https://docs.weaviate.io/weaviate)) | SOP storage and semantic search |
| **Document Parsing** | LlamaParse (LlamaCloud) | PDF → Structured data conversion |
| **Language** | TypeScript | Type safety across stack |
| **State Management** | React Context + API routes | Session state management |

---

## 2. Data Models & Schema

### 2.1 Weaviate Schema: SOP Chunks

```typescript
// Weaviate Collection Schema
interface SOPChunk {
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
  embedding: number[];         // Vector embedding (auto-generated by Weaviate)
}
```

**Weaviate Configuration**:
- **Vectorizer**: `text2vec-openai` or `text2vec-cohere`
- **Distance Metric**: Cosine similarity
- **Properties to Index**: `chunk_text`, `sop_title`, `category`

### 2.2 Conversation State Model

```typescript
// Backend Session State
interface ConversationState {
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
  decision_history: {
    step: number;
    decision: string;
    timestamp: Date;
  }[];
  
  // Actions taken
  actions_executed: {
    tool_name: string;
    parameters: Record<string, any>;
    result: any;
    timestamp: Date;
  }[];
  
  // Status
  status: 'active' | 'awaiting_input' | 'completed' | 'escalated';
  
  // Vapi call info
  vapi_call_id: string;
  
  timestamp_start: Date;
  timestamp_last_update: Date;
}
```

### 2.3 Tool Definitions

```typescript
// Simulated Tool Schemas (OpenAI Function Calling format)
const TOOLS = [
  {
    type: "function",
    function: {
      name: "measureDefectDepth",
      description: "Measures the depth of surface defects on brake rotors using a surface roughness gauge",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Location of defect (e.g., 'center', 'edge', 'face')"
          },
          defect_type: {
            type: "string",
            enum: ["scratch", "pit", "gouge"],
            description: "Type of defect being measured"
          }
        },
        required: ["location", "defect_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "checkSurfaceRoughness",
      description: "Checks overall surface roughness of brake rotor using calibrated gauge",
      parameters: {
        type: "object",
        properties: {
          measurement_points: {
            type: "number",
            description: "Number of points to measure (typically 3-5)"
          }
        },
        required: ["measurement_points"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyzeDefectPattern",
      description: "Analyzes and identifies the pattern type of surface defects",
      parameters: {
        type: "object",
        properties: {
          defect_description: {
            type: "string",
            description: "Worker's description of the defect appearance"
          }
        },
        required: ["defect_description"]
      }
    }
  }
];
```

---

## 3. Sequential Agent Pipeline Design

### 3.1 Agent 1: Intent Classifier

**Purpose**: Determine what the worker needs

**Input**: 
- Worker's voice input (transcribed by Vapi)
- Conversation history

**Processing**:
```typescript
// Classify intent using Friendli LLM
const intents = [
  'quality_issue',      // Defect/problem with parts
  'procedure_query',    // How-to question
  'equipment_issue',    // Tool/machine problem
  'general_question',   // Other queries
  'confirmation'        // Confirming completion
];
```

**Output**:
```typescript
{
  intent: 'quality_issue',
  confidence: 0.95,
  extracted_entities: {
    part_type: 'brake rotor',
    issue_type: 'surface defects',
    location: 'Line 3'
  }
}
```

### 3.2 Agent 2: SOP Retriever (Weaviate)

**Purpose**: Find relevant SOP chunks

**Input**: Intent classifier output + worker query

**Processing**:
```typescript
// Semantic search in Weaviate
const query = `Surface defect evaluation for brake rotors`;

const searchResults = await weaviateClient
  .graphql
  .get()
  .withClassName('SOPChunk')
  .withNearText({ concepts: [query] })
  .withFields('sop_id sop_title chunk_text chunk_type step_number')
  .withLimit(5)
  .do();
```

**Filtering Strategy**:
- Primary: Semantic similarity
- Secondary filters:
  - `category: "Quality Control"`
  - `chunk_type: ["step", "decision"]`
  - Prioritize chunks with `decision_point: true`

**Output**:
```typescript
{
  sop_id: 'SOP-QC-015',
  relevant_chunks: [
    { step_number: 1, chunk_text: '...', similarity: 0.92 },
    { step_number: 2, chunk_text: '...', similarity: 0.89 },
    // ...
  ],
  full_sop_context: string // Assembled from chunks
}
```

### 3.3 Agent 3: Decision Tree Navigator (LlamaIndex + Friendli)

**Purpose**: Guide worker through SOP steps and make decisions

**Input**:
- Retrieved SOP context
- Conversation state (measurements collected, current step)
- Worker's latest input

**Processing**:
```typescript
// LlamaIndex agent with Friendli LLM
import { OpenAI } from 'llamaindex';

const llm = new OpenAI({
  apiKey: process.env.FRIENDLI_API_KEY,
  baseURL: 'https://api.friendli.ai/serverless/v1',
  model: 'meta-llama-3.1-70b-instruct', // Or another suitable model
  temperature: 0.2 // Lower temperature for consistent SOP guidance
});

// System prompt for navigation
const systemPrompt = `
You are an AI Manufacturing Supervisor helping a quality control worker through SOP-QC-015.

Current Context:
- SOP: ${sopContext}
- Current Step: ${currentStep}
- Measurements Collected: ${JSON.stringify(measurements)}

Your role:
1. Guide the worker through each step sequentially
2. Ask clarifying questions when needed
3. Use available tools to collect measurements
4. Make decisions based on SOP criteria
5. Speak clearly and concisely (this is voice interaction)

Decision Rules from SOP-QC-015:
- If defect depth > 0.02mm: QUARANTINE required
- If defect depth <= 0.02mm: ACCEPT with documentation
- Surface roughness must be < Ra 1.6µm
`;
```

**Tool Calling**:
Uses Friendli's [tool calling capabilities](https://friendli.ai/docs/guides/tool-calling) to invoke measurement tools

**Output**:
```typescript
{
  agent_response: string,        // Natural language response for worker
  next_step: number,             // Which step to proceed to
  tool_calls: ToolCall[],        // Tools to execute
  decision_made: {               // If a decision point was reached
    criteria: string,
    outcome: 'QUARANTINE' | 'ACCEPT' | 'ESCALATE',
    reasoning: string
  },
  requires_user_input: boolean   // Wait for worker response?
}
```

### 3.4 Agent 4: Action Executor

**Purpose**: Execute simulated tools and log actions

**Input**: Tool calls from Decision Navigator

**Processing**:
```typescript
// Simulated tool implementations
const toolImplementations = {
  measureDefectDepth: (location: string, defect_type: string) => {
    // Simulate realistic measurements
    const depths = {
      'scratch': () => Math.random() * 0.03, // 0-0.03mm
      'pit': () => 0.01 + Math.random() * 0.02, // 0.01-0.03mm
      'gouge': () => 0.02 + Math.random() * 0.02, // 0.02-0.04mm
    };
    
    const depth = depths[defect_type]();
    
    return {
      depth_mm: depth.toFixed(3),
      location: location,
      tolerance_exceeded: depth > 0.02,
      timestamp: new Date().toISOString()
    };
  },
  
  checkSurfaceRoughness: (measurement_points: number) => {
    // Simulate Ra (roughness average) measurements
    const measurements = Array.from({ length: measurement_points }, 
      () => (0.8 + Math.random() * 1.2).toFixed(2) // Ra 0.8-2.0µm
    );
    
    const average = measurements.reduce((sum, val) => sum + parseFloat(val), 0) / measurement_points;
    
    return {
      measurements_Ra_um: measurements,
      average_Ra_um: average.toFixed(2),
      spec_limit_Ra_um: 1.6,
      within_spec: average <= 1.6,
      timestamp: new Date().toISOString()
    };
  },
  
  analyzeDefectPattern: (defect_description: string) => {
    // Simple keyword-based pattern matching
    const patterns = {
      circular: ['circular', 'round', 'ring', 'spiral'],
      linear: ['straight', 'line', 'linear', 'parallel'],
      random: ['random', 'scattered', 'multiple', 'pitting']
    };
    
    let identified_pattern = 'random';
    for (const [pattern, keywords] of Object.entries(patterns)) {
      if (keywords.some(kw => defect_description.toLowerCase().includes(kw))) {
        identified_pattern = pattern;
        break;
      }
    }
    
    return {
      pattern_type: identified_pattern,
      description: defect_description,
      likely_cause: {
        circular: 'Machining process',
        linear: 'Handling or transport damage',
        random: 'Material defect or contamination'
      }[identified_pattern],
      timestamp: new Date().toISOString()
    };
  }
};
```

**Output**:
```typescript
{
  tool_results: {
    [tool_name: string]: any
  },
  actions_logged: boolean
}
```

### 3.5 Agent 5: Logger

**Purpose**: Record conversation, decisions, and outcomes

**Input**: Complete conversation state + final outcomes

**Processing**:
```typescript
interface IncidentLog {
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
```

**Output**:
```typescript
{
  log_saved: boolean,
  log_id: string,
  summary: string // Human-readable summary for worker
}
```

---

## 4. Next.js Application Structure

### 4.1 Project Structure

```
/guido
├── app/
│   ├── page.tsx                          # Main demo page (dual-view UI)
│   ├── layout.tsx                        # Root layout
│   ├── api/
│   │   ├── vapi/
│   │   │   ├── webhook/route.ts          # Vapi webhook handler
│   │   │   └── call/route.ts             # Start/end call endpoints
│   │   ├── agent/
│   │   │   ├── classify/route.ts         # Intent classifier
│   │   │   ├── retrieve/route.ts         # SOP retrieval
│   │   │   ├── navigate/route.ts         # Decision tree navigator
│   │   │   ├── execute/route.ts          # Tool executor
│   │   │   └── log/route.ts              # Logger
│   │   └── session/
│   │       ├── create/route.ts           # Create session
│   │       ├── [id]/route.ts             # Get/update session
│   │       └── [id]/state/route.ts       # Session state management
│   └── components/
│       ├── WorkerView.tsx                # Left panel: call interface
│       ├── SystemView.tsx                # Right panel: agent visualization
│       ├── CallControls.tsx              # Vapi call controls
│       ├── TranscriptDisplay.tsx         # Live transcript
│       ├── AgentPipeline.tsx             # Visual pipeline status
│       └── SOPDisplay.tsx                # Current SOP steps
├── lib/
│   ├── agents/
│   │   ├── intentClassifier.ts           # Agent 1 logic
│   │   ├── sopRetriever.ts               # Agent 2 logic (Weaviate)
│   │   ├── decisionNavigator.ts          # Agent 3 logic (LlamaIndex)
│   │   ├── actionExecutor.ts             # Agent 4 logic (tools)
│   │   └── logger.ts                     # Agent 5 logic
│   ├── tools/
│   │   ├── definitions.ts                # Tool schemas
│   │   └── implementations.ts            # Simulated tool functions
│   ├── clients/
│   │   ├── weaviate.ts                   # Weaviate client config
│   │   ├── friendli.ts                   # Friendli API client
│   │   └── vapi.ts                       # Vapi client
│   ├── state/
│   │   └── sessionManager.ts             # In-memory session storage
│   └── utils/
│       ├── prompts.ts                    # System prompts
│       └── types.ts                      # TypeScript types
├── scripts/
│   ├── generateSOPs.ts                   # Generate 20-30 synthetic SOPs
│   ├── parsePDFs.ts                      # Parse PDFs with LlamaParse
│   └── seedWeaviate.ts                   # Load SOPs into Weaviate
├── data/
│   ├── sops/                             # Generated SOP PDFs
│   │   ├── SOP-QC-015.pdf               # Primary deep implementation
│   │   └── ... (20-30 SOPs)
│   └── parsed/                           # Parsed structured data (JSON)
├── .env.local                            # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 Key API Routes

#### `/api/vapi/webhook` - Vapi Webhook Handler

```typescript
// app/api/vapi/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runAgentPipeline } from '@/lib/agents/pipeline';

export async function POST(req: NextRequest) {
  const event = await req.json();
  
  switch (event.type) {
    case 'transcript':
      // Worker spoke - run agent pipeline
      const userMessage = event.transcript.text;
      const callId = event.call.id;
      
      // Run sequential pipeline
      const response = await runAgentPipeline({
        userMessage,
        callId,
      });
      
      // Return response for Vapi to speak
      return NextResponse.json({
        message: response.agentResponse
      });
      
    case 'call-start':
      // Initialize session
      // ...
      
    case 'call-end':
      // Finalize logging
      // ...
  }
}
```

#### `/api/agent/navigate` - Decision Tree Navigator

```typescript
// app/api/agent/navigate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'llamaindex';
import { TOOLS } from '@/lib/tools/definitions';

export async function POST(req: NextRequest) {
  const { sopContext, conversationState, userMessage } = await req.json();
  
  const llm = new OpenAI({
    apiKey: process.env.FRIENDLI_API_KEY!,
    baseURL: 'https://api.friendli.ai/serverless/v1',
    model: 'meta-llama-3.1-70b-instruct',
    temperature: 0.2
  });
  
  const messages = [
    { role: 'system', content: buildNavigatorPrompt(sopContext, conversationState) },
    ...conversationState.history,
    { role: 'user', content: userMessage }
  ];
  
  const completion = await llm.chat({
    messages,
    tools: TOOLS
  });
  
  // Handle tool calls if present
  const toolCalls = completion.message.tool_calls || [];
  
  return NextResponse.json({
    response: completion.message.content,
    toolCalls,
    nextStep: extractNextStep(completion.message.content)
  });
}
```

### 4.3 Frontend Components

#### Dual-View Layout

```typescript
// app/page.tsx
export default function DemoPage() {
  return (
    <div className="h-screen flex">
      {/* Left: Worker View */}
      <div className="w-1/2 border-r">
        <WorkerView />
      </div>
      
      {/* Right: System View */}
      <div className="w-1/2 bg-gray-50">
        <SystemView />
      </div>
    </div>
  );
}

// app/components/WorkerView.tsx
export function WorkerView() {
  return (
    <div className="p-6">
      <h1>AI Supervisor</h1>
      <div className="mb-4">
        <span>Worker: Jake</span>
        <span>Station: Line 3 - Quality Control</span>
      </div>
      
      <CallControls />
      <TranscriptDisplay />
      <SOPDisplay />
    </div>
  );
}

// app/components/SystemView.tsx
export function SystemView() {
  return (
    <div className="p-6">
      <h2>Agent System View</h2>
      <AgentPipeline />
      <RetrievalDisplay />
      <ToolExecutionLog />
    </div>
  );
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation Setup (Days 1-2)

**Tasks**:
1. ✅ Initialize Next.js project with TypeScript
2. ✅ Set up environment variables
3. ✅ Configure Weaviate Cloud instance
4. ✅ Set up Vapi account and test basic call
5. ✅ Set up Friendli API access
6. ✅ Install dependencies:
   ```bash
   npm install llamaindex weaviate-ts-client @vapi-ai/web openai
   ```

**Deliverable**: Project scaffolding with all APIs accessible

### Phase 2: SOP Data Pipeline (Days 2-3)

**Tasks**:
1. ✅ Create SOP generation script using LLM
2. ✅ Generate 20-30 synthetic SOP PDFs
3. ✅ Manually create detailed SOP-QC-015 (or use existing)
4. ✅ Implement PDF parsing with LlamaParse
5. ✅ Create Weaviate schema and seed script
6. ✅ Load all SOPs into Weaviate

**Deliverable**: Weaviate populated with 20-30 SOPs, SOP-QC-015 richly detailed

### Phase 3: Agent Pipeline (Days 3-5)

**Tasks**:
1. ✅ Implement Agent 1: Intent Classifier
2. ✅ Implement Agent 2: SOP Retriever (Weaviate integration)
3. ✅ Implement Agent 3: Decision Navigator (LlamaIndex + Friendli)
4. ✅ Implement Agent 4: Action Executor (simulated tools)
5. ✅ Implement Agent 5: Logger
6. ✅ Create pipeline orchestrator
7. ✅ Implement session state management

**Deliverable**: Complete backend pipeline working end-to-end

### Phase 4: Vapi Integration (Days 5-6)

**Tasks**:
1. ✅ Implement Vapi webhook handler
2. ✅ Connect webhook to agent pipeline
3. ✅ Test voice input → agent response → voice output flow
4. ✅ Handle conversation state across Vapi callbacks
5. ✅ Implement error handling for voice failures

**Deliverable**: Fully functional voice interface

### Phase 5: Frontend UI (Days 6-7)

**Tasks**:
1. ✅ Build WorkerView component
2. ✅ Build SystemView component
3. ✅ Implement real-time transcript display
4. ✅ Implement agent pipeline visualization
5. ✅ Add WebSocket or polling for live updates
6. ✅ Style with Tailwind CSS for clean, professional look

**Deliverable**: Polished dual-view interface

### Phase 6: Demo Scenarios & Testing (Days 7-8)

**Tasks**:
1. ✅ Create 3-5 test scenarios for SOP-QC-015
2. ✅ Test each conversation path
3. ✅ Fine-tune prompts for natural conversation
4. ✅ Optimize response times
5. ✅ Prepare demo script and talking points
6. ✅ Record backup video demonstration

**Deliverable**: Battle-tested demo ready for judges

### Phase 7: Polish & Presentation (Day 8)

**Tasks**:
1. ✅ Add visual polish (animations, transitions)
2. ✅ Create explainer text for System View
3. ✅ Test on demo hardware/network
4. ✅ Prepare presentation deck
5. ✅ Practice live demo

**Deliverable**: Competition-ready presentation

---

## 6. Environment Variables

```bash
# .env.local

# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER=your_vapi_phone_number
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key

# Weaviate Cloud
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your_weaviate_api_key

# Friendli API
FRIENDLI_API_KEY=your_friendli_api_key
FRIENDLI_BASE_URL=https://api.friendli.ai/serverless/v1

# LlamaCloud (for LlamaParse)
LLAMA_CLOUD_API_KEY=your_llamacloud_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 7. Error Handling Strategy

### 7.1 Voice Interface Errors

```typescript
// Vapi connection failures
try {
  await vapiClient.start();
} catch (error) {
  // Fallback: Show text input option
  console.error('Vapi connection failed:', error);
  setFallbackMode('text');
}
```

### 7.2 LLM/API Failures

```typescript
// Friendli API timeout or error
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;

async function callFriendliWithRetry(messages, retries = 0) {
  try {
    const response = await Promise.race([
      llm.chat({ messages }),
      timeout(TIMEOUT_MS)
    ]);
    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return callFriendliWithRetry(messages, retries + 1);
    }
    // Fallback: Use cached response or graceful error
    return {
      message: {
        content: "I'm experiencing technical difficulties. Please repeat your question."
      }
    };
  }
}
```

### 7.3 Weaviate Retrieval Failures

```typescript
// No SOPs found
if (searchResults.length === 0) {
  return {
    response: "I couldn't find a relevant SOP. Could you describe the issue in more detail?",
    needsEscalation: true
  };
}
```

### 7.4 Tool Execution Errors

```typescript
// Simulated tool failures (for realism)
function executeToolWithValidation(toolName, params) {
  // Validate parameters
  if (!validateToolParams(toolName, params)) {
    return {
      error: true,
      message: `Invalid parameters for ${toolName}. Please try again.`
    };
  }
  
  try {
    return toolImplementations[toolName](params);
  } catch (error) {
    return {
      error: true,
      message: `Tool execution failed. Please check equipment and retry.`
    };
  }
}
```

---

## 8. Testing Plan

### 8.1 Unit Tests

```typescript
// Test each agent independently
describe('Intent Classifier', () => {
  it('should classify quality issues correctly', async () => {
    const result = await classifyIntent("I see scratches on the brake rotors");
    expect(result.intent).toBe('quality_issue');
  });
});

describe('SOP Retriever', () => {
  it('should retrieve SOP-QC-015 for defect queries', async () => {
    const result = await retrieveSOPs("surface defects brake rotor");
    expect(result.sop_id).toBe('SOP-QC-015');
  });
});

describe('Tool Executor', () => {
  it('should return realistic measurements', () => {
    const result = measureDefectDepth('center', 'scratch');
    expect(result.depth_mm).toMatch(/^\d+\.\d{3}$/);
  });
});
```

### 8.2 Integration Tests

```typescript
// Test full pipeline
describe('Agent Pipeline', () => {
  it('should handle complete SOP-QC-015 scenario', async () => {
    const scenario = {
      messages: [
        "I'm seeing scratches on brake rotors from Line 3",
        "They're straight line scratches",
        // ... full conversation
      ]
    };
    
    const result = await runFullScenario(scenario);
    expect(result.finalDecision).toBeDefined();
    expect(result.allStepsCompleted).toBe(true);
  });
});
```

### 8.3 Voice Integration Tests

```typescript
// Test Vapi webhook handling
describe('Vapi Webhook', () => {
  it('should process transcript events', async () => {
    const mockEvent = {
      type: 'transcript',
      transcript: { text: 'Test message' },
      call: { id: 'test-call-123' }
    };
    
    const response = await POST(mockEvent);
    expect(response.status).toBe(200);
  });
});
```

### 8.4 Demo Scenario Scripts

**Scenario 1: Happy Path - Minor Defects (ACCEPT)**
```
Jake: "AI Supervisor, I'm seeing some light scratches on these brake rotors"
AI: "I'm checking the surface defect protocol. Can you describe the scratches?"
Jake: "They're light, straight line scratches on the surface"
AI: "Let me measure the depth. [calls measureDefectDepth] The depth is 0.015mm, 
     which is within the 0.02mm tolerance. This batch is acceptable. 
     Please document the observation and continue production."
```

**Scenario 2: Decision Path - Exceeds Tolerance (QUARANTINE)**
```
Jake: "I'm seeing deep pitting on batch 47 from Line 3"
AI: "I'm pulling up SOP-QC-015. Let me analyze the defect pattern. 
     [calls analyzeDefectPattern] This appears to be random pitting. 
     Now checking depth... [calls measureDefectDepth] 
     The depth is 0.024mm, which exceeds the 0.02mm tolerance. 
     This batch requires quarantine. Please attach a red tag, 
     scan the batch QR code, and move parts to Bay 7."
Jake: "Done, all 47 parts tagged and moved"
AI: "Confirmed. I've logged the incident and notified the quality team. 
     Incident ID: QC-2025-0156."
```

**Scenario 3: Complex Decision Tree**
```
Jake: "These rotors have circular scratches and some roughness"
AI: "Let me guide you through evaluation. First, checking the pattern... 
     [calls analyzeDefectPattern] Circular scratches indicate machining process. 
     Now measuring roughness... [calls checkSurfaceRoughness] 
     Average Ra is 1.8µm, which exceeds the 1.6µm spec. 
     Now checking defect depth... [calls measureDefectDepth]
     Depth is 0.018mm, within tolerance. However, due to roughness exceeding spec,
     this batch should be quarantined for engineering review."
```

---

## 9. Performance Optimization

### 9.1 Response Time Targets

| Component | Target | Notes |
|-----------|--------|-------|
| Vapi STT | < 500ms | Handled by Vapi |
| Intent Classification | < 800ms | Fast Friendli model |
| Weaviate Retrieval | < 300ms | Optimized vector search |
| Decision Navigation | < 2s | Complex reasoning |
| Tool Execution | < 100ms | Simulated, instant |
| Vapi TTS | < 500ms | Handled by Vapi |
| **Total Round Trip** | **< 4s** | Acceptable for voice |

### 9.2 Optimization Strategies

1. **Caching**: Cache SOP retrievals for repeated queries
2. **Parallel Processing**: Run multiple agents in parallel where possible
3. **Model Selection**: Use smaller Friendli models (8B params) for faster inference
4. **Streaming**: Stream LLM responses for perceived faster response
5. **Pre-loading**: Pre-load common SOP contexts at session start

---

## 10. Demo Presentation Strategy

### 10.1 Opening (30 seconds)

**Hook**: "Right now, when a factory worker finds a problem, production stops for 15-20 minutes while they find a supervisor and look up the right procedure. We've built an AI that gives them expert guidance instantly, through natural conversation."

### 10.2 Live Demo (2-3 minutes)

1. **Show the dual-view UI**: "On the left, what Jake sees. On the right, what's happening behind the scenes."
2. **Start a call**: "Jake, talk to the AI..."
3. **Walk through Scenario 2**: Surface defect → measurement → decision → quarantine
4. **Highlight**:
   - Real-time voice interaction (Vapi)
   - Multi-agent pipeline visualization
   - SOP retrieval from Weaviate
   - Tool calling with Friendli
   - Decision-making and logging

### 10.3 Technical Deep-Dive (1 minute)

**Show System View**: 
- "5-agent sequential pipeline"
- "Open-source models via Friendli"
- "LlamaIndex for reasoning"
- "Weaviate with 30 SOPs"

### 10.4 Impact & Closing (30 seconds)

**Business Impact**:
- ✅ 15-20 min downtime → 30 seconds
- ✅ Consistent SOP compliance
- ✅ Automatic documentation
- ✅ Scalable across 1,000+ workers

"This same architecture works for any industry with complex procedures: healthcare, logistics, energy. Open-source models make it affordable at scale."

---

## 11. Success Metrics

### Demo Success Criteria

- ✅ Voice interaction feels natural (< 4s response time)
- ✅ AI correctly navigates SOP-QC-015 in 3 different scenarios
- ✅ No crashes or freezes during demo
- ✅ System view clearly shows multi-agent orchestration
- ✅ Judges understand both worker value and technical sophistication

### Technical Achievement Criteria

- ✅ All 5 hackathon requirements met:
  1. ✅ Next.js
  2. ✅ Multi-agent orchestration (5-agent pipeline)
  3. ✅ Advanced tool-calling (3 simulated tools, Friendli integration)
  4. ✅ Open-source models via Friendli
  5. ✅ LlamaIndex for retrieval, reasoning, action execution
  6. ✅ Weaviate for vector storage

---

## 12. Risk Mitigation

### High-Risk Items

| Risk | Mitigation |
|------|-----------|
| **Vapi connection fails during demo** | Backup video + text fallback mode |
| **Friendli API rate limit/timeout** | Use caching + retry logic + fallback responses |
| **Weaviate cloud downtime** | Local Weaviate Docker fallback |
| **LLM hallucinates incorrect SOP steps** | Low temperature (0.2), structured prompts, validation layer |
| **Voice latency > 5s** | Pre-warm connections, optimize prompts for brevity |

### Pre-Demo Checklist

- [ ] All API keys valid and tested
- [ ] Weaviate populated with all SOPs
- [ ] 3 demo scenarios tested successfully
- [ ] Backup video recorded
- [ ] Local fallbacks configured
- [ ] Presentation slides ready
- [ ] Timer/stopwatch for 4-minute demo
- [ ] Network connection stable

---

## 13. Future Enhancements (Post-Hackathon)

1. **Real Integrations**: Connect to actual MES, ERP, CMMS systems
2. **Computer Vision**: Add image analysis for defect detection
3. **Multi-Language**: Support for multilingual factory workforce
4. **Mobile App**: Native iOS/Android for workers on factory floor
5. **Analytics Dashboard**: Track SOP usage, common issues, compliance rates
6. **Custom Models**: Fine-tune models on company-specific SOPs
7. **Offline Mode**: Edge deployment for factories with limited connectivity

---

## 14. References & Documentation

- **Vapi Docs**: https://docs.vapi.ai/quickstart/introduction
- **LlamaIndex.TS**: https://developers.llamaindex.ai/typescript/framework/
- **Friendli Docs**: https://friendli.ai/docs/guides/overview
- **Friendli Tool Calling**: https://friendli.ai/docs/guides/tool-calling
- **Weaviate Docs**: https://docs.weaviate.io/weaviate
- **Next.js App Router**: https://nextjs.org/docs

---

## 15. Appendix: Sample Code Snippets

### A. Pipeline Orchestrator

```typescript
// lib/agents/pipeline.ts
export async function runAgentPipeline({ userMessage, callId }) {
  // Get session
  const session = getSession(callId);
  
  // 1. Intent Classification
  const intent = await classifyIntent(userMessage, session);
  
  // 2. SOP Retrieval
  const sopContext = await retrieveSOPs(intent, userMessage);
  
  // 3. Decision Navigation
  const navigation = await navigate({
    sopContext,
    conversationState: session,
    userMessage
  });
  
  // 4. Action Execution
  if (navigation.toolCalls.length > 0) {
    const toolResults = await executeTools(navigation.toolCalls);
    navigation.agentResponse += formatToolResults(toolResults);
    
    // Update session with measurements
    updateSessionMeasurements(session, toolResults);
  }
  
  // 5. Logging
  await logInteraction({
    session,
    intent,
    sopUsed: sopContext.sop_id,
    userMessage,
    agentResponse: navigation.agentResponse,
    toolResults
  });
  
  // Update session state
  updateSession(callId, {
    ...session,
    lastMessage: userMessage,
    lastResponse: navigation.agentResponse,
    currentStep: navigation.nextStep
  });
  
  return {
    agentResponse: navigation.agentResponse,
    sessionState: session
  };
}
```

### B. Weaviate SOP Retrieval

```typescript
// lib/agents/sopRetriever.ts
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'https',
  host: process.env.WEAVIATE_URL!,
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY!),
});

export async function retrieveSOPs(query: string, filters?: any) {
  const result = await client.graphql
    .get()
    .withClassName('SOPChunk')
    .withNearText({
      concepts: [query],
      certainty: 0.7
    })
    .withFields('sop_id sop_title chunk_text chunk_type step_number equipment_required measurements')
    .withLimit(10)
    .withWhere({
      operator: 'Equal',
      path: ['category'],
      valueString: 'Quality Control'
    })
    .do();
  
  // Group chunks by SOP
  const sopGroups = groupBySOP(result.data.Get.SOPChunk);
  
  // Return primary SOP with context
  return {
    sop_id: sopGroups[0].sop_id,
    sop_title: sopGroups[0].sop_title,
    chunks: sopGroups[0].chunks,
    fullContext: assembleContext(sopGroups[0].chunks)
  };
}
```

---

## Ready to Build! 🚀

This specification provides everything needed to implement the AI Supervisor platform. The architecture is modular, the requirements are clear, and the demo scenarios are well-defined.

**Key Strengths of This Design**:
1. ✅ Meets all hackathon requirements
2. ✅ Clear sequential pipeline easy to explain
3. ✅ Realistic demo with measurable impact
4. ✅ Technically sophisticated but achievable
5. ✅ Dual-view UI showcases both UX and technical depth

**Next Steps for Developer**:
1. Start with Phase 1 (foundation setup)
2. Follow phases sequentially
3. Test each component independently before integration
4. Use the demo scenarios as acceptance criteria

Good luck at the hackathon! 🏆

