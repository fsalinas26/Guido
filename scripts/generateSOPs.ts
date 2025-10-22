/**
 * Script to generate synthetic SOP documents
 * Run with: npm run generate-sops
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// SOP categories from spec
const SOP_CATEGORIES = {
  'Equipment Operation & Maintenance': 12,
  'Quality Control & Inspection': 10,
  'Safety & Environmental': 8,
  'Production & Scheduling': 7,
  'Material Handling': 6,
  'Documentation & Compliance': 7
};

// Sample SOP titles for each category
const SOP_TEMPLATES: Record<string, string[]> = {
  'Equipment Operation & Maintenance': [
    'CNC Machine Startup and Shutdown Procedures',
    'Hydraulic Press Operation Protocol',
    'Conveyor Belt Safety Procedures',
    'Torque Wrench Calibration Checks',
    'Equipment Lockout/Tagout (LOTO)',
    'Preventive Maintenance Schedules',
    'Tool Inspection Procedures',
    'Machine Changeover Protocols',
    'Equipment Failure Reporting',
    'Calibration Verification',
    'Lubrication Procedures',
    'Emergency Equipment Shutdown'
  ],
  'Quality Control & Inspection': [
    'Incoming Material Inspection',
    'In-Process Quality Checks',
    'Final Product Inspection',
    'Defect Identification and Classification',
    'Statistical Process Control (SPC)',
    'Measurement Device Handling',
    'Non-Conforming Product Procedures',
    'Quality Documentation Requirements',
    'Customer Complaint Handling',
    'Corrective Action Procedures'
  ],
  'Safety & Environmental': [
    'Personal Protective Equipment (PPE) Requirements',
    'Chemical Handling Procedures',
    'Spill Response Protocols',
    'Fire Evacuation Procedures',
    'Accident Reporting Procedures',
    'Hazardous Waste Disposal',
    'Confined Space Entry',
    'Ergonomic Lifting Techniques'
  ],
  'Production & Scheduling': [
    'Work Order Processing',
    'Shift Handover Procedures',
    'Production Line Setup',
    'Batch Tracking and Traceability',
    'Inventory Management',
    'Work Instruction Interpretation',
    'Production Scheduling Changes'
  ],
  'Material Handling': [
    'Raw Material Receiving',
    'Material Storage Procedures',
    'Forklift Operation Safety',
    'Crane Operation Protocols',
    'Material Identification and Labeling',
    'Shipping and Packaging Procedures'
  ],
  'Documentation & Compliance': [
    'Production Record Keeping',
    'Training Record Maintenance',
    'Audit Preparation Procedures',
    'Regulatory Compliance Checks',
    'Change Control Procedures',
    'Document Control System',
    'Data Backup and Security'
  ]
};

function generateSOPDocument(sopId: string, title: string, category: string): string {
  return `# ${sopId}: ${title}

## Document Information
- **SOP ID**: ${sopId}
- **Title**: ${title}
- **Category**: ${category}
- **Revision**: 1.0
- **Effective Date**: January 1, 2025
- **Department**: Manufacturing Operations

## Purpose
This Standard Operating Procedure (SOP) provides detailed instructions for ${title.toLowerCase()} in the manufacturing environment. This procedure ensures consistency, quality, and safety in operations.

## Scope
This SOP applies to all personnel involved in ${category.toLowerCase()} operations at the facility.

## Definitions
- **SOP**: Standard Operating Procedure
- **QC**: Quality Control
- **PPE**: Personal Protective Equipment

## Responsibilities
- **Production Workers**: Follow all steps outlined in this SOP
- **Supervisors**: Ensure compliance and provide guidance
- **Quality Team**: Verify adherence to standards

## Procedure

### Step 1: Pre-Operation Checks
Before beginning any ${category.toLowerCase()} tasks, verify that:
- All required equipment is available and in good condition
- Personal protective equipment (PPE) is worn
- Work area is clean and organized
- Documentation is ready for recording

### Step 2: Setup
1. Gather all necessary tools and equipment
2. Review work instructions and specifications
3. Verify material identification and batch numbers
4. Check that all measuring instruments are calibrated

### Step 3: Operation
1. Follow manufacturer's instructions for equipment operation
2. Monitor process parameters continuously
3. Record readings at specified intervals
4. Report any deviations immediately

### Step 4: Quality Checks
1. Perform in-process inspections at defined checkpoints
2. Use appropriate measuring tools
3. Compare measurements against specifications
4. Document all findings

### Step 5: Decision Point - Quality Assessment
**If measurements are within specification:**
- Continue with normal operations
- Document acceptance

**If measurements exceed tolerance:**
- Stop operation immediately
- Tag product as non-conforming
- Notify supervisor and quality team
- Follow quarantine procedures

### Step 6: Completion
1. Complete all required documentation
2. Clean and organize work area
3. Store tools and equipment properly
4. Report completion to supervisor

### Step 7: Documentation
Record the following information:
- Operator name and date
- Batch/lot numbers
- Inspection results
- Any deviations or issues
- Final disposition (accept/reject/quarantine)

## Safety Considerations
⚠️ **WARNING**: Always wear required PPE including safety glasses, gloves, and protective footwear.

⚠️ **CAUTION**: Report any equipment malfunctions immediately. Do not operate faulty equipment.

## Reference Documents
- Quality Manual QM-2025
- Safety Procedures SP-100
- Training Requirements TR-200

## Revision History
| Revision | Date | Description | Author |
|----------|------|-------------|--------|
| 1.0 | 2025-01-01 | Initial release | Quality Team |

---
*Document ID: ${sopId} | Confidential - For Internal Use Only*
`;
}

async function main() {
  console.log('🚀 Starting SOP generation...\n');

  // Create data/sops directory if it doesn't exist
  const sopsDir = join(process.cwd(), 'data', 'sops');
  try {
    mkdirSync(sopsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  let sopCounter = 1;
  const generatedSOPs: Array<{id: string; title: string; category: string}> = [];

  // Generate SOPs for each category
  for (const [category, count] of Object.entries(SOP_CATEGORIES)) {
    console.log(`📁 Generating ${count} SOPs for category: ${category}`);
    
    const templates = SOP_TEMPLATES[category];
    
    for (let i = 0; i < Math.min(count, templates.length); i++) {
      const sopId = `SOP-${category.split(' ')[0].substring(0, 2).toUpperCase()}-${String(sopCounter).padStart(3, '0')}`;
      const title = templates[i];
      
      // Generate markdown content
      const content = generateSOPDocument(sopId, title, category);
      
      // Write to file
      const filename = `${sopId}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
      const filepath = join(sopsDir, filename);
      
      writeFileSync(filepath, content, 'utf-8');
      
      generatedSOPs.push({ id: sopId, title, category });
      console.log(`  ✅ Created: ${filename}`);
      
      sopCounter++;
    }
    console.log('');
  }

  // Generate index file
  const indexContent = `# SOP Index

Total SOPs: ${generatedSOPs.length}

## By Category

${Object.entries(SOP_CATEGORIES).map(([category, count]) => {
  const categorySOPs = generatedSOPs.filter(sop => sop.category === category);
  return `### ${category}\n${categorySOPs.map(sop => `- **${sop.id}**: ${sop.title}`).join('\n')}`;
}).join('\n\n')}

---
Generated: ${new Date().toISOString()}
`;

  writeFileSync(join(sopsDir, 'INDEX.md'), indexContent, 'utf-8');
  console.log(`📋 Created index file with ${generatedSOPs.length} SOPs\n`);

  console.log(`✨ SOP generation complete! Generated ${generatedSOPs.length} SOPs`);
  console.log(`📂 Location: ${sopsDir}\n`);
}

main().catch(console.error);

