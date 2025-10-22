# SOP-QC-015: Surface Defect Evaluation and Quarantine Protocol for Brake Rotors

## Document Information
- **SOP ID**: SOP-QC-015
- **Title**: Surface Defect Evaluation and Quarantine Protocol for Brake Rotors
- **Category**: Quality Control & Inspection
- **Revision**: 2.1
- **Effective Date**: January 1, 2025
- **Department**: Quality Control - Brake Components
- **Supersedes**: SOP-QC-015 Rev 2.0

## Purpose
This Standard Operating Procedure provides detailed instructions for identifying, evaluating, and dispositioning brake rotors with surface defects. This procedure ensures that only rotors meeting specifications are released for assembly, protecting product quality and customer safety.

## Scope
This SOP applies to all quality control personnel responsible for inspecting brake rotors at Line 3 Quality Control Station and all related inspection points.

## Definitions
- **Surface Defect**: Any imperfection on the braking surface including scratches, pits, gouges, or roughness
- **Tolerance**: Maximum acceptable depth (0.02mm) or roughness (Ra 1.6µm)
- **Quarantine**: Segregation of non-conforming parts pending disposition
- **Ra Value**: Roughness Average in micrometers (µm)

## Equipment Required
- Surface roughness gauge (calibrated)
- Digital calipers or depth micrometer  
- Surface defect measurement tool
- Red quarantine tags
- Batch tracking scanner
- Safety glasses and gloves (PPE)

## Responsibilities
- **QC Inspector**: Perform inspection per this SOP, make accept/reject decisions
- **Line Supervisor**: Provide guidance, approve quarantine decisions
- **Quality Engineer**: Review quarantined batches, determine root cause
- **Production Worker**: Report suspected defects immediately

---

## Procedure

### Step 1: Initial Visual Inspection
When a batch of brake rotors arrives at the QC station or a worker reports potential defects:

1. Don required PPE (safety glasses, gloves)
2. Verify batch number and production line source
3. Perform initial visual inspection of rotor surfaces
4. Look for:
   - Scratches (straight lines, circular marks)
   - Pitting (small craters or holes)
   - Gouges (deep grooves)
   - Surface roughness or texture issues
   - Discoloration or contamination

⚠️ **NOTE**: If no defects are visible, proceed with standard inspection per SOP-QC-012.

### Step 2: Defect Pattern Analysis
If defects are observed, identify the pattern type:

**Pattern Types:**
- **Circular/Concentric**: Rings or circles following rotor rotation
  - *Likely Cause*: Machining process (lathe operation)
  - *Severity*: Low to moderate
  
- **Linear/Straight**: Parallel or straight-line scratches
  - *Likely Cause*: Handling or transport damage
  - *Severity*: Moderate
  
- **Random/Scattered**: Multiple irregular defects, pitting
  - *Likely Cause*: Material defect or contamination
  - *Severity*: Moderate to high

**ACTION**: Document the defect pattern in the inspection log.

### Step 3: Defect Depth Measurement
Use the surface roughness gauge to measure defect depth:

1. Clean the measurement area with approved cleaner
2. Calibrate gauge if not calibrated within last 8 hours
3. Place gauge probe perpendicular to defect
4. Take measurement at deepest visible point
5. Record depth in millimeters (mm)
6. Take 2-3 additional measurements for verification

**Critical Decision Point:**
- If depth ≤ 0.02mm: Proceed to Step 4
- If depth > 0.02mm: **QUARANTINE REQUIRED** - Skip to Step 6

### Step 4: Surface Roughness Check
For defects within depth tolerance, check overall surface roughness:

1. Select 3-5 measurement points across braking surface
2. Ensure measurement points include defect area
3. Take Ra (roughness average) measurements
4. Calculate average Ra value
5. Record all measurements

**Specification Limit**: Ra ≤ 1.6µm

**Critical Decision Point:**
- If average Ra ≤ 1.6µm: Proceed to Step 5 (ACCEPT)
- If average Ra > 1.6µm: Proceed to Step 6 (QUARANTINE)

### Step 5: Accept with Documentation
For parts meeting both depth AND roughness specifications:

1. Mark inspection record as "ACCEPTED - MINOR DEFECTS WITHIN SPEC"
2. Document:
   - Defect type and pattern
   - Measurements taken
   - Inspector name and date
