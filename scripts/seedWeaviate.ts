/**
 * Script to seed SOPs into Weaviate
 * Run with: npm run seed-weaviate
 */

// Load environment variables
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

import { readFileSync, readdirSync } from 'fs';
import { getWeaviateClient, initializeWeaviateSchema, SOP_CHUNK_CLASS_NAME } from '@/lib/clients/weaviate';

interface SOPChunk {
  sop_id: string;
  sop_title: string;
  category: string;
  chunk_text: string;
  chunk_type: 'step' | 'warning' | 'decision' | 'requirement' | 'reference';
  step_number?: number;
  equipment_required: string[];
  measurements: string[];
  decision_point: boolean;
  safety_critical: boolean;
  page_number?: number;
}

function parseSOPMarkdown(filepath: string, filename: string): SOPChunk[] {
  const content = readFileSync(filepath, 'utf-8');
  const chunks: SOPChunk[] = [];
  
  // Extract SOP ID from filename (e.g., "SOP-QC-015_..." -> "SOP-QC-015")
  const sopIdMatch = filename.match(/^(SOP-[A-Z]{2}-\d{3})/);
  const sopId = sopIdMatch ? sopIdMatch[1] : 'UNKNOWN';
  
  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const sopTitle = titleMatch ? titleMatch[1].replace(`${sopId}:`, '').trim() : 'Untitled SOP';
  
  // Determine category from SOP ID
  const categoryMap: Record<string, string> = {
    'EQ': 'Equipment Operation & Maintenance',
    'QU': 'Quality Control & Inspection',
    'SA': 'Safety & Environmental',
    'PR': 'Production & Scheduling',
    'MA': 'Material Handling',
    'DO': 'Documentation & Compliance',
    'QC': 'Quality Control & Inspection', // Alternative prefix
  };
  
  const categoryPrefix = sopId.split('-')[1];
  const category = categoryMap[categoryPrefix] || 'General';
  
  // Split content into sections
  const sections = content.split(/^#{1,3}\s+/m).filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();
    const sectionContent = lines.slice(1).join('\n').trim();
    
    if (!sectionContent || sectionContent.length < 50) continue;
    
    // Determine chunk type
    let chunkType: SOPChunk['chunk_type'] = 'requirement';
    let stepNumber: number | undefined;
    let safetyCritical = false;
    let decisionPoint = false;
    
    if (sectionTitle.match(/Step \d+/i)) {
      chunkType = 'step';
      const stepMatch = sectionTitle.match(/Step (\d+)/i);
      stepNumber = stepMatch ? parseInt(stepMatch[1]) : undefined;
      
      // Check if it's a decision point
      if (sectionContent.toLowerCase().includes('decision') || 
          sectionContent.includes('If ') ||
          sectionContent.includes('Critical Decision Point')) {
        decisionPoint = true;
        chunkType = 'decision';
      }
    } else if (sectionTitle.toLowerCase().includes('warning') || 
               sectionTitle.toLowerCase().includes('safety')) {
      chunkType = 'warning';
      safetyCritical = true;
    } else if (sectionTitle.toLowerCase().includes('reference')) {
      chunkType = 'reference';
    }
    
    // Check for safety warnings in content
    if (sectionContent.includes('⚠️') || sectionContent.toLowerCase().includes('warning')) {
      safetyCritical = true;
    }
    
    // Check for decision points in content
    if (sectionContent.toLowerCase().includes('if ') && sectionContent.toLowerCase().includes('then')) {
      decisionPoint = true;
    }
    
    // Extract equipment mentions
    const equipment: string[] = [];
    const equipmentPatterns = [
      /gauge/gi,
      /caliper/gi,
      /micrometer/gi,
      /scanner/gi,
      /tool/gi,
      /wrench/gi,
      /meter/gi
    ];
    
    for (const pattern of equipmentPatterns) {
      const matches = sectionContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const normalized = match.toLowerCase();
          if (!equipment.includes(normalized)) {
            equipment.push(normalized);
          }
        });
      }
    }
    
    // Extract measurements and specifications
    const measurements: string[] = [];
    const measurementPatterns = [
      /\d+\.?\d*\s*mm/gi,
      /\d+\.?\d*\s*µm/gi,
      /Ra\s*[≤<>]\s*\d+\.?\d*/gi,
      /tolerance/gi,
      /\d+\.?\d*\s*psi/gi,
      /\d+\.?\d*\s*°[CF]/gi
    ];
    
    for (const pattern of measurementPatterns) {
      const matches = sectionContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!measurements.includes(match)) {
            measurements.push(match);
          }
        });
      }
    }
    
    // Create chunk
    const chunk: SOPChunk = {
      sop_id: sopId,
      sop_title: sopTitle,
      category: category,
      chunk_text: `${sectionTitle}\n\n${sectionContent}`,
      chunk_type: chunkType,
      step_number: stepNumber,
      equipment_required: equipment,
      measurements: measurements,
      decision_point: decisionPoint,
      safety_critical: safetyCritical
    };
    
    chunks.push(chunk);
  }
  
  return chunks;
}

