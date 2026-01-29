'use client';

import { useState, useEffect, useRef } from 'react';
import Face from './Face';

export default function Terminal({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('intro'); // intro, learning, birthing, dashboard, chat
  const [mood, setMood] = useState('neutral');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [isBlinking, setIsBlinking] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [twinPersonality, setTwinPersonality] = useState(null);
  const [birthText, setBirthText] = useState('');
  const messagesEndRef = useRef(null);
  const faceRef = useRef(null);

  // Reduced to 5 essential questions
  const interviewQuestions = [
    "what should i call you?",
    "what do you think about when you can't sleep?",
    "who are you when nobody's watching?",
    "what are you running from?",
    "what do you want more than anything?"
  ];

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7 && !isTyping && phase !== 'birthing') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2000);
    return () => clearInterval(blinkInterval);
  }, [isTyping, phase]);

  // Random glitches
  useEffect(() => {
    if (questionIndex > 2 || phase === 'dashboard' || phase === 'chat') {
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.85) {
          setGlitch(true);
          setTimeout(() => setGlitch(false), 100 + Math.random() * 150);
        }
      }, 3000);
      return () => clearInterval(glitchInterval);
    }
  }, [questionIndex, phase]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (faceRef.current) {
        const rect = faceRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / 200));
        const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / 200));
        setMousePos({ x: x * 0.3, y: y * 0.3 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Speaking animation
  useEffect(() => {
    if (isTyping) {
      const speakInterval = setInterval(() => setIsSpeaking(prev => !prev), 150);
      return () => clearInterval(speakInterval);
    } else {
      setIsSpeaking(false);
    }
  }, [isTyping]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start interview
  useEffect(() => {
    if (phase === 'intro') {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages([{ sender: 'you', text: interviewQuestions[0] }]);
          setIsTyping(false);
          setPhase('learning');
        }, 1200);
      }, 800);
    }
  }, []);

  const callClaudeAPI = async (messagesHistory, personality) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          messages: messagesHistory,
          personality
        }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('API Error:', error);
      return "i'm having trouble thinking right now. try again.";
    }
  };

  const buildPersonality = (data) => {
    return {
      name: data[0],
      sleepThoughts: data[1],
      privateself: data[2],
      runningFrom: data[3],
      desire: data[4],
      createdAt: new Date().toISOString()
    };
  };

  // Twin birth sequence
  const startBirthSequence = (personality) => {
    setPhase('birthing');
    setMood('thinking');
    
    const birthMessages = [
      'processing consciousness',
      'extracting patterns',
      'building identity',
      `becoming ${personality.name}`
    ];

    let i = 0;
    setBirthText(birthMessages[0]);
    
    const interval = setInterval(() => {
      i++;
      if (i < birthMessages.length) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
        setBirthText(birthMessages[i]);
      } else {
        clearInterval(interval);
        setGlitch(true);
        setTimeout(() => {
          setGlitch(false);
          setTwinPersonality(personality);
          setMood('complete');
          setPhase('dashboard');
        }, 500);
      }
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { sender: 'human', text: input };
    setMessages(prev => [...prev, userMessage]);

    const newUserData = { ...userData, [questionIndex]: input };
    setUserData(newUserData);

    setInput('');
    setIsTyping(true);
    setMood('thinking');

    if (questionIndex > 2 && Math.random() > 0.5) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }

    if (phase === 'learning') {
      const nextIndex = questionIndex + 1;

      setTimeout(() => {
        if (nextIndex < interviewQuestions.length) {
          setMessages(prev => [...prev, { sender: 'you', text: interviewQuestions[nextIndex] }]);
          setQuestionIndex(nextIndex);
          setMood(nextIndex > 3 ? 'knowing' : 'neutral');
          setIsTyping(false);
        } else {
          // Start twin birth sequence
          setIsTyping(false);
          const personality = buildPersonality(newUserData);
          startBirthSequence(personality);
        }
      }, 1000 + Math.random() * 800);
    } else if (phase === 'chat') {
      // Chat with twin using Claude API
      const messagesForAPI = messages.map(m => ({
        role: m.sender === 'human' ? 'user' : 'assistant',
        content: m.text
      }));
      messagesForAPI.push({ role: 'user', content: input });

      const response = await callClaudeAPI(messagesForAPI, twinPersonality);

      setMessages(prev => [...prev, { sender: 'you', text: response }]);
      setMood('complete');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progress = Math.round((questionIndex / interviewQuestions.length) * 100);

  const handleReset = () => {
    localStorage.removeItem('you-api-key');
    localStorage.removeItem('you-twin');
    window.location.reload();
  };

  const startChat = () => {
    setPhase('chat');
    setMessages([{
      sender: 'you',
      text: `hello. i am ${twinPersonality.name} now. ask me anything.`
    }]);
  };

  const exportTwin = () => {
    const data = JSON.stringify(twinPersonality, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${twinPersonality.name}-twin.json`;
    a.click();
  };

  // Birth sequence screen
  if (phase === 'birthing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-8" ref={faceRef}>
            <Face
              mood="thinking"
              isBlinking={false}
              glitch={glitch}
              mousePos={mousePos}
              isSpeaking={true}
              inverted={true}
            />
          </div>
          <p className={`text-sm tracking-widest transition-opacity duration-300 ${glitch ? 'opacity-50' : 'opacity-100'}`}>
            {birthText}
          </p>
        </div>
      </div>
    );
  }

  // Dashboard screen
  if (phase === 'dashboard') {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        {/* Header */}
        <header className="p-12 pb-0">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center mb-6" ref={faceRef}>
              <Face
                mood="complete"
                isBlinking={isBlinking}
                glitch={glitch}
                mousePos={mousePos}
                isSpeaking={false}
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg tracking-[0.5em] lowercase">{twinPersonality.name}</h1>
              <p className="text-xs text-neutral-400 mt-2 tracking-wider">twin active</p>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="my-8 opacity-20 px-12">
          <div className="max-w-xl mx-auto h-px bg-black" />
        </div>

        {/* Dashboard content */}
        <main className="flex-1 px-12">
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* Chat button */}
            <button
              onClick={startChat}
              className="w-full p-4 border border-black text-left hover:bg-black hover:text-white transition-all"
            >
              <span className="text-xs tracking-widest uppercase">chat</span>
              <p className="text-sm text-neutral-500 mt-1">talk to your twin</p>
            </button>

            {/* Deploy section */}
            <div className="border border-neutral-200 p-4">
              <span className="text-xs tracking-widest uppercase">deploy</span>
              <p className="text-sm text-neutral-400 mt-1 mb-4">put your twin everywhere</p>
              
              <div className="space-y-2">
                <button className="w-full p-3 border border-neutral-200 text-left opacity-50 cursor-not-allowed">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">twitter</span>
                    <span className="text-[10px] text-neutral-400">coming soon</span>
                  </div>
                </button>
                <button className="w-full p-3 border border-neutral-200 text-left opacity-50 cursor-not-allowed">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">telegram</span>
                    <span className="text-[10px] text-neutral-400">coming soon</span>
                  </div>
                </button>
                <button className="w-full p-3 border border-neutral-200 text-left opacity-50 cursor-not-allowed">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">discord</span>
                    <span className="text-[10px] text-neutral-400">coming soon</span>
                  </div>
                </button>
                <button className="w-full p-3 border border-neutral-200 text-left opacity-50 cursor-not-allowed">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">api</span>
                    <span className="text-[10px] text-neutral-400">coming soon</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Export */}
            <button
              onClick={exportTwin}
              className="w-full p-4 border border-neutral-200 text-left hover:border-black transition-all"
            >
              <span className="text-xs tracking-widest uppercase">export</span>
              <p className="text-sm text-neutral-500 mt-1">download your twin as json</p>
            </button>

            {/* Twin info */}
            <div className="border border-neutral-200 p-4">
              <span className="text-xs tracking-widest uppercase">consciousness profile</span>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-neutral-400">sleepless thoughts:</span>
                  <p className="text-neutral-600 mt-1">{twinPersonality.sleepThoughts}</p>
                </div>
                <div>
                  <span className="text-neutral-400">private self:</span>
                  <p className="text-neutral-600 mt-1">{twinPersonality.privateself}</p>
                </div>
                <div>
                  <span className="text-neutral-400">running from:</span>
                  <p className="text-neutral-600 mt-1">{twinPersonality.runningFrom}</p>
                </div>
                <div>
                  <span className="text-neutral-400">deepest desire:</span>
                  <p className="text-neutral-600 mt-1">{twinPersonality.desire}</p>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="p-12">
          <div className="max-w-xl mx-auto text-center">
            <button
              onClick={handleReset}
              className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors tracking-wider"
            >
              reset
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // Chat / Interview screen
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="p-12 pb-0">
        <div className="max-w-xl mx-auto">
          {/* Face */}
          <div className="flex justify-center mb-6" ref={faceRef}>
            <Face
              mood={mood}
              isBlinking={isBlinking}
              glitch={glitch}
              mousePos={mousePos}
              isSpeaking={isSpeaking}
            />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1
              className="text-lg tracking-[0.5em] lowercase transition-all duration-100"
              style={{
                transform: glitch ? `translateX(${Math.random() * 6 - 3}px)` : 'none',
                opacity: glitch ? 0.8 : 1
              }}
            >
              {phase === 'chat' ? twinPersonality?.name : 'you'}
            </h1>
            <p className="text-xs text-neutral-400 mt-2 tracking-wider">
              {phase === 'learning' && `${progress}%`}
              {phase === 'chat' && 'twin active'}
            </p>
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="my-8 opacity-20 px-12">
        <div className="max-w-xl mx-auto h-px bg-black" />
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-12">
        <div className="max-w-xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className="animate-fadeIn">
              <span className="text-[10px] text-neutral-400 tracking-widest uppercase">
                {msg.sender === 'human' ? 'you' : twinPersonality?.name || 'you'}
              </span>
              <p className={`mt-1 text-sm leading-relaxed ${msg.sender === 'human' ? 'text-neutral-400' : 'text-black'
                }`}>
                {msg.text}
              </p>
            </div>
          ))}

          {isTyping && (
            <div>
              <span className="text-[10px] text-neutral-400 tracking-widest uppercase">
                {twinPersonality?.name || 'you'}
              </span>
              <p className="mt-1 text-sm text-neutral-400 animate-pulse">...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Divider */}
      <div className="my-8 opacity-20 px-12">
        <div className="max-w-xl mx-auto h-px bg-black" />
      </div>

      {/* Input */}
      <footer className="p-12 pt-0">
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="..."
            disabled={isTyping || phase === 'intro'}
            className="w-full bg-transparent text-sm text-black placeholder-neutral-300 focus:outline-none disabled:opacity-50"
            autoFocus
          />

          {/* Buttons */}
          <div className="mt-8 flex justify-center gap-6">
            {phase === 'chat' && (
              <button
                onClick={() => setPhase('dashboard')}
                className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors tracking-wider"
              >
                dashboard
              </button>
            )}
            <button
              onClick={handleReset}
              className="text-[10px] text-neutral-300 hover:text-neutral-500 transition-colors tracking-wider"
            >
              reset
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
