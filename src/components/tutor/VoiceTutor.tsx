import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, BookOpen, Layers, Bot, User } from 'lucide-react';
import { storage } from '../../lib/storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const VoiceTutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your StudyForge AI Voice Tutor. You can speak to me or type your questions. How can I help you master your subjects today?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'explain' | 'quiz' | 'socratic'>('socratic');
  const [loading, setLoading] = useState(false);

  // Web Speech recognition setup if available
  const handleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please type your query.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
      setIsListening(false);
      handleSendMessage(speechText);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `User question in ${mode} mode: "${query}". Provide a helpful, Socratic or direct academic answer based on study notes.` 
        })
      });
      const data = await res.json();
      const reply = data.text;
      
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      speakText(reply);
      storage.addXP(15);
    } catch (err) {
      const errReply = 'I am having trouble connecting to AI services right now. Let me know what you need in your notes!';
      setMessages([...newMessages, { role: 'assistant', content: errReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 h-[calc(100vh-140px)] flex flex-col">
      {/* Header & Modes */}
      <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Voice Tutor (RAG Enabled)</h2>
            <p className="text-xs text-slate-400">Speak or chat with your AI tutor grounded in your study notes</p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button 
            onClick={() => setMode('socratic')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'socratic' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
          >
            Socratic Mode
          </button>
          <button 
            onClick={() => setMode('explain')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'explain' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
          >
            Explain
          </button>
          <button 
            onClick={() => setMode('quiz')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'quiz' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
          >
            Quiz Me
          </button>
        </div>
      </div>

      {/* Chat Transcript Area */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="mt-2 flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                  <button onClick={() => speakText(msg.content)} className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex items-center space-x-3 shrink-0">
        <button 
          onClick={handleListen}
          className={`p-3 rounded-xl border transition-all ${
            isListening ? 'bg-rose-500 text-slate-950 border-rose-400 animate-bounce' : 'bg-slate-950 text-rose-400 border-slate-800 hover:border-rose-500'
          }`}
          title="Click to Speak"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask your tutor anything or click mic to speak..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
        />

        <button 
          onClick={() => handleSendMessage()}
          disabled={loading}
          className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-500/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
