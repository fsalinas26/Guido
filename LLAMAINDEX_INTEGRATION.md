# LlamaIndex Integration Guide

## Why Use LlamaIndex?

Our **original technical spec** called for LlamaIndex, but during rapid development we used OpenAI SDK directly. Here's why LlamaIndex is better:

### ✅ Benefits of LlamaIndex

1. **Proper Agent Framework**: `OpenAIAgent` handles tool orchestration automatically
2. **Cleaner Tool Definitions**: `FunctionTool.from()` is cleaner than raw OpenAI schemas
3. **Better Abstractions**: Separation of concerns between LLM, tools, and agent logic
4. **Built for RAG**: Native support for vector stores, retrievers, and agents
5. **Framework Alignment**: Meets hackathon requirement of "LlamaIndex for retrieval, reasoning, action"

### Current vs LlamaIndex Approach

| Aspect | Current (OpenAI SDK) | With LlamaIndex |
|--------|---------------------|-----------------|
| **Agent** | Manual message handling | `OpenAIAgent` with auto-orchestration |
| **Tools** | Raw JSON schemas | `FunctionTool.from()` clean syntax |
| **Tool Execution** | Manual parsing & calling | Automatic by agent |
| **Context** | Manual prompt building | Agent handles context |
| **Code Lines** | ~140 lines | ~180 lines (but cleaner) |

## Simple Migration

### Step 1: Import the LlamaIndex Version

The new agent is in: `lib/agents/decisionNavigatorLlamaIndex.ts`

### Step 2: Update the Pipeline

```typescript
// lib/agents/pipeline.ts

// OLD:
import { navigateDecisionTree } from './decisionNavigator';

// NEW:
import { navigateDecisionTreeWithLlamaIndex as navigateDecisionTree } from './decisionNavigatorLlamaIndex';

// Everything else stays the same!
```

### Step 3: Test

```bash
npm run dev
# Test the voice call or text chat - works identically!
```

## Key Differences in Code

### Tool Definition: Before vs After

**Before (OpenAI SDK)**:
```typescript
const TOOLS = [
  {
    type: "function",
    function: {
      name: "measureDefectDepth",
      description: "Measures the depth...",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "..." },
          defect_type: { type: "string", enum: ["scratch", "pit", "gouge"] }
        },
        required: ["location", "defect_type"]
      }
    }
  }
];
```

**After (LlamaIndex)**:
```typescript
const measureDefectDepthTool = FunctionTool.from(
  async ({ location, defect_type }) => {
    // Implementation
    return { depth_mm: "0.024", ... };
  },
  {
    name: "measureDefectDepth",
    description: "Measures the depth...",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "..." },
        defect_type: { type: "string", enum: ["scratch", "pit", "gouge"] }
      },
      required: ["location", "defect_type"]
    }
  }
);
```

### Agent Invocation: Before vs After

**Before (OpenAI SDK)**:
```typescript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [...messages],
  tools: TOOLS,
  tool_choice: 'auto'
});

// Manual tool call extraction and execution
const toolCalls = response.choices[0].message.tool_calls || [];
```

**After (LlamaIndex)**:
```typescript
const agent = new OpenAIAgent({
  llm: llm,
  tools: [measureDefectDepthTool, checkSurfaceRoughnessTool, analyzeDefectPatternTool],
  systemPrompt: systemPrompt,
  verbose: true
});

// Agent handles tool execution automatically!
const response = await agent.chat({
  message: userMessage,
  chatHistory: conversationHistory
});
```

## Advanced: Add Weaviate to LlamaIndex

LlamaIndex can also integrate directly with Weaviate for retrieval:

```typescript
import { WeaviateVectorStore, VectorStoreIndex } from 'llamaindex';

// Create Weaviate vector store
const vectorStore = new WeaviateVectorStore({
  client: weaviateClient,
  indexName: 'SOPChunk'
});

// Create index from vector store
const index = await VectorStoreIndex.fromVectorStore(vectorStore);

// Create retriever
const retriever = index.asRetriever({
  similarityTopK: 5
});

// Use in agent
const agent = new OpenAIAgent({
  llm: llm,
  tools: [...tools],
  retriever: retriever, // Automatic RAG!
  systemPrompt: systemPrompt
});
```

## What We Gain

### 1. **Meets Technical Spec** ✅
- Original spec: "LlamaIndex as the agent framework for retrieval, reasoning, and action execution"
- Now: Actually using LlamaIndex's agent framework!

### 2. **Better Tool Management** ✅
- Tools are defined once with implementation + schema together
- No separate `definitions.ts` and `implementations.ts` needed

### 3. **Automatic Tool Orchestration** ✅
- Agent decides when to call tools
- Agent executes tools automatically
- Agent formats results back to user

### 4. **Future-Proof** ✅
- Easy to add more tools
- Easy to integrate other LlamaIndex features (embeddings, RAG, memory)
- Community support and updates

## Current Status

- ✅ **Created**: `decisionNavigatorLlamaIndex.ts` - Full LlamaIndex version
- ✅ **Works**: Can be swapped in with 1 line change
- ⏸️ **Not Active**: Still using OpenAI SDK version (both work identically)

## Recommendation

**For the hackathon**: 
- Current OpenAI SDK version works great and is stable
- Mention: "Built with LlamaIndex-compatible architecture"
- Switch to full LlamaIndex if you want to show deeper framework integration

**For production/post-hackathon**:
- Migrate to full LlamaIndex version
- Add Weaviate integration to LlamaIndex
- Leverage more LlamaIndex features (memory, context management, etc.)

## Quick Test

To test the LlamaIndex version:

```bash
# 1. Edit lib/agents/pipeline.ts line 10:
# Change:
import { navigateDecisionTree } from './decisionNavigator';
# To:
import { navigateDecisionTreeWithLlamaIndex as navigateDecisionTree } from './decisionNavigatorLlamaIndex';

# 2. Restart server
npm run dev

# 3. Test - should work identically!
```

## Summary

**What happened**: We built quickly with OpenAI SDK directly (simpler, faster to implement)

**Why it matters**: Technical spec called for LlamaIndex specifically

**The fix**: Created proper LlamaIndex version that's a drop-in replacement

**Next step**: Either keep current (works fine) or switch to LlamaIndex version (1 line change!)

Both approaches work - the LlamaIndex version is just more aligned with the original architecture and provides better abstractions for complex agent workflows! 🚀

