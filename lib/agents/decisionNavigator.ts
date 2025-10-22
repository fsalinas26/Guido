/**
 * Agent 3: Decision Tree Navigator
 * Guides worker through SOP steps using LLM with tool calling
 */

import { getFriendliClient, AGENT_CONFIGS } from '@/lib/clients/friendli';
import { NavigationResult, SOPRetrievalResult, ConversationState, ToolCall } from '@/lib/utils/types';
import { buildNavigatorPrompt } from '@/lib/utils/prompts';
import { TOOLS } from '@/lib/tools/definitions';

export async function navigateDecisionTree(
  userMessage: string,
  sopContext: SOPRetrievalResult,
  conversationState: ConversationState
): Promise<NavigationResult> {
  const client = getFriendliClient();
  
  try {
    // Build conversation history for context
    const messages = [
      {
        role: 'system' as const,
        content: buildNavigatorPrompt(sopContext, conversationState)
      },
      // Include recent conversation history
      ...conversationState.conversation_history.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];
    
    console.log('Calling decision navigator with', messages.length, 'messages');
    
    const response = await client.chat.completions.create({
      model: AGENT_CONFIGS.DECISION_NAVIGATOR.model,
      temperature: AGENT_CONFIGS.DECISION_NAVIGATOR.temperature,
      max_tokens: AGENT_CONFIGS.DECISION_NAVIGATOR.max_tokens,
      messages: messages,
      tools: TOOLS as any,
      tool_choice: 'auto'
    });
    
    const message = response.choices[0].message;
    const agentResponse = message.content || '';
    const toolCalls: ToolCall[] = message.tool_calls || [];
    
    console.log('Navigator response:', agentResponse);
    console.log('Tool calls:', toolCalls.length);
    
    // Check if a decision was made
    const decision = extractDecision(agentResponse);
    
    return {
      agent_response: agentResponse,
      next_step: extractNextStep(agentResponse, conversationState.current_step),
      tool_calls: toolCalls,
      decision_made: decision,
      requires_user_input: requiresUserInput(agentResponse, toolCalls)
    };
    
  } catch (error) {
    console.error('Error in decision navigator:', error);
    
    // Fallback response
    return {
      agent_response: "I'm having trouble processing that. Could you describe the issue again?",
      tool_calls: [],
      requires_user_input: true
    };
  }
}

function extractDecision(response: string): NavigationResult['decision_made'] {
  const lowercaseResponse = response.toLowerCase();
  
  // Look for decision keywords
  if (lowercaseResponse.includes('quarantine') || lowercaseResponse.includes('reject')) {
    return {
      criteria: 'Defect exceeds tolerance',
      outcome: 'QUARANTINE',
      reasoning: 'Measurements indicate defect exceeds acceptable tolerances'
    };
  }
  
  if (lowercaseResponse.includes('accept') || lowercaseResponse.includes('within tolerance')) {
    return {
      criteria: 'Defect within tolerance',
      outcome: 'ACCEPT',
      reasoning: 'Measurements indicate defect is within acceptable tolerances'
    };
  }
  
  if (lowercaseResponse.includes('escalate') || lowercaseResponse.includes('supervisor')) {
    return {
      criteria: 'Requires expert review',
      outcome: 'ESCALATE',
      reasoning: 'Issue requires human supervisor review'
    };
  }
  
  return undefined;
}

function extractNextStep(response: string, currentStep?: number): number | undefined {
  // Try to find "Step X" mentions in response
  const stepMatch = response.match(/step (\d+)/i);
  if (stepMatch) {
    return parseInt(stepMatch[1]);
  }
  
  // If no explicit step mentioned, increment current step
  if (currentStep !== undefined) {
    return currentStep + 1;
  }
  
  return undefined;
}

function requiresUserInput(response: string, toolCalls: ToolCall[]): boolean {
  // If tools were called, we don't need immediate user input
  if (toolCalls.length > 0) {
    return false;
  }
  
  // Check if response contains a question
  if (response.includes('?')) {
    return true;
  }
  
  // Check for confirmation keywords
  const confirmationKeywords = ['confirm', 'verify', 'check', 'please', 'can you'];
  const lowercaseResponse = response.toLowerCase();
  
  return confirmationKeywords.some(keyword => lowercaseResponse.includes(keyword));
}

