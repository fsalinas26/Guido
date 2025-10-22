/**
 * Weaviate client configuration
 */

import weaviate from 'weaviate-client';
import type { WeaviateClient } from 'weaviate-client';

let client: WeaviateClient | null = null;

export async function getWeaviateClient(): Promise<WeaviateClient> {
  if (!client) {
    if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_API_KEY) {
      throw new Error('Weaviate environment variables not configured');
    }

    client = await weaviate.connectToWeaviateCloud(
      process.env.WEAVIATE_URL,
      {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
        headers: {
          'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
        }
      }
    );
  }
  
  return client;
}

/**
 * Weaviate schema for SOP chunks
 */
export const SOP_CHUNK_CLASS_NAME = 'SOPChunk';

export const SOP_CHUNK_SCHEMA = {
  class: SOP_CHUNK_CLASS_NAME,
  description: 'Standard Operating Procedure document chunks',
  vectorizer: 'text2vec-openai',
  moduleConfig: {
    'text2vec-openai': {
      model: 'text-embedding-3-small',
      type: 'text'
    }
  },
  properties: [
    {
      name: 'sop_id',
      dataType: ['string'],
      description: 'SOP identifier (e.g., SOP-QC-015)'
    },
    {
      name: 'sop_title',
      dataType: ['string'],
      description: 'Full title of the SOP'
    },
    {
      name: 'category',
      dataType: ['string'],
      description: 'SOP category (Quality Control, Equipment, Safety, etc.)'
    },
    {
      name: 'chunk_text',
      dataType: ['text'],
      description: 'Main text content of this chunk'
    },
    {
      name: 'chunk_type',
      dataType: ['string'],
      description: 'Type of chunk: step, warning, decision, requirement, reference'
    },
    {
      name: 'step_number',
      dataType: ['int'],
      description: 'Sequential step number if applicable'
    },
    {
      name: 'equipment_required',
      dataType: ['string[]'],
      description: 'List of equipment needed for this step'
    },
    {
      name: 'measurements',
      dataType: ['string[]'],
      description: 'Measurement specifications or tolerances'
    },
    {
      name: 'decision_point',
      dataType: ['boolean'],
      description: 'True if this step requires decision-making'
    },
    {
      name: 'safety_critical',
      dataType: ['boolean'],
      description: 'True if safety-related'
    },
    {
      name: 'page_number',
      dataType: ['int'],
      description: 'Source page number in PDF'
    }
  ]
};

/**
 * Initialize Weaviate schema (run once during setup)
 */
export async function initializeWeaviateSchema() {
  const client = await getWeaviateClient();
  
  try {
    // Check if collection already exists
    const exists = await client.collections.exists(SOP_CHUNK_CLASS_NAME);
    
    if (!exists) {
      console.log('Creating SOPChunk collection in Weaviate...');
      await client.collections.create({
        name: SOP_CHUNK_CLASS_NAME,
        description: 'Standard Operating Procedure document chunks',
        vectorizers: weaviate.configure.vectorizer.text2VecOpenAI(),
        properties: [
          { name: 'sop_id', dataType: 'text' },
          { name: 'sop_title', dataType: 'text' },
          { name: 'category', dataType: 'text' },
          { name: 'chunk_text', dataType: 'text' },
          { name: 'chunk_type', dataType: 'text' },
          { name: 'step_number', dataType: 'int' },
          { name: 'equipment_required', dataType: 'text[]' },
          { name: 'measurements', dataType: 'text[]' },
          { name: 'decision_point', dataType: 'boolean' },
          { name: 'safety_critical', dataType: 'boolean' },
          { name: 'page_number', dataType: 'int' }
        ]
      });
      console.log('Collection created successfully');
    } else {
      console.log('SOPChunk collection already exists');
    }
  } catch (error) {
    console.error('Error initializing Weaviate schema:', error);
    throw error;
  }
}

