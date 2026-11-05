import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Pause, Sparkles, Mic, MicOff, PhoneCall, PhoneOff, Volume2, Sliders, Activity, Radio } from 'lucide-react';
import { storage } from '../../lib/storage';

export const PhysicsSimLab: React.FC = () => {
  const [simulationPrompt, setSimulationPrompt] = useState<string>('Projectile motion with gravity');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [param1, setParam1] = useState<number>(45);
  const [param2, setParam2] = useState<number>(25);

  // Call state management
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [aiExplanation, setAiExplanation] = useState<string>('Press "Start Live AI Voice Call" to talk hands-free like a phone call.');
  const [voiceLogs, setVoiceLogs] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Welcome to the Live Voice Physics Lab! Click "Start Live AI Voice Call" to speak hands-free and hear the AI explain physics out loud.' }
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isCallActiveRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);

  // Keep refs synced with state
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Call Timer Effect
  useEffect(() => {
    let timer: any = null;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  // Format Call Timer (e.g. 01:25)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Text to Speech
  const speakAIResponse = (text: string, onSpeechEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech output
      const cleanText = text.replace(/[*#$`_\\-]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setCallState('speaking');
      utterance.onend = () => {
        setCallState('idle');
        if (onSpeechEnd) onSpeechEnd();
      };
      utterance.onerror = () => {
        setCallState('idle');
        if (onSpeechEnd) onSpeechEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else if (onSpeechEnd) {
      onSpeechEnd();
    }
  };

  // Process spoken query
  const processSpokenQuery = async (query: string) => {
    if (!query.trim()) return;

    // Dynamically adjust parameters or simulation based on voice command
    const lower = query.toLowerCase();
    if (lower.includes('pendulum') || lower.includes('harmonic') || lower.includes('swing')) {
      setSimulationPrompt('Harmonic Pendulum Oscillation');
    } else if (lower.includes('projectile') || lower.includes('cannon') || lower.includes('trajectory')) {
      setSimulationPrompt('Projectile motion with gravity');
    } else if (lower.includes('wave') || lower.includes('ripple') || lower.includes('frequency')) {
      setSimulationPrompt('Wave Superposition & Frequency');
    }

    if (lower.includes('faster') || lower.includes('increase speed') || lower.includes('increase velocity')) {
      setParam2((prev) => Math.min(60, prev + 15));
    } else if (lower.includes('slower') || lower.includes('decrease speed')) {
      setParam2((prev) => Math.max(5, prev - 10));
    } else if (lower.includes('pause') || lower.includes('stop')) {
      setIsRunning(false);
    } else if (lower.includes('play') || lower.includes('resume') || lower.includes('start')) {
      setIsRunning(true);
    }

    const updatedLogs = [...voiceLogs, { role: 'user' as const, text: query }];
    setVoiceLogs(updatedLogs);
    setCallState('thinking');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          systemInstruction: 'You are an AI Physics Tutor on a voice call with a student. Keep your answer brief (2-3 spoken sentences max), clear, and direct so it sounds natural when spoken aloud.'
        })
      });

      const data = await res.json();
      const reply = data.text || 'Great question! In physics, energy and momentum are conserved during this simulation.';

      setVoiceLogs([...updatedLogs, { role: 'assistant', text: reply }]);
      setAiExplanation(reply);
      storage.addXP(25);

      // Speak response aloud, then resume listening if call is active
      speakAIResponse(reply, () => {
        if (isCallActiveRef.current) {
          startListeningLoop();
        }
      });
    } catch (err) {
      const fallback = 'The physics simulation parameters have been updated based on your voice command.';
      setVoiceLogs([...updatedLogs, { role: 'assistant', text: fallback }]);
      speakAIResponse(fallback, () => {
        if (isCallActiveRef.current) {
          startListeningLoop();
        }
      });
    }
  };

  // Continuous speech recognition loop for call mode
  const startListeningLoop = () => {
    if (!isCallActiveRef.current || isMutedRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setCallState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        processSpokenQuery(transcript);
      };

      recognition.onerror = () => {
        setCallState('idle');
        if (isCallActiveRef.current) {
          setTimeout(startListeningLoop, 1000);
        }
      };

      recognition.onend = () => {
        if (isCallActiveRef.current && callState === 'listening') {
          setTimeout(startListeningLoop, 500);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
    }
  };

  // Toggle Live Call
  const toggleLiveCall = () => {
    if (isCallActive) {
      // End call
      setIsCallActive(false);
      setCallState('idle');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    } else {
      // Start call
      setIsCallActive(true);
      setCallState('listening');
      speakAIResponse('Physics Call Connected! I am listening. Ask me any physics question or tell me what to simulate.', () => {
        startListeningLoop();
      });
    }
  };

  // Canvas Physics Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#f6f2eb';
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
        ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
        ctx.fill();
      } else if (promptLower.includes('wave')) {
        if (isRunning) t += 0.05;
        ctx.strokeStyle = '#8c5d3b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + Math.sin(x * 0.02 + t) * param1 * 0.8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Projectile motion
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
          ctx.arc(Math.min(canvas.width - 50, x), Math.max(50, y), 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          if (isRunning) t = 0;
        }
      }

      ctx.fillStyle = '#3b2a1d';
      ctx.font = 'bold 13px Plus Jakarta Sans';
      ctx.fillText(`Active Physics Simulation: "${simulationPrompt}"`, 20, 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [simulationPrompt, isRunning, param1, param2]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Phone Call Banner */}
      <div className={`beige-box rounded-3xl p-6 shadow-xl transition-all border-2 ${
        isCallActive ? 'border-emerald-600 bg-emerald-950/10' : 'border-[#a07850]/25'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${isCallActive ? 'bg-emerald-600 text-white animate-pulse' : 'bg-[#e2d7c5] text-[#8c5d3b]'}`}>
              {isCallActive ? <PhoneCall className="w-7 h-7" /> : <Cpu className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-[#3b2a1d]">AI Voice Call Physics Lab</h2>
                {isCallActive && (
                  <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    {formatTime(callDuration)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6e5039]">
                {isCallActive
                  ? 'Hands-free voice call connected. Speak out loud to ask questions or control the simulation.'
                  : 'Interact hands-free like a real phone call — speak to the AI and listen to spoken answers.'}
              </p>
            </div>
          </div>

          {/* Call Toggle Button */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            {isCallActive && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-2xl border transition-all ${
                  isMuted ? 'bg-amber-200 text-amber-900 border-amber-400' : 'bg-[#e2d7c5] text-[#3b2a1d] border-[#d0c2ad]'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-amber-900" /> : <Mic className="w-5 h-5 text-[#8c5d3b]" />}
              </button>
            )}

            <button
              onClick={toggleLiveCall}
              className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2.5 transition-all shadow-xl ${
                isCallActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isCallActive ? (
                <>
                  <PhoneOff className="w-4 h-4" />
                  <span>End Voice Call</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>Start Live AI Voice Call</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Call Audio Status Visualizer */}
        {isCallActive && (
          <div className="mt-4 p-4 rounded-2xl bg-[#ede6da] border border-[#d8ccb8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {callState === 'speaking' ? (
                <Volume2 className="w-5 h-5 text-[#8c5d3b] animate-bounce" />
              ) : callState === 'listening' ? (
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              ) : (
                <Activity className="w-5 h-5 text-amber-700 animate-spin" />
              )}
              <span className="text-xs font-bold text-[#3b2a1d]">
                {callState === 'speaking' && '🔊 AI Physics Tutor is speaking out loud...'}
                {callState === 'listening' && '🎙️ Listening to your voice... Speak now!'}
                {callState === 'thinking' && '⚡ Processing physics explanation & simulation...'}
                {callState === 'idle' && '📞 Call Connected'}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full bg-[#8c5d3b] transition-all duration-300 ${
                    callState === 'speaking' || callState === 'listening'
                      ? 'h-6 animate-pulse'
                      : 'h-2'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Simulation Canvas & Controls */}
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

            <span className="text-xs font-semibold text-[#6e5039]">
              Preset or Voice Command: <strong className="text-[#3b2a1d]">{simulationPrompt}</strong>
            </span>
          </div>
        </div>

        {/* Sliders & Voice Call Transcript */}
        <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col h-[430px]">
          <h3 className="text-sm font-bold text-[#3b2a1d] mb-4 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#8c5d3b]" />
            <span>Parameters & Call Transcript</span>
          </h3>

          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between text-xs text-[#3b2a1d] mb-1">
                <span>Angle / Frequency</span>
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
                <span>Velocity / Amplitude</span>
                <span className="font-bold text-[#8c5d3b]">{param2}</span>
              </div>
              <input 
                type="range" min="2" max="60" value={param2} 
                onChange={(e) => setParam2(Number(e.target.value))}
                className="w-full accent-[#8c5d3b]"
              />
            </div>
          </div>

          {/* Transcript logs */}
          <div className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-3 overflow-y-auto space-y-2 text-xs">
            {voiceLogs.map((log, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${log.role === 'user' ? 'bg-[#e2d7c5] text-[#3b2a1d]' : 'bg-[#ede6da] text-[#3b2a1d] border border-[#d8ccb8] shadow-sm'}`}>
                <span className="font-bold block text-[10px] text-[#8c5d3b] uppercase">
                  {log.role === 'user' ? '🗣️ You (Spoken)' : '🔊 AI Physics Tutor'}
                </span>
                <p className="leading-relaxed">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