async function seedWeaviate() {
  console.log('🌱 Starting Weaviate seeding process...\n');
  
  try {
    // Initialize Weaviate schema
    console.log('📋 Initializing Weaviate schema...');
    await initializeWeaviateSchema();
    console.log('✅ Schema initialized\n');
    
    // Get Weaviate client
    const client = await getWeaviateClient();
    const collection = client.collections.get(SOP_CHUNK_CLASS_NAME);
    
    // Read all SOP files
    const sopsDir = join(process.cwd(), 'data', 'sops');
    const files = readdirSync(sopsDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    
    console.log(`📁 Found ${files.length} SOP documents\n`);
    
    let totalChunks = 0;
    let sopCount = 0;
    
    for (const file of files) {
      const filepath = join(sopsDir, file);
      
      console.log(`📄 Processing: ${file}`);
      
      try {
        // Parse SOP into chunks
        const chunks = parseSOPMarkdown(filepath, file);
        
        if (chunks.length === 0) {
          console.log(`  ⚠️  No chunks extracted, skipping\n`);
          continue;
        }
        
        console.log(`  📦 Extracted ${chunks.length} chunks`);
        
        // Upload chunks to Weaviate
        const objects = chunks.map(chunk => ({
          sop_id: chunk.sop_id,
          sop_title: chunk.sop_title,
          category: chunk.category,
          chunk_text: chunk.chunk_text,
          chunk_type: chunk.chunk_type,
          step_number: chunk.step_number || undefined,
          equipment_required: chunk.equipment_required,
          measurements: chunk.measurements,
          decision_point: chunk.decision_point,
          safety_critical: chunk.safety_critical,
          page_number: chunk.page_number || undefined
        }));
        
        const result = await collection.data.insertMany(objects);
        
        console.log(`  ✅ Uploaded ${result.hasErrors ? 'with errors' : result.uuids?.length || objects.length} chunks to Weaviate`);
        
        // Show sample chunk for debugging
        if (chunks.length > 0) {
          const sample = chunks[0];
          console.log(`  📋 Sample: ${sample.chunk_type} - "${sample.chunk_text.substring(0, 80)}..."`);
        }
        
        totalChunks += chunks.length;
        sopCount++;
        console.log('');
        
      } catch (error) {
        console.error(`  ❌ Error processing ${file}:`, error);
        console.log('');
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✨ Seeding complete!`);
    console.log(`📊 Statistics:`);
    console.log(`   - SOPs processed: ${sopCount}`);
    console.log(`   - Total chunks uploaded: ${totalChunks}`);
    console.log(`   - Average chunks per SOP: ${Math.round(totalChunks / sopCount)}`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Test query
    console.log('🔍 Running test query for "brake rotor defects"...');
    const testResult = await collection.query.nearText('brake rotor surface defects', {
      limit: 3
    });
    
    console.log(`   Found ${testResult.objects.length} relevant chunks:`);
    testResult.objects.forEach((obj, idx) => {
      const props = obj.properties;
      console.log(`   ${idx + 1}. ${props.sop_id}: ${props.chunk_text.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedWeaviate().catch(console.error);

