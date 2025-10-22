# Setup Guide - Quick Start

## 🚀 Getting Started in 5 Steps

### Step 1: Environment Setup (5 min)

1. **Copy environment template**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get API keys** (create accounts if needed):
   - **Friendli**: https://friendli.ai/ → Dashboard → API Keys
   - **Weaviate Cloud**: https://console.weaviate.cloud/ → Create Cluster → API Keys
   - **Vapi** (optional): https://vapi.ai/ → Dashboard → API Keys
   - **LlamaCloud**: https://cloud.llamaindex.ai/ → API Keys

3. **Update `.env.local`**:
   ```bash
   # Required for demo
   FRIENDLI_API_KEY=fl-xxxx...
   WEAVIATE_URL=xyz-cluster-abc.weaviate.network
   WEAVIATE_API_KEY=xxxx...

   # Optional for voice (can skip for text demo)
   VAPI_API_KEY=xxxx...
   LLAMA_CLOUD_API_KEY=xxxx...
   ```

### Step 2: Install Dependencies (2 min)

```bash
npm install
```

**Expected output**: `added 908 packages` (some warnings are normal)

### Step 3: Seed Weaviate with SOPs (3 min)

```bash
npm run seed-weaviate
```

**Expected output**:
```
📋 Initializing Weaviate schema...
✅ Schema initialized

📁 Found 50 SOP documents

📄 Processing: SOP-QC-015_Surface_Defect_Evaluation_Brake_Rotors.md
  📦 Extracted 15 chunks
  ✅ Uploaded 15 chunks to Weaviate
...

✨ Seeding complete!
📊 Statistics:
   - SOPs processed: 50
   - Total chunks uploaded: ~600
```

### Step 4: Start Development Server (1 min)

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
Ready in 1.5s
```

### Step 5: Test the Demo (2 min)

1. Open http://localhost:3000 in browser
2. Click **"Start Demo Scenario"** button (or type your own message)
3. Watch the dual-view interface:
   - **Left**: Worker view (conversation)
   - **Right**: System view (agent pipeline visualization)

---

## 🎯 Demo Scenarios to Try

### Scenario 1: Happy Path (ACCEPT)
```
"I'm seeing some light scratches on these brake rotors"
```
**Expected**: Defects measured → within tolerance → ACCEPT

### Scenario 2: Quarantine Required
```
"I'm seeing deep pitting on brake rotors from Line 3"
```
**Expected**: Defects measured → exceeds tolerance → QUARANTINE

### Scenario 3: Complex Decision
```
"These rotors have circular scratches and rough surface"
```
**Expected**: Multiple tools called → roughness check → decision based on Ra value

---

## 🔍 Verification Checklist

### Backend Working?
- [ ] Weaviate seeding completed without errors
- [ ] Can access http://localhost:3000/api/sessions (should return empty array)
- [ ] Can access http://localhost:3000/api/logs (should return empty array)

### Frontend Working?
- [ ] Page loads at http://localhost:3000
- [ ] Worker View shows on left (blue header)
- [ ] System View shows on right (gray header)
- [ ] "Start Demo Scenario" button visible

### Agent Pipeline Working?
- [ ] Type a message and hit Send
- [ ] Response appears within 5 seconds
- [ ] System View shows agent activity
- [ ] Transcript updates on both sides

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Weaviate connection fails
```bash
# Check URL format (no https:// prefix needed in some cases)
# Try both:
WEAVIATE_URL=xyz-cluster.weaviate.network
# or
WEAVIATE_URL=https://xyz-cluster.weaviate.network
```

### Friendli API errors
- Check API key has credits remaining
- Try using the 8B model first (faster, cheaper):
  ```
  model: "meta-llama-3.1-8b-instruct"
  ```

### No response from agent
1. Check browser console (F12) for errors
2. Check terminal running `npm run dev` for backend errors
3. Test API directly:
   ```bash
   curl http://localhost:3000/api/agent/pipeline \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"userMessage":"test","callId":"test-123"}'
   ```

---

## 📊 System Health Checks

### 1. Check Weaviate has data:
```bash
# Visit your Weaviate cluster dashboard
# Should see "SOPChunk" class with ~600 objects
```

### 2. Test retrieval:
Open browser console on http://localhost:3000 and run:
```javascript
fetch('/api/agent/pipeline', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    userMessage: 'brake rotor defects',
    callId: 'test-' + Date.now()
  })
}).then(r => r.json()).then(console.log)
```

### 3. Check sessions:
```bash
# Should show active sessions
curl http://localhost:3000/api/sessions
```

---

## 🎤 Optional: Voice Setup

If you want to enable voice (not required for demo):

1. **Create Vapi account**: https://vapi.ai
2. **Get API keys** from dashboard
3. **Configure webhook** in Vapi:
   - Webhook URL: `https://your-ngrok-url.ngrok.io/api/vapi/webhook`
   - Use ngrok for local testing: `ngrok http 3000`
4. **Update `.env.local`** with all Vapi keys
5. **Restart server**: `npm run dev`

---

## 📈 Performance Expectations

### Response Times
- **Text mode**: 2-5 seconds per response
- **With voice**: 3-6 seconds (includes STT/TTS)

### First Response (Cold Start)
- May take 5-10 seconds for first query (models loading)
- Subsequent responses should be faster

### If responses are too slow:
1. Use smaller model: `meta-llama-3.1-8b-instruct`
2. Reduce `max_tokens` in agent configs
3. Check network latency to Friendli API

---

## 🎓 Learning the Codebase

### Where to look:
1. **Agent pipeline**: `/lib/agents/pipeline.ts` - main orchestrator
2. **Tool definitions**: `/lib/tools/definitions.ts` - what tools AI can use
3. **Tool implementations**: `/lib/tools/implementations.ts` - simulated measurement tools
4. **Prompts**: `/lib/utils/prompts.ts` - system prompts for agents
5. **Frontend**: `/app/page.tsx` and `/app/components/` - UI components

### How to modify:
- **Add new tools**: Update `definitions.ts` and `implementations.ts`
- **Change prompts**: Edit `/lib/utils/prompts.ts`
- **Modify UI**: Edit components in `/app/components/`
- **Add new agents**: Create file in `/lib/agents/` and update `pipeline.ts`

---

## 💡 Tips for Demo Day

### Before presenting:
1. Test all scenarios at least once
2. Keep browser dev tools open (shows activity)
3. Have backup screenshots/video
4. Clear chat before demo: click "Clear Chat" button

### During presentation:
1. Start with Scenario 1 (fast, simple)
2. Show System View to highlight multi-agent pipeline
3. Point out tool calling in real-time
4. Show logged incident at end

### Talking points:
- "5-agent sequential pipeline"
- "Open-source Llama 3.1 models via Friendli"
- "50 SOPs stored in Weaviate vector database"
- "Real-time tool calling for measurements"
- "Production-ready architecture"

---

## ✅ Ready for Demo Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Weaviate seeded (50 SOPs, ~600 chunks)
- [ ] `.env.local` configured with API keys
- [ ] Dev server running (`npm run dev`)
- [ ] Tested at least one scenario successfully
- [ ] System View shows agent activity
- [ ] No console errors in browser

**If all checked → You're ready! 🎉**

---

## 📞 Need Help?

1. Check `TECHNICAL_SPEC.md` for detailed architecture
2. Review `README.md` for full documentation
3. Look at example code in `/lib/agents/`
4. Test individual agents separately if needed

**Remember**: This is a demo/prototype. Not all features need to be perfect. Focus on showcasing the multi-agent orchestration and tool-calling capabilities!

Good luck with the hackathon! 🚀

