/**
 * Agent Pipeline Orchestrator
 * Runs the 5-agent sequential pipeline
 */

import { AgentPipelineRequest, AgentPipelineResponse } from '@/lib/utils/types';
import { getOrCreateSession, addMessage, updateSession, addAction, addDecision, updateMeasurements } from '@/lib/state/sessionManager';
import { classifyIntent } from './intentClassifier';
import { retrieveSOPs } from './sopRetriever';
import { navigateDecisionTree } from './decisionNavigator';
import { executeActions, formatToolResults } from './actionExecutor';
import { logInteraction } from './logger';

export async function runAgentPipeline(
  request: AgentPipelineRequest
): Promise<AgentPipelineResponse> {
  const { userMessage, callId } = request;
  
  console.log('\n=== Agent Pipeline Start ===');
  console.log('Call ID:', callId);
  console.log('User Message:', userMessage);
  
  try {
    // Get or create session
    const session = getOrCreateSession(callId);
    
    // Add user message to conversation history
    addMessage(callId, 'user', userMessage);
    
    // ========================================================================
    // AGENT 1: Intent Classification
    // ========================================================================
    console.log('\n[1/5] Running Intent Classifier...');
    const intent = await classifyIntent(userMessage, session);
    console.log('Intent:', intent.intent, `(${intent.confidence})`);
    
    // ========================================================================
    // AGENT 2: SOP Retrieval
    // ========================================================================
    console.log('\n[2/5] Running SOP Retriever...');
    const sopContext = await retrieveSOPs(userMessage, intent);
    console.log('Retrieved SOP:', sopContext.sop_id);
    
    // Update session with current SOP
    if (sopContext.sop_id !== 'NONE') {
      updateSession(callId, {
        current_sop_id: sopContext.sop_id
      });
    }
    
    // ========================================================================
    // AGENT 3: Decision Tree Navigator
    // ========================================================================
    console.log('\n[3/5] Running Decision Navigator...');
    const navigation = await navigateDecisionTree(
      userMessage,
      sopContext,
      session
    );
    console.log('Navigation response:', navigation.agent_response.substring(0, 100) + '...');
    console.log('Tool calls:', navigation.tool_calls.length);
    
    let finalResponse = navigation.agent_response;
    
    // ========================================================================
    // AGENT 4: Action Executor
    // ========================================================================
    if (navigation.tool_calls.length > 0) {
      console.log('\n[4/5] Running Action Executor...');
      const toolResults = await executeActions(navigation.tool_calls);
      console.log('Tools executed:', toolResults.length);
      
      // Format and append tool results to response
      const toolResultsText = formatToolResults(toolResults);
      finalResponse += toolResultsText;
      
      // Update session with actions and measurements
      for (const result of toolResults) {
        addAction(callId, result.tool_name, result.parameters, result.result);
        
        // Extract measurements
        if (!result.error && result.result) {
          const measurements: Record<string, any> = {};
          
          if (result.tool_name === 'measureDefectDepth') {
            measurements.defect_depth = result.result.depth_mm;
          } else if (result.tool_name === 'checkSurfaceRoughness') {
            measurements.surface_roughness = result.result.average_Ra_um;
          } else if (result.tool_name === 'analyzeDefectPattern') {
            measurements.defect_pattern = result.result.pattern_type;
          }
          
          updateMeasurements(callId, measurements);
        }
      }
    } else {
      console.log('\n[4/5] No tools to execute, skipping Action Executor');
    }
    
    // Update session with decision if made
    if (navigation.decision_made) {
      console.log('Decision made:', navigation.decision_made.outcome);
      addDecision(
        callId,
        navigation.next_step || 0,
        `${navigation.decision_made.outcome}: ${navigation.decision_made.reasoning}`
      );
      
      // Update status if quarantine or accept decision
      if (navigation.decision_made.outcome === 'QUARANTINE' || navigation.decision_made.outcome === 'ACCEPT') {
        updateSession(callId, {
          status: 'awaiting_input' // Wait for worker confirmation
        });
      }
    }
    
    // Update current step
    if (navigation.next_step) {
      updateSession(callId, {
        current_step: navigation.next_step
      });
    }
    
    // ========================================================================
    // AGENT 5: Logger
    // ========================================================================
    console.log('\n[5/5] Running Logger...');
    const updatedSession = getOrCreateSession(callId);
    await logInteraction(
      updatedSession,
      intent,
      sopContext.sop_id,
      userMessage,
      finalResponse,
      updatedSession.actions_executed
    );
    
    // Add assistant response to conversation history
    addMessage(callId, 'assistant', finalResponse);
    
    console.log('\n=== Agent Pipeline Complete ===\n');
    
    // Return final response
    const finalSession = getOrCreateSession(callId);
    return {
      agentResponse: finalResponse,
      sessionState: finalSession
    };
    
  } catch (error) {
    console.error('Error in agent pipeline:', error);
    
    // Return error response
    return {
      agentResponse: "I'm experiencing technical difficulties. Let me connect you with a supervisor.",
      sessionState: getOrCreateSession(callId),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

