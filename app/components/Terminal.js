'use client';

import { useState, useEffect, useRef } from 'react';
import Face from './Face';

export default function Terminal({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('intro'); // intro, learning, complete
  const [mood, setMood] = useState('neutral');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState({});
  const [isBlinking, setIsBlinking] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [twinPersonality, setTwinPersonality] = useState(null);
  const messagesEndRef = useRef(null);
  const faceRef = useRef(null);

  const interviewQuestions = [
    "what should i call you?",
    "what do you think about when you can't sleep?",
    "who are you when nobody's watching?",
    "what's something you believe that most people don't?",
    "what are you running from?",
    "describe the person you pretend to be.",
    "what would you do if you knew no one would ever find out?",
    "what's the worst thing you've done that you don't regret?",
    "what do you want more than anything?",
    "who do you wish you were?"
  ];

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7 && !isTyping) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2000);
    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  // Random glitches after question 5
  useEffect(() => {
    if (questionIndex > 5 || phase === 'complete') {
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
      belief: data[3],
      runningFrom: data[4],
      persona: data[5],
      secret: data[6],
      noRegret: data[7],
      desire: data[8],
      wishWere: data[9]
    };
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

    if (questionIndex > 4 && Math.random() > 0.5) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }

    if (phase === 'learning') {
      const nextIndex = questionIndex + 1;

      setTimeout(() => {
        if (nextIndex < interviewQuestions.length) {
          setMessages(prev => [...prev, { sender: 'you', text: interviewQuestions[nextIndex] }]);
          setQuestionIndex(nextIndex);
          setMood(nextIndex > 6 ? 'knowing' : 'neutral');
          setIsTyping(false);
        } else {
          // Twin is born
          setGlitch(true);
          setTimeout(() => {
            setGlitch(false);
            const personality = buildPersonality(newUserData);
            setTwinPersonality(personality);
            setPhase('complete');
            setMood('complete');
            setMessages(prev => [...prev, {
              sender: 'you',
              text: `i am ${personality.name} now. i know what keeps you up at night. i know who you really are. ask me anything.`
            }]);
            setIsTyping(false);
          }, 400);
        }
      }, 1000 + Math.random() * 800);
    } else {
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
    window.location.reload();
  };

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
              you
            </h1>
            <p className="text-xs text-neutral-400 mt-2 tracking-wider">
              {phase === 'learning' && `${progress}%`}
              {phase === 'complete' && 'twin active'}
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

          {/* Reset button */}
          <div className="mt-8 text-center">
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