3. Attach green inspection tag
4. Release batch to next operation
5. Log in quality database
6. **END OF PROCEDURE**

### Step 6: Quarantine Procedure
For parts **exceeding tolerances** (depth > 0.02mm OR Ra > 1.6µm):

⚠️ **CRITICAL**: Parts must be quarantined immediately.

1. **Stop further processing** of the affected batch
2. Count total number of parts in batch
3. Attach RED QUARANTINE TAG to each part
4. Record on tag:
   - Batch number
   - Defect type
   - Measurements
   - Date and inspector
5. Scan batch QR code into quarantine system
6. Physically move parts to **Quarantine Bay 7**
7. Create Non-Conformance Report (NCR) in system

**Quarantine Bay Location**: Bay 7, North wall, marked with red tape

### Step 7: Notification and Escalation
After quarantining parts:

1. **Immediately notify**:
   - Line Supervisor
   - Quality Engineer
   - Production Manager (for batches > 20 parts)
   
2. **Provide information**:
   - Batch number and quantity
   - Production line and time
   - Defect measurements
   - Pattern/likely cause
   
3. Quality Engineer will:
   - Review within 4 hours
   - Determine root cause
   - Decide disposition (scrap, rework, use-as-is with deviation)
   - Initiate corrective action if needed

### Step 8: Documentation and Follow-Up
1. Complete Inspection Report Form QC-015-A
2. Enter all data into Quality Management System
3. Attach photos if available
4. File paper records in QC filing cabinet
5. Follow up on corrective actions as assigned

---

## Decision Matrix - Quick Reference

| Measurement | Spec Limit | Result | Action |
|-------------|------------|--------|--------|
| Defect Depth | ≤ 0.02mm | Within spec | Check roughness (Step 4) |
| Defect Depth | > 0.02mm | **EXCEEDS SPEC** | **QUARANTINE** (Step 6) |
| Surface Roughness | ≤ 1.6µm Ra | Within spec | ACCEPT (Step 5) |
| Surface Roughness | > 1.6µm Ra | **EXCEEDS SPEC** | **QUARANTINE** (Step 6) |
| Both within spec | - | Pass | ACCEPT (Step 5) |
| Either exceeds | - | Fail | **QUARANTINE** (Step 6) |

---

## Safety Warnings

⚠️ **WARNING**: Always wear safety glasses when handling brake rotors. Sharp edges may be present.

⚠️ **WARNING**: Ensure measuring equipment is calibrated. Using out-of-calibration equipment may result in incorrect accept/reject decisions.

⚠️ **CAUTION**: Do not stack more than 5 rotors when moving to quarantine to prevent damage.

---

## Special Cases

### Case 1: Borderline Measurements
If measurement is within ±0.002mm of tolerance limit (e.g., 0.019mm - 0.022mm):
- Take 5 additional measurements
- Use average of all measurements
- Consult with supervisor before final decision

### Case 2: Customer-Specific Requirements  
Some customers have tighter specifications. Check customer requirements in Quality Database before dispositioning.

### Case 3: Rework Operations
If Engineering approves rework:
- Parts must be re-inspected per this SOP after rework
- Document as "REWORKED" in system
- Requires Quality Engineer signature

---

## Reference Documents
- SOP-QC-012: Standard Brake Rotor Inspection
- SOP-QC-019: Non-Conforming Product Procedures
- SPEC-BR-001: Brake Rotor Engineering Specifications
- Training Module TM-QC-105

## Training Requirements
- Initial training: 4 hours classroom + 8 hours hands-on
- Annual refresher: 2 hours
- Measurement proficiency test: Required annually

## Revision History
| Revision | Date | Description | Author |
|----------|------|-------------|--------|
| 2.1 | 2025-01-01 | Added decision matrix, updated tolerance limits | J. Smith, Quality Mgr |
| 2.0 | 2024-06-15 | Revised quarantine procedure | K. Johnson, QE |
| 1.0 | 2024-01-01 | Initial release | Quality Team |

---

**Document ID**: SOP-QC-015 Rev 2.1  
**Confidential - For Internal Use Only**  
**Printed copies are uncontrolled**

