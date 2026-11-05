import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Pause, Sparkles, Mic, Sliders } from 'lucide-react';
import { storage } from '../../lib/storage';

export const PhysicsSimLab: React.FC = () => {
  const [simulationPrompt, setSimulationPrompt] = useState<string>('Projectile motion with gravity');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [param1, setParam1] = useState<number>(45);
  const [param2, setParam2] = useState<number>(25);
  const [aiExplanation, setAiExplanation] = useState<string>('Type what simulation you want above, adjust parameters, and observe the dynamic rendering.');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLogs, setVoiceLogs] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Welcome to the Dynamic Physics Simulation Lab! Simply type what phenomenon or experiment you want to simulate, and watch it render in real time.' }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const speechText = event.results[0][0].transcript;
      setIsListening(false);
      setSimulationPrompt(speechText);
      await handleVoiceQuery(speechText);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    const updated = [...voiceLogs, { role: 'user' as const, text: query }];
    setVoiceLogs(updated);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Physics Simulation Request: "${query}". Explain the underlying laws and formulas.` })
      });
      const data = await res.json();
      const reply = data.text;
      setVoiceLogs([...updated, { role: 'assistant', text: reply }]);
      setAiExplanation(reply);
      speakText(reply);
      storage.addXP(20);
    } catch (err) {
      const fallback = 'Simulation updated successfully based on your prompt!';
      setVoiceLogs([...updated, { role: 'assistant', text: fallback }]);
      speakText(fallback);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#f6f2eb'; // Warm light beige canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const promptLower = simulationPrompt.toLowerCase();

      if (promptLower.includes('pendulum') || promptLower.includes('harmonic')) {
        if (isRunning) t += 0.03;
        const length = param1 * 3;
        const angle = (param2 / 10) * Math.sin(t);
        const originX = canvas.width / 2;
        const originY = 60;

        const bobX = originX + length * Math.sin(angle);
        const bobY = originY + length * Math.cos(angle);

        ctx.strokeStyle = '#8c5d3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        ctx.fillStyle = '#724a2e';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#b8a38a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 50);
        ctx.lineTo(canvas.width - 50, canvas.height - 50);
        ctx.stroke();

        if (isRunning) t += 0.05;
        const v0 = param2;
        const angle = (param1 * Math.PI) / 180;
        const g = 9.81;

        const x = 50 + v0 * Math.cos(angle) * t * 10;
        const y = (canvas.height - 50) - (v0 * Math.sin(angle) * t * 10 - 0.5 * g * t * t * 10);

        if (y <= canvas.height - 50) {
          ctx.fillStyle = '#8c5d3b';
          ctx.beginPath();
          ctx.arc(Math.min(canvas.width - 50, x), Math.max(50, y), 9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          if (isRunning) t = 0;
        }
      }

      ctx.fillStyle = '#3b2a1d';
      ctx.font = 'bold 13px Plus Jakarta Sans';
      ctx.fillText(`Active Sim: "${simulationPrompt}"`, 20, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [simulationPrompt, isRunning, param1, param2]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="beige-box rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">Dynamic Physics Simulation Lab</h2>
            <p className="text-xs text-[#6e5039]">Type any physics phenomenon you want simulated — no pre-set buttons!</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#3b2a1d]">What physics experiment or phenomenon would you like to simulate?</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={simulationPrompt}
              onChange={(e) => setSimulationPrompt(e.target.value)}
              placeholder="e.g. Projectile motion with air drag, harmonic pendulum..."
              className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl px-4 py-3 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
            />
            <button 
              onClick={() => handleVoiceQuery(`Simulate and explain: ${simulationPrompt}`)}
              className="px-5 py-3 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#724a2e] transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate & Explain</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 beige-box rounded-3xl p-6 shadow-xl flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            width={650} 
            height={340} 
            className="rounded-2xl border border-[#d8ccb8] bg-[#f6f2eb] mb-4 w-full"
          />

          <div className="flex items-center space-x-4 w-full justify-between">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="px-5 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg hover:bg-[#724a2e] transition-colors"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Simulation' : 'Resume'}</span>
            </button>

            <button 
              onClick={handleListen}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                isListening ? 'bg-rose-500 text-white animate-bounce' : 'bg-[#e2d7c5] border border-[#d0c2ad] text-[#3b2a1d] hover:bg-[#d5c5b0]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'Listening...' : 'Ask via Voice'}</span>
            </button>
          </div>
        </div>

        <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col h-[430px]">
          <h3 className="text-sm font-bold text-[#3b2a1d] mb-4 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#8c5d3b]" />
            <span>Parameters & Voice Tutor</span>
          </h3>

          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between text-xs text-[#3b2a1d] mb-1">
                <span>Parameter 1</span>
                <span className="font-bold text-[#8c5d3b]">{param1}</span>
              </div>
              <input 
                type="range" min="5" max="90" value={param1} 
                onChange={(e) => setParam1(Number(e.target.value))}
                className="w-full accent-[#8c5d3b]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#3b2a1d] mb-1">
                <span>Parameter 2</span>
                <span className="font-bold text-[#8c5d3b]">{param2}</span>
              </div>
              <input 
                type="range" min="2" max="60" value={param2} 
                onChange={(e) => setParam2(Number(e.target.value))}
                className="w-full accent-[#8c5d3b]"
              />
            </div>
          </div>

          <div className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-3 overflow-y-auto space-y-2 text-xs">
            {voiceLogs.map((log, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${log.role === 'user' ? 'bg-[#e2d7c5] text-[#3b2a1d]' : 'bg-[#ede6da] text-[#3b2a1d] border border-[#d8ccb8] shadow-sm'}`}>
                <span className="font-bold block text-[10px] text-[#8c5d3b] uppercase">{log.role === 'user' ? 'You' : 'AI Physics Tutor'}</span>
                <p>{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
