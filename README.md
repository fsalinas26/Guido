# AI Hack Day at the AWS GenAI Loft - First Place 🏆

# Guido - AI Manufacturing Supervisor



Voice-enabled AI assistant for manufacturing Standard Operating Procedures (SOPs) using multi-agent orchestration.

<img width="3112" height="827" alt="Untitled-2025-10-22-1321" src="https://github.com/user-attachments/assets/434dcdf6-5304-4084-b7c2-80bc014ef70e" />



## 🎯 Project Overview

Guido is a hackathon project demonstrating how AI agents can provide real-time, voice-based guidance to factory workers through complex SOPs. The system uses a 5-agent sequential pipeline to retrieve procedures, guide decision-making, execute tools, and log outcomes.

### Demo Scenario
**Worker "Jake"** at Line 3 Quality Control encounters surface defects on brake rotors. The AI Supervisor guides him through **SOP-QC-015** (Surface Defect Evaluation Protocol), measuring defects, making accept/reject decisions, and logging the outcome—all via natural voice conversation.

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Agent Framework**: LlamaIndex.TS
- **LLM Provider**: Friendli (open-source models: Llama 3.1)
- **Vector Database**: Weaviate Cloud
- **Voice Interface**: Vapi (STT/TTS)
- **Document Parsing**: LlamaParse (LlamaCloud)

### Multi-Agent Pipeline

```
1. Intent Classifier (Friendli)
   ↓
2. SOP Retriever (Weaviate)
   ↓
3. Decision Navigator (LlamaIndex + Friendli + Tools)
   ↓
4. Action Executor (Simulated Tools)
   ↓
5. Logger (Incident Recording)
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- npm or yarn

# API Keys Needed
- Friendli API key
- Weaviate Cloud instance
- Vapi account (for voice)
- LlamaCloud API key (for parsing)
```

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local

# Edit .env.local with your API keys:
# - FRIENDLI_API_KEY
# - WEAVIATE_URL
# - WEAVIATE_API_KEY
# - VAPI_API_KEY (and other Vapi keys)
# - LLAMA_CLOUD_API_KEY
```

### Setup Steps

#### 1. Generate SOPs (Already Done! ✅)
```bash
# 50 SOPs already generated in data/sops/
# Including detailed SOP-QC-015 for brake rotor defects
npm run generate-sops  # Optional: regenerate if needed
```

#### 2. Seed Weaviate Database
```bash
# Load all SOPs into Weaviate
npm run seed-weaviate

# This will:
# - Initialize Weaviate schema
# - Parse 50+ SOP documents
# - Extract chunks with metadata
# - Upload to Weaviate Cloud
# - Run test query
```

#### 3. Start Development Server
```bash
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
/guido
├── app/
│   ├── page.tsx                    # Main demo page (dual-view UI)
│   ├── components/
│   │   ├── WorkerView.tsx          # Left panel: worker interface
│   │   └── SystemView.tsx          # Right panel: system visualization
│   └── api/
│       ├── agent/pipeline/         # Main agent pipeline API
│       ├── vapi/webhook/           # Vapi webhook handler
│       └── sessions/               # Session management
├── lib/
│   ├── agents/
│   │   ├── pipeline.ts             # Main orchestrator
│   │   ├── intentClassifier.ts    # Agent 1
│   │   ├── sopRetriever.ts        # Agent 2 (Weaviate)
│   │   ├── decisionNavigator.ts   # Agent 3 (LlamaIndex)
│   │   ├── actionExecutor.ts      # Agent 4 (Tools)
│   │   └── logger.ts              # Agent 5
│   ├── tools/
│   │   ├── definitions.ts          # Tool schemas
│   │   └── implementations.ts      # Simulated tools
│   ├── clients/
│   │   ├── weaviate.ts            # Weaviate client
│   │   ├── friendli.ts            # Friendli LLM client
│   │   └── vapi.ts                # Vapi configuration
│   ├── state/
│   │   └── sessionManager.ts      # In-memory sessions
│   └── utils/
│       ├── types.ts               # TypeScript types
│       └── prompts.ts             # System prompts
├── scripts/
│   ├── generateSOPs.ts            # Generate synthetic SOPs
│   └── seedWeaviate.ts            # Load SOPs into Weaviate
├── data/
│   └── sops/                      # 50+ SOP documents (markdown)
└── TECHNICAL_SPEC.md              # Full specification
```

---

## 🎮 Using the Demo

### Text-Based Demo (No Voice Setup Required)

1. Navigate to http://localhost:3000
2. Click **"Start Demo Scenario"** button or type:
   ```
   "I'm seeing scratches on these brake rotors from Line 3"
   ```
3. Follow the conversation as the AI guides you through SOP-QC-015
4. The system will:
   - Classify your intent (quality issue)
   - Retrieve SOP-QC-015 from Weaviate
   - Guide you through defect evaluation
   - Call measurement tools (simulated)
   - Make accept/quarantine decision
   - Log the outcome

### Demo Conversation Flow

```
Jake: "I'm seeing scratches on brake rotors from Line 3"

