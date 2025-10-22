/**
 * Agent 4: Action Executor
 * Executes tool calls and returns results
 */

import { ToolCall, ToolResult } from '@/lib/utils/types';
import { executeTool } from '@/lib/tools/implementations';

export async function executeActions(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];
  
  for (const toolCall of toolCalls) {
    try {
      const functionName = toolCall.function.name;
      const parameters = JSON.parse(toolCall.function.arguments);
      
      console.log(`Executing tool: ${functionName}`, parameters);
      
      const result = executeTool(functionName, parameters);
      
      results.push({
        tool_name: functionName,
        parameters: parameters,
        result: result,
        error: false
      });
      
      console.log(`Tool ${functionName} executed successfully:`, result);
      
    } catch (error) {
      console.error(`Error executing tool ${toolCall.function.name}:`, error);
      
      results.push({
        tool_name: toolCall.function.name,
        parameters: {},
        result: null,
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Format tool results into natural language for the agent
 */
export function formatToolResults(results: ToolResult[]): string {
  if (results.length === 0) {
    return '';
  }
  
  const formatted = results.map(result => {
    if (result.error) {
      return `Error executing ${result.tool_name}: ${result.message}`;
    }
    
    switch (result.tool_name) {
      case 'measureDefectDepth':
        const depthResult = result.result;
        return `Defect depth measurement: ${depthResult.depth_mm}mm at ${depthResult.location}. Tolerance limit is ${depthResult.tolerance_limit_mm}mm. ${depthResult.tolerance_exceeded ? '⚠️ EXCEEDS TOLERANCE' : '✓ Within tolerance'}.`;
        
      case 'checkSurfaceRoughness':
        const roughnessResult = result.result;
        return `Surface roughness: Average Ra ${roughnessResult.average_Ra_um}µm (measured at ${roughnessResult.measurement_points} points). Spec limit is ${roughnessResult.spec_limit_Ra_um}µm. ${roughnessResult.within_spec ? '✓ Within spec' : '⚠️ EXCEEDS SPEC'}.`;
        
      case 'analyzeDefectPattern':
        const patternResult = result.result;
        return `Defect pattern analysis: ${patternResult.pattern_type} pattern detected. Likely cause: ${patternResult.likely_cause}. ${patternResult.severity_assessment}.`;
        
      default:
        return `${result.tool_name} completed: ${JSON.stringify(result.result)}`;
    }
  });
  
  return '\n\n' + formatted.join('\n\n');
}

