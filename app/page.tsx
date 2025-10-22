'use client';

import { useState } from 'react';
import { WorkerView } from './components/WorkerView';
import { SystemView } from './components/SystemView';

export default function HomePage() {
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string; content: string}>>([]);
  const [systemState, setSystemState] = useState<any>({
    currentAgent: null,
    retrievedSOP: null,
    intent: null,
    toolExecutions: [],
    pipelineProgress: 0
  });

  const handleSystemUpdate = (data: any) => {
    console.log('🔄 handleSystemUpdate called with:', data);
    setSystemState((prev: any) => {
      const newState = {
        ...prev,
        ...data
      };
      console.log('📝 New system state:', newState);
      return newState;
    });
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel: Worker View */}
      <div className="w-1/2 bg-white border-r border-gray-300">
        <WorkerView 
          callActive={callActive}
          setCallActive={setCallActive}
          transcript={transcript}
          setTranscript={setTranscript}
          onSystemUpdate={handleSystemUpdate}
        />
      </div>
      
      {/* Right Panel: System View */}
      <div className="w-1/2 bg-gray-50">
        <SystemView 
          systemState={systemState}
          transcript={transcript}
        />
      </div>
    </div>
  );
}

