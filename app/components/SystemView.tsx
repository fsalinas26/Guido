'use client';

import { useState, useEffect } from 'react';

interface SystemViewProps {
  systemState: any;
  transcript: Array<{role: string; content: string}>;
}

export function SystemView({ systemState, transcript }: SystemViewProps) {
  console.log('🖥️ SystemView rendering with state:', systemState);
  console.log('📊 Has retrievedSOP?', !!systemState.retrievedSOP);
  
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [completedAgents, setCompletedAgents] = useState<Set<number>>(new Set());
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);
  const [agentDetails, setAgentDetails] = useState<Record<number, string>>({});
  
  const agents = [
    { id: 1, name: 'Intent Classifier', icon: '🎯', description: 'Identifies query intent' },
    { id: 2, name: 'SOP Retriever', icon: '🔍', description: 'Searches Weaviate for SOPs' },
    { id: 3, name: 'Decision Navigator', icon: '🧭', description: 'Guides through decision tree' },
    { id: 4, name: 'Action Executor', icon: '⚙️', description: 'Executes measurement tools' },
    { id: 5, name: 'Logger', icon: '📝', description: 'Records outcomes' }
  ];
  
  // Simulate pipeline progression when new data arrives
  useEffect(() => {
    if (systemState.retrievedSOP && systemState.intent) {
      // New pipeline run detected - simulate agent progression
      const runPipeline = async () => {
        // Agent 1: Intent Classifier
        setActiveAgent(1);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCompletedAgents(prev => new Set(prev).add(1));
        setAgentDetails(prev => ({ ...prev, 1: `Detected: ${systemState.intent}` }));
        
        // Agent 2: SOP Retriever
        setActiveAgent(2);
        await new Promise(resolve => setTimeout(resolve, 800));
        setCompletedAgents(prev => new Set(prev).add(2));
        setAgentDetails(prev => ({ ...prev, 2: `Retrieved: ${systemState.retrievedSOP.sop_id}` }));
        
        // Agent 3: Decision Navigator
        setActiveAgent(3);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCompletedAgents(prev => new Set(prev).add(3));
        setAgentDetails(prev => ({ ...prev, 3: `Navigating: ${systemState.retrievedSOP.chunks?.length || 0} steps` }));
        
        // Agent 4: Action Executor
        setActiveAgent(4);
        await new Promise(resolve => setTimeout(resolve, 600));
        setCompletedAgents(prev => new Set(prev).add(4));
        setAgentDetails(prev => ({ ...prev, 4: 'Tools executed' }));
        
        // Agent 5: Logger
        setActiveAgent(5);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCompletedAgents(prev => new Set(prev).add(5));
        setAgentDetails(prev => ({ ...prev, 5: 'Session logged' }));
        
        // Fade out active state after 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        setActiveAgent(null);
      };
      
      runPipeline();
    }
  }, [systemState.retrievedSOP, systemState.intent]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">System View</h2>
        <p className="text-sm opacity-90">Multi-Agent Pipeline Visualization</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Pipeline Status */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Agent Pipeline</h3>
          <div className="space-y-3">
            {agents.map((agent) => {
              const isActive = activeAgent === agent.id;
              const isCompleted = completedAgents.has(agent.id);
              const isExpanded = expandedAgent === agent.id;
              const details = agentDetails[agent.id];
              
              return (
                <div 
                  key={agent.id} 
                  className={`
                    rounded-lg p-4 border shadow-sm cursor-pointer
                    transition-all duration-700 ease-in-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-lg scale-105 ring-2 ring-blue-300' 
                      : isCompleted 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl transition-transform duration-500 ${
                      isActive ? 'scale-125 animate-bounce' : ''
                    }`}>
                      {agent.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900">{agent.name}</div>
                        {isActive && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                            Running...
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{agent.description}</div>
                      
                      {/* Summary - show when completed */}
                      {details && !isExpanded && (
                        <div className="text-xs text-green-700 font-medium mt-1 flex items-center gap-1">
                          <span>✓</span>
                          <span>{details}</span>
                          <span className="text-gray-400 ml-1">▼</span>
                        </div>
                      )}
                      
                      {/* Expanded Details */}
                      {isExpanded && details && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <div>
                              <div className="font-medium text-gray-900">Status: Completed</div>
                              <div className="text-gray-700">{details}</div>
                            </div>
                          </div>
                          
                          {/* Agent-specific details */}
                          {agent.id === 1 && systemState.intent && (
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <div className="font-semibold text-blue-900">Intent Detected:</div>
                              <div className="text-blue-700">{systemState.intent}</div>
                              {systemState.intent === 'quality_issue' && (
                                <div className="text-green-600 mt-1">→ Triggering quality control workflow</div>
                              )}
                            </div>
                          )}
                          
                          {agent.id === 2 && systemState.retrievedSOP && (
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <div className="font-semibold text-blue-900">Retrieved from Weaviate:</div>
                              <div className="text-blue-700">{systemState.retrievedSOP.sop_title}</div>
                              <div className="text-gray-600 mt-1">
                                📚 {systemState.retrievedSOP.chunks?.length || 0} relevant chunks
                              </div>
                            </div>
                          )}
                          
                          {agent.id === 3 && (
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <div className="font-semibold text-blue-900">Using:</div>
                              <div className="text-blue-700">LLM-powered decision navigation</div>
                              <div className="text-gray-600 mt-1">Guiding worker through SOP steps</div>
                            </div>
                          )}
                          
                          {agent.id === 4 && (
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <div className="font-semibold text-blue-900">Available Tools:</div>
                              <div className="text-gray-600 space-y-0.5">
                                <div>• measureDefectDepth()</div>
                                <div>• checkSurfaceRoughness()</div>
                                <div>• analyzeDefectPattern()</div>
                              </div>
                            </div>
                          )}
                          
                          {agent.id === 5 && (
                            <div className="bg-blue-50 rounded p-2 text-xs">
                              <div className="font-semibold text-blue-900">Logged:</div>
                              <div className="text-gray-600">
                                Session recorded with full conversation history and decisions
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400 text-center pt-1">
                            Click to collapse ▲
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`
                        w-3 h-3 rounded-full transition-all duration-700
                        ${isActive 
                          ? 'bg-blue-500 animate-ping' 
                          : isCompleted 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }
                      `}></div>
                      {!isActive && isCompleted && (
                        <div className="text-xs text-gray-400">
                          {isExpanded ? '▲' : '▼'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retrieved Data from Weaviate */}
        {systemState.retrievedSOP && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>📊 Data Retrieved from Weaviate</span>
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300 mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-blue-900 text-lg">{systemState.retrievedSOP.sop_id}</div>
                  <div className="text-sm text-blue-700">{systemState.retrievedSOP.sop_title}</div>
                </div>
                <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {systemState.retrievedSOP.source}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="text-sm font-semibold text-blue-900 mb-2">
                  📚 {systemState.retrievedSOP.chunks?.length || 0} chunks retrieved
                </div>
              </div>
            </div>
            
            {/* Show Retrieved Chunks */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {systemState.retrievedSOP.chunks?.map((chunk: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase">
                      {chunk.chunk_type}
                      {chunk.step_number && ` - Step ${chunk.step_number}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      Similarity: {(chunk.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{chunk.chunk_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tool Executions */}
        {systemState.toolExecutions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Tool Executions</h3>
            <div className="space-y-2">
              {systemState.toolExecutions.map((tool: any, idx: number) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-semibold text-green-900">{tool.name}</div>
                  <div className="text-sm text-green-700">Result: {JSON.stringify(tool.result).substring(0, 100)}...</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transcript.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-lg">Waiting for conversation to start...</p>
            <p className="text-sm mt-2">System is ready. Start a conversation to see the agents in action.</p>
          </div>
        )}
      </div>
    </div>
  );
}