AI: "I'm checking the surface defect protocol. Can you describe 
     the scratches? Are they circular, straight lines, or random?"

Jake: "They're straight line scratches"

AI: "Let me analyze the defect pattern... [calls analyzeDefectPattern]
     These appear to be linear scratches, likely from handling.
     Now measuring depth... [calls measureDefectDepth]
     The depth is 0.024mm, which exceeds the 0.02mm tolerance.
     This batch requires quarantine."

AI: "Following SOP-QC-015:
     1. Attach red quarantine tags
     2. Scan batch QR code
     3. Move parts to Bay 7"

Jake: "Done, all parts tagged and moved"

AI: "Confirmed. I've logged the incident and notified the quality 
     team. Incident ID: INC-1234567-abc123"
```

---

## 🛠️ Available Tools

The AI has access to 3 simulated measurement tools:

### 1. measureDefectDepth(location, defect_type)
- Measures surface defect depth in millimeters
- Returns depth, tolerance comparison, timestamp
- Example: `{ depth_mm: "0.024", tolerance_exceeded: true }`

### 2. checkSurfaceRoughness(measurement_points)
- Measures surface roughness (Ra values)
- Returns average Ra in micrometers
- Example: `{ average_Ra_um: "1.8", within_spec: false }`

### 3. analyzeDefectPattern(defect_description)
- Identifies defect pattern type (circular, linear, random)
- Returns pattern, likely cause, severity
- Example: `{ pattern_type: "linear", likely_cause: "Handling damage" }`

---

## 📊 SOP Database

### Statistics
- **Total SOPs**: 50 documents
- **Categories**: 6 (Equipment, Quality Control, Safety, Production, Material Handling, Documentation)
- **Primary SOP**: SOP-QC-015 (Surface Defect Evaluation for Brake Rotors)
- **Format**: Markdown (parsed from detailed specs)

### SOP Categories
1. **Equipment Operation & Maintenance** (12 SOPs)
2. **Quality Control & Inspection** (10 SOPs) ← SOP-QC-015 here
3. **Safety & Environmental** (8 SOPs)
4. **Production & Scheduling** (7 SOPs)
5. **Material Handling** (6 SOPs)
6. **Documentation & Compliance** (7 SOPs)

---

## 🔧 Configuration

### Environment Variables

```bash
# Friendli (Open-source LLM provider)
FRIENDLI_API_KEY=your_friendli_api_key
FRIENDLI_BASE_URL=https://api.friendli.ai/serverless/v1

# Weaviate Cloud (Vector database)
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your_weaviate_api_key

# Vapi (Voice interface)
VAPI_API_KEY=your_vapi_api_key
VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key

# LlamaCloud (Document parsing)
LLAMA_CLOUD_API_KEY=your_llamacloud_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Friendli Models Used

```typescript
// Fast model for intent classification (8B parameters)
model: "meta-llama-3.1-8b-instruct"
temperature: 0.1

// Balanced model for decision navigation (70B parameters)
model: "meta-llama-3.1-70b-instruct"  
temperature: 0.2
```

---

## 🧪 Testing

### Test Scenarios

**Scenario 1: Minor Defects (ACCEPT)**
```
Input: "I'm seeing some light scratches on these brake rotors"
Expected: Depth < 0.02mm, Ra < 1.6µm → ACCEPT
```

**Scenario 2: Defect Exceeds Tolerance (QUARANTINE)**
```
Input: "I'm seeing deep pitting on batch 47"
Expected: Depth > 0.02mm → QUARANTINE
```

**Scenario 3: Complex Decision Tree**
```
Input: "These rotors have circular scratches and some roughness"
Expected: Multiple tool calls, roughness check, quarantine if Ra > 1.6µm
```

### API Endpoints

```bash
# Test agent pipeline
POST /api/agent/pipeline
Body: { "userMessage": "...", "callId": "test-123" }

# Check active sessions
GET /api/sessions

# View incident logs
GET /api/logs
```

---

## 🎤 Voice Interface (Optional)

