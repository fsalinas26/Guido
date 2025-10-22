/**
 * Agent 1: Intent Classifier
 * Determines what the worker needs from their query
 */

import { getFriendliClient, AGENT_CONFIGS } from '@/lib/clients/friendli';
import { IntentClassificationResult, ConversationState } from '@/lib/utils/types';
import { INTENT_CLASSIFIER_SYSTEM_PROMPT } from '@/lib/utils/prompts';

export async function classifyIntent(
  userMessage: string,
  conversationState: ConversationState
): Promise<IntentClassificationResult> {
  const client = getFriendliClient();
  
  try {
    const response = await client.chat.completions.create({
      model: AGENT_CONFIGS.INTENT_CLASSIFIER.model,
      temperature: AGENT_CONFIGS.INTENT_CLASSIFIER.temperature,
      max_tokens: AGENT_CONFIGS.INTENT_CLASSIFIER.max_tokens,
      messages: [
        {
          role: 'system',
          content: INTENT_CLASSIFIER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Worker context:
Name: ${conversationState.worker_name}
Station: ${conversationState.station}
Current SOP: ${conversationState.current_sop_id || 'None'}

Worker's message: "${userMessage}"

Classify this intent and extract entities.`
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from LLM');
    }
    
    const result = JSON.parse(content) as IntentClassificationResult;
    
    console.log('Intent classified:', result);
    return result;
    
  } catch (error) {
    console.error('Error classifying intent:', error);
    
    // Fallback: return a general question intent
    return {
      intent: 'general_question',
      confidence: 0.5,
      extracted_entities: {}
    };
  }
}

