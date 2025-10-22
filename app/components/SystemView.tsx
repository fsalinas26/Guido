'use client';

interface SystemViewProps {
  systemState: any;
  transcript: Array<{role: string; content: string}>;
}

export function SystemView({ systemState, transcript }: SystemViewProps) {
  const agents = [
    { id: 1, name: 'Intent Classifier', icon: '🎯', description: 'Identifies query intent' },
    { id: 2, name: 'SOP Retriever', icon: '🔍', description: 'Searches Weaviate for SOPs' },
    { id: 3, name: 'Decision Navigator', icon: '🧭', description: 'Guides through decision tree' },
    { id: 4, name: 'Action Executor', icon: '⚙️', description: 'Executes measurement tools' },
    { id: 5, name: 'Logger', icon: '📝', description: 'Records outcomes' }
  ];

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
            {agents.map((agent, idx) => (
              <div key={agent.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{agent.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.description}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    systemState.currentAgent === agent.id ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Technology Stack</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Frontend:</span>
              <span className="font-semibold">Next.js + React</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agent Framework:</span>
              <span className="font-semibold">LlamaIndex.TS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LLM Provider:</span>
              <span className="font-semibold">Friendli (Llama 3.1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vector Database:</span>
              <span className="font-semibold">Weaviate Cloud</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Voice Interface:</span>
              <span className="font-semibold">Vapi</span>
            </div>
          </div>
        </div>

        {/* Retrieved Data */}
        {systemState.retrievedChunks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Retrieved SOP Chunks</h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                {systemState.retrievedChunks.length} chunks retrieved from {systemState.currentSOP}
              </p>
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

