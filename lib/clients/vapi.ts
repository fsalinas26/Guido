/**
 * Vapi client configuration
 */

// Vapi types (basic definitions - extend as needed)
export interface VapiConfig {
  apiKey: string;
  phoneNumber?: string;
  publicKey?: string;
  privateKey?: string;
}

export interface VapiCallConfig {
  assistant: {
    name: string;
    model: {
      provider: string;
      model: string;
    };
    voice: {
      provider: string;
      voiceId: string;
    };
    firstMessage: string;
  };
  phoneNumber?: string;
  customer?: {
    number: string;
  };
}

/**
 * Get Vapi configuration from environment
 */
export function getVapiConfig(): VapiConfig {
  const apiKey = process.env.VAPI_API_KEY;
  
  if (!apiKey) {
    throw new Error('VAPI_API_KEY environment variable not set');
  }
  
  return {
    apiKey,
    phoneNumber: process.env.VAPI_PHONE_NUMBER,
    publicKey: process.env.VAPI_PUBLIC_KEY,
    privateKey: process.env.VAPI_PRIVATE_KEY,
  };
}

/**
 * Create Vapi assistant configuration
 */
export function createVapiAssistantConfig(): any {
  return {
    name: 'AI Manufacturing Supervisor',
    model: {
      provider: 'custom-llm',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/webhook`,
    },
    voice: {
      provider: 'elevenlabs',
      voiceId: 'rachel', // Professional, clear female voice
    },
    firstMessage: 'Hi, this is your AI Supervisor. I\'m here to help you with any questions about procedures, quality issues, or equipment. What can I help you with today?',
  };
}

