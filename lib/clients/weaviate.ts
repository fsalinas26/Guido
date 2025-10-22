/**
 * Weaviate client configuration
 */

import weaviate, { WeaviateClient } from 'weaviate-client';

let client: WeaviateClient | null = null;

export function getWeaviateClient(): WeaviateClient {
  if (!client) {
    if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_API_KEY) {
      throw new Error('Weaviate environment variables not configured');
    }

    client = weaviate.connectToWeaviateCloud(
      process.env.WEAVIATE_URL,
      {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
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
  const client = getWeaviateClient();
  
  try {
    // Check if class already exists
    const schema = await client.schema.getter().do();
    const classExists = schema.classes?.some(c => c.class === SOP_CHUNK_CLASS_NAME);
    
    if (!classExists) {
      console.log('Creating SOPChunk schema in Weaviate...');
      await client.schema.classCreator().withClass(SOP_CHUNK_SCHEMA).do();
      console.log('Schema created successfully');
    } else {
      console.log('SOPChunk schema already exists');
    }
  } catch (error) {
    console.error('Error initializing Weaviate schema:', error);
    throw error;
  }
}

