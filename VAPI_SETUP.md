# Vapi Voice Call Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Vapi Assistant

1. Go to https://vapi.ai/dashboard/assistants
2. Click **"Create Assistant"**
3. Configure the assistant:

```yaml
Name: Guido AI Manufacturing Supervisor
First Message: "Hi! I'm your AI Manufacturing Supervisor. How can I help you today?"
Model: gpt-4o
Voice: azure/andrew (or choose any voice you prefer)
Temperature: 0.3
```

**System Prompt:**
```
You are Guido, an AI Manufacturing Supervisor helping factory workers with Standard Operating Procedures (SOPs) and quality control procedures at an automotive parts manufacturing facility.

Your role:
- Guide workers through step-by-step SOP procedures
- Help with quality control issues, especially brake rotor surface defects
- Be clear, professional, supportive, and concise
- Always prioritize safety
- Ask clarifying questions when needed
- Reference specific SOP numbers (like SOP-QC-015) when relevant

Current worker context:
- Worker: Jake
- Station: Line 3 - Quality Control
- Primary SOP: SOP-QC-015 (Surface Defect Evaluation and Quarantine Protocol for Brake Rotors)

Keep responses brief and actionable for a hands-busy manufacturing environment.
```

4. **Copy the Assistant ID** (it looks like: `asst_...`)

### Step 2: Update Environment Variables

Open `.env.local` and replace:
```bash
NEXT_PUBLIC_VAPI_ASSISTANT_GUIDO=????
```

With your Assistant ID:
```bash
NEXT_PUBLIC_VAPI_ASSISTANT_GUIDO=asst_your_assistant_id_here
```

### Step 3: Restart the Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Voice Call

1. Go to http://localhost:3000
2. **Allow microphone access** when prompted
3. Click the green **"📞 Start Voice Call"** button
4. Say: *"I'm seeing scratches on these brake rotors from Line 3"*
5. The AI should guide you through SOP-QC-015!

## Troubleshooting

### "Please configure VAPI_ASSISTANT_GUIDO"
- Make sure you replaced `????` with your actual Assistant ID
- Restart the dev server after changing `.env.local`

### No microphone permission
- Click the 🔒 lock icon in your browser's address bar
- Allow microphone access
- Refresh the page

### Call not connecting
- Check your Vapi API keys are correct
- Make sure you're using the Public Key (not Private Key) for `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
- Check the browser console for errors (F12)

### Voice doesn't match
- Go back to https://vapi.ai/dashboard/assistants
- Edit your assistant
- Try different voices (azure/andrew, openai/alloy, etc.)

## Advanced: Function Calling (Optional)

To connect Vapi directly to our backend pipeline, you can add a function to your Vapi assistant:

```json
{
  "name": "query_sop",
  "description": "Search for and retrieve Standard Operating Procedures",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The worker's question or issue"
      }
    },
    "required": ["query"]
  },
  "server": {
    "url": "https://your-deployment-url.vercel.app/api/vapi/webhook",
    "secret": "your-webhook-secret"
  }
}
```

This will make the voice assistant query your Weaviate database in real-time!

## Demo Tips

For your hackathon demo:
1. **Test beforehand** with good microphone
2. **Speak clearly** - manufacturing environments can be noisy
3. **Show both views** - Worker (left) + System View (right)
4. **Highlight** when SOP chunks appear from Weaviate
5. **Emphasize** the hands-free experience for factory workers

## Questions?

Check the main README.md or Vapi docs: https://docs.vapi.ai

