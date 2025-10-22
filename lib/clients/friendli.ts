/**
 * Friendli API client configuration
 */

import OpenAI from 'openai';

let friendliClient: OpenAI | null = null;

export function getFriendliClient(): OpenAI {
  if (!friendliClient) {
    if (!process.env.FRIENDLI_API_KEY) {
      throw new Error('FRIENDLI_API_KEY environment variable not set');
    }

    friendliClient = new OpenAI({
      apiKey: process.env.FRIENDLI_API_KEY,
      baseURL: process.env.FRIENDLI_BASE_URL || 'https://api.friendli.ai/serverless/v1',
    });
  }
  
  return friendliClient;
}

/**
 * Friendli model configurations
 */
export const FRIENDLI_MODELS = {
  // Fast model for intent classification
  FAST: 'meta-llama-3.1-8b-instruct',
  
  // Balanced model for decision navigation
  BALANCED: 'meta-llama-3.1-70b-instruct',
  
  // High-quality model (if needed)
  LARGE: 'meta-llama-3.1-405b-instruct',
};

/**
 * Default configuration for different agent tasks
 */
export const AGENT_CONFIGS = {
  INTENT_CLASSIFIER: {
    model: FRIENDLI_MODELS.FAST,
    temperature: 0.1,
    max_tokens: 200,
  },
  DECISION_NAVIGATOR: {
    model: FRIENDLI_MODELS.BALANCED,
    temperature: 0.2,
    max_tokens: 500,
  },
};

