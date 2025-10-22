'use client';

import { useState } from 'react';
import { WorkerView } from './components/WorkerView';
import { SystemView } from './components/SystemView';

export default function HomePage() {
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string; content: string}>>([]);
  const [systemState, setSystemState] = useState<any>({
    currentAgent: null,
    retrievedChunks: [],
    toolExecutions: [],
    pipelineProgress: 0
  });

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Panel: Worker View */}
      <div className="w-1/2 bg-white border-r border-gray-300">
        <WorkerView 
          callActive={callActive}
          setCallActive={setCallActive}
          transcript={transcript}
          setTranscript={setTranscript}
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

