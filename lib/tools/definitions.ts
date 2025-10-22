/**
 * Tool definitions for OpenAI/Friendli function calling
 */

import { ToolDefinition } from '@/lib/utils/types';

export const TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'measureDefectDepth',
      description: 'Measures the depth of surface defects on brake rotors using a surface roughness gauge. Returns depth in millimeters.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'Location of defect on the rotor (e.g., "center", "edge", "face", "inner rim")'
          },
          defect_type: {
            type: 'string',
            enum: ['scratch', 'pit', 'gouge'],
            description: 'Type of defect being measured'
          }
        },
        required: ['location', 'defect_type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'checkSurfaceRoughness',
      description: 'Checks overall surface roughness of brake rotor using calibrated gauge. Returns Ra (roughness average) values in micrometers.',
      parameters: {
        type: 'object',
        properties: {
          measurement_points: {
            type: 'number',
            description: 'Number of points to measure across the surface (typically 3-5)'
          }
        },
        required: ['measurement_points']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyzeDefectPattern',
      description: 'Analyzes and identifies the pattern type of surface defects to determine likely cause (machining, handling, material defect)',
      parameters: {
        type: 'object',
        properties: {
          defect_description: {
            type: 'string',
            description: "Worker's description of what the defect looks like (e.g., 'circular scratches', 'random pitting', 'straight lines')"
          }
        },
        required: ['defect_description']
      }
    }
  }
];

