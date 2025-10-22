/**
 * Friendli API client configuration
 */

import OpenAI from 'openai';

let friendliClient: OpenAI | null = null;

export function getFriendliClient(): OpenAI {
  if (!friendliClient) {
    // Try Friendli first, fallback to OpenAI if Friendli is not configured
    const useFriendli = process.env.FRIENDLI_API_KEY && process.env.USE_FRIENDLI === 'true';
    
    if (useFriendli) {
      const baseURL = process.env.FRIENDLI_BASE_URL || process.env.FRIENDLY_ENDPOINT || 'https://api.friendli.ai/serverless/v1';
      const teamId = process.env.FRIENDLI_TEAM_ID;
      
      const defaultHeaders: Record<string, string> = {};
      if (teamId) {
        defaultHeaders['X-Friendli-Team'] = teamId;
      }
      
      friendliClient = new OpenAI({
        apiKey: process.env.FRIENDLI_API_KEY!,
        baseURL: baseURL,
        defaultHeaders: defaultHeaders,
      });
      
      console.log('🔧 Using Friendli API at:', baseURL);
      if (teamId) console.log('🔧 With Team ID:', teamId);
    } else {
      // Fallback to OpenAI for demo purposes
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('Either FRIENDLI_API_KEY or OPENAI_API_KEY must be set');
      }
      
      friendliClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      console.log('🔧 Using OpenAI API as fallback');
    }
  }
  
  return friendliClient;
}

/**
 * Model configurations
 * Automatically selects appropriate models based on provider
 */
const useFriendli = process.env.USE_FRIENDLI === 'true';

export const FRIENDLI_MODELS = {
  // Fast model for intent classification
  FAST: useFriendli 
    ? (process.env.FRIENDLI_MODEL || 'meta-llama-3.1-8b-instruct')
    : 'gpt-4o-mini',
  
  // Balanced model for decision navigation
  BALANCED: useFriendli 
    ? (process.env.FRIENDLI_MODEL || 'meta-llama-3.1-70b-instruct')
    : 'gpt-4o',
  
  // High-quality model (if needed)
  LARGE: useFriendli 
    ? (process.env.FRIENDLI_MODEL || 'meta-llama-3.1-405b-instruct')
    : 'gpt-4o',
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