### Vapi Setup

1. Create account at https://vapi.ai
2. Get API keys from dashboard
3. Configure webhook URL in Vapi:
   ```
   POST https://your-domain.com/api/vapi/webhook
   ```
4. Update `.env.local` with Vapi keys
5. The app will automatically handle voice calls

### Voice Flow
- **STT**: Worker speaks → Vapi transcribes → Agent pipeline
- **TTS**: Agent response → Vapi speaks aloud
- **Sub-second latency**: Fast Friendli models ensure quick responses

---

## 📈 Performance

### Target Metrics
- **Intent Classification**: < 800ms
- **Weaviate Retrieval**: < 300ms
- **Decision Navigation**: < 2s (includes tool calling)
- **Total Round Trip**: < 4s (acceptable for voice)

### Optimization Strategies
1. Use fast Friendli models (8B) for classification
2. Cache SOP retrievals for repeated queries
3. Parallel processing where possible
4. Streaming LLM responses

---

## 🚧 Troubleshooting

### Common Issues

**Issue**: `No matching version found for @vapi-ai/web`
- Solution: Using `@vapi-ai/web@^2.1.0` instead

**Issue**: Weaviate connection failed
- Check `WEAVIATE_URL` format (should not include `https://`)
- Verify API key is correct
- Ensure Weaviate cluster is active

**Issue**: Friendli API errors
- Verify API key has sufficient credits
- Check model name is correct
- Ensure base URL is set correctly

**Issue**: No SOPs found during retrieval
- Run `npm run seed-weaviate` to populate database
- Check Weaviate has data: visit cluster dashboard
- Verify vectorizer is configured (text2vec-openai)

---

## 📖 Documentation

- **Full Specification**: See `TECHNICAL_SPEC.md`
- **Friendli Docs**: https://friendli.ai/docs/guides/overview
- **Weaviate Docs**: https://docs.weaviate.io/weaviate
- **LlamaIndex.TS**: https://developers.llamaindex.ai/typescript/framework/
- **Vapi Docs**: https://docs.vapi.ai/quickstart/introduction

---

## 🎯 Hackathon Requirements

✅ **Next.js**: React framework with App Router  
✅ **Multi-agent orchestration**: 5-agent sequential pipeline  
✅ **Advanced tool-calling**: 3 simulated measurement tools via Friendli  
✅ **Open-source models**: Llama 3.1 (8B & 70B) via Friendli  
✅ **LlamaIndex**: Agent framework for retrieval, reasoning, execution  
✅ **Weaviate**: Vector database for SOP storage and retrieval  

### Bonus Features
- 50 SOPs across 6 categories
- Dual-view UI showing worker + system perspectives
- Real incident logging
- Session state management
- Comprehensive error handling

---

## 🏆 Demo Presentation

### Key Points to Highlight
1. **Real-World Impact**: 15-20 min downtime → 30 seconds
2. **Multi-Agent Sophistication**: 5-agent pipeline with clear separation of concerns
3. **Open-Source Models**: Llama 3.1 via Friendli (8B for speed, 70B for reasoning)
4. **Voice-First UX**: Natural conversation, hands-free for factory workers
5. **Production-Ready Architecture**: Modular, extensible, scalable

### Demo Script (3 minutes)
1. **Introduction** (30s): The problem and our solution
2. **Live Demo** (2min): Walk through SOP-QC-015 scenario
3. **System View** (30s): Show agent pipeline in action
4. **Impact** (30s): ROI and scalability

---

## 🔮 Future Enhancements

1. **Real Integrations**: Connect to actual MES, ERP, CMMS systems
2. **Computer Vision**: Image analysis for defect detection
3. **Multi-Language**: Support multilingual workforce
4. **Mobile App**: Native iOS/Android for factory floor
5. **Analytics**: Track SOP usage, common issues, compliance
6. **Fine-Tuning**: Custom models trained on company SOPs

---

## 👥 Team & Credits

**Hackathon Project** - Built for AI Agents for Enterprise Use Cases

- Framework: LlamaIndex.TS
- LLM Provider: Friendli AI
- Vector Database: Weaviate
- Voice Interface: Vapi

---

## 📝 License

This project is for hackathon demonstration purposes.

---

**Need Help?**
- Check `TECHNICAL_SPEC.md` for detailed implementation details
- Review agent code in `/lib/agents/`
- Test API endpoints using the examples above

**Ready to demo?** 🎉
```bash
npm run dev
# Navigate to http://localhost:3000
# Click "Start Demo Scenario"
```
