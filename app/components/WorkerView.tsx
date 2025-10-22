'use client';

import { useState } from 'react';

interface WorkerViewProps {
  callActive: boolean;
  setCallActive: (active: boolean) => void;
  transcript: Array<{role: string; content: string}>;
  setTranscript: (transcript: Array<{role: string; content: string}>) => void;
}

export function WorkerView({ callActive, setCallActive, transcript, setTranscript }: WorkerViewProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    setLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');

    // Add user message to transcript
    setTranscript([...transcript, { role: 'user', content: userMessage }]);

    try {
      // Call pipeline API
      const response = await fetch('/api/agent/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          callId: 'demo-call-' + Date.now()
        })
      });

      const data = await response.json();

      // Add assistant response to transcript
      setTranscript([
        ...transcript,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.agentResponse }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setTranscript([
        ...transcript,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: 'Error: Could not process your request.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">AI Supervisor</h1>
        <div className="text-sm opacity-90">
          <div>Worker: <span className="font-semibold">Jake</span></div>
          <div>Station: <span className="font-semibold">Line 3 - Quality Control</span></div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${callActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {callActive ? 'Call Active' : 'Ready to Start'}
          </span>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {transcript.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg">Type a message or click "Start Demo Scenario" below</p>
          </div>
        ) : (
          transcript.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-75">
                  {msg.role === 'user' ? 'Jake' : 'AI Supervisor'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Quick Demo Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setInputMessage("I'm seeing scratches on these brake rotors from Line 3")}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            📋 Start Demo Scenario
          </button>
          <button
            onClick={() => setTranscript([])}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}

