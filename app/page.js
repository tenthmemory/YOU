'use client';

import { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import Face from './components/Face';

export default function Home() {
  const [stage, setStage] = useState('intro');
  const [apiKey, setApiKey] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('you-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      setStage('terminal');
    } else {
      setTimeout(() => setShowContent(true), 500);
      setTimeout(() => setShowInput(true), 2500);
    }
  }, []);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim().startsWith('sk-')) {
      localStorage.setItem('you-api-key', apiKey.trim());
      setStage('terminal');
    }
  };

  if (stage === 'terminal') {
    return <Terminal apiKey={apiKey} />;
  }

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center justify-between p-12">
      {/* Top - Title */}
      <div className={`transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-lg tracking-[0.5em] lowercase">you</h1>
      </div>

      {/* Middle - Face + Input */}
      <div className="flex flex-col items-center">
        {/* Face */}
        <div className={`mb-12 transition-opacity duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <Face mood="neutral" isBlinking={false} glitch={false} mousePos={{ x: 0, y: 0 }} isSpeaking={false} />
        </div>

        {/* API Key input */}
        {showInput && (
          <form onSubmit={handleApiKeySubmit} className="animate-fadeIn">
            <div className="flex flex-col items-center gap-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="enter api key"
                className="w-64 bg-transparent text-center text-sm text-black placeholder-neutral-300 focus:outline-none border-b border-neutral-200 focus:border-neutral-400 pb-2 transition-colors"
                autoFocus
              />
              <p className="text-[10px] text-neutral-300 mt-2">
                your key stays in your browser
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Bottom - Tagline */}
      <div className={`transition-opacity duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm text-neutral-400 tracking-wide">
          create a digital consciousness of yourself
        </p>
      </div>
    </main>
  );
}
