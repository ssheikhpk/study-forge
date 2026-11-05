import React, { useState } from 'react';
import { 
  Sparkles, Flame, Trophy, CheckCircle2, Send, Bot, User, Clock, ArrowRight, HeartHandshake
} from 'lucide-react';
import { UserProfile, Subject } from '../../types';
import { storage } from '../../lib/storage';

interface DashboardProps {
  user: UserProfile;
  subjects: Subject[];
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, subjects, setActiveTab }) => {
  const [paperName, setPaperName] = useState<string>(localStorage.getItem('studyforge_paper_name') || 'Advanced Physics & Quantum Mechanics Board Paper');
  const [examDateStr, setExamDateStr] = useState<string>(localStorage.getItem('studyforge_exam_date') || '2026-12-05');
  const [isEditingPaper, setIsEditingPaper] = useState<boolean>(false);

  const examDate = new Date(examDateStr);
  const today = new Date();
  const diffTime = examDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: `Hello ${user.full_name}! I'm your StudyForge AI Assistant. Ready to ace your "${paperName}" exam? Ask me anything!` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const todaysTasks = [
    { id: '1', title: 'Quantum Mechanics Schrödinger Eq. Review', duration: '45m', type: 'revision', completed: true },
    { id: '2', title: 'Flashcards SM-2 Due Deck (15 cards)', duration: '20m', type: 'flashcards', completed: false },
    { id: '3', title: 'Organic Chem Mechanism Quiz & Weakness Fix', duration: '30m', type: 'mock', completed: false },
    { id: '4', title: 'Python Code & Algorithm Practice', duration: '25m', type: 'coding', completed: false },
  ];

  const handleSavePaper = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('studyforge_paper_name', paperName);
    localStorage.setItem('studyforge_exam_date', examDateStr);
    setIsEditingPaper(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const updated = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(updated);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatInput,
          systemInstruction: `You are StudyForge AI tutor for target paper: "${paperName}". Answer directly, conversationally, and accurately to the student's question.`
        })
      });
      const data = await res.json();
      setChatMessages([...updated, { role: 'assistant', text: data.text }]);
      storage.addXP(10);
    } catch (err) {
      setChatMessages([...updated, { role: 'assistant', text: 'You are doing amazing! Keep pushing forward toward your paper success.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7c4d2e] via-[#8c5d3b] to-[#633b20] border border-[#a87852] p-8 shadow-2xl text-white glow-beige">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#d9a87d]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center space-x-2 bg-black/20 border border-white/20 px-3 py-1 rounded-full text-[#f5ebd9] text-xs font-bold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Target Paper: {paperName}</span>
              <button onClick={() => setIsEditingPaper(!isEditingPaper)} className="ml-2 underline text-amber-200 hover:text-white">
                {isEditingPaper ? 'Close' : 'Edit Paper Details'}
              </button>
            </div>

            {isEditingPaper && (
              <form onSubmit={handleSavePaper} className="bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#f5ebd9] uppercase mb-1">Paper / Exam Name</label>
                  <input 
                    type="text" 
                    value={paperName} 
                    onChange={(e) => setPaperName(e.target.value)}
                    className="w-full bg-black/20 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#e0d3bf] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#f5ebd9] uppercase mb-1">Exam Date</label>
                  <input 
                    type="date" 
                    value={examDateStr} 
                    onChange={(e) => setExamDateStr(e.target.value)}
                    className="w-full bg-black/20 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <button type="submit" className="px-4 py-1.5 bg-[#f6f2eb] text-[#5c3a21] font-bold rounded-xl text-xs shadow hover:bg-[#eae0d2] transition-colors">
                  Save Paper Details
                </button>
              </form>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.full_name}! 🌾
            </h1>
            <p className="text-[#f5ebd9] mt-2 max-w-xl text-sm leading-relaxed">
              Your paper is in <span className="text-amber-300 font-extrabold">{daysRemaining} days</span> ({examDateStr}). Stay consistent and confident.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 bg-black/20 border border-white/20 p-4 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="text-center px-4 border-r border-white/20">
              <span className="block text-2xl font-black text-amber-300">{daysRemaining}</span>
              <span className="text-[10px] text-[#f5ebd9] uppercase font-bold">Days Left</span>
            </div>
            <div className="text-center px-4 border-r border-white/20">
              <span className="block text-2xl font-black text-emerald-300">{user.streak}</span>
              <span className="text-[10px] text-[#f5ebd9] uppercase font-bold">Streak 🔥</span>
            </div>
            <div className="text-center px-4">
              <span className="block text-2xl font-black text-[#f5ebd9]">{user.level}</span>
              <span className="text-[10px] text-[#f5ebd9] uppercase font-bold">{user.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Affirmations & Duas Card */}
      <div className="bg-gradient-to-r from-[#e8decb] via-[#e2d5be] to-[#ebdcc8] border border-[#d2c0a6] rounded-3xl p-6 shadow-md flex items-start space-x-4">
        <div className="p-3 rounded-2xl bg-[#8c5d3b] text-white shadow-md shrink-0">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#3b2a1d] mb-1">Daily Affirmations & Duas for Success 🤲</h3>
          <p className="text-xs text-[#523b28] italic leading-relaxed">
            "Rabbi zidni ilma, warzuqni fahma — O my Lord, increase me in knowledge and bless me with true understanding." <br />
            <span className="font-semibold not-italic text-[#6e4b30] mt-1 block">
              Affirmation: "I am fully prepared, focused, and calm. My hard work for my paper will yield wonderful success."
            </span>
          </p>
        </div>
      </div>

      {/* Two Column Grid: Today's Plan & AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Study Plan */}
        <div className="beige-box rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#3b2a1d] flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#8c5d3b]" />
                <span>Today's Study Plan</span>
              </h2>
              <p className="text-xs text-[#6e5039]">Optimized by your SRS queue</p>
            </div>
            <button 
              onClick={() => setActiveTab('planner')}
              className="text-xs font-semibold text-[#8c5d3b] hover:text-[#633f25] flex items-center space-x-1"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  task.completed 
                    ? 'bg-[#e2d7c5]/50 border-[#d0c2ad] opacity-75' 
                    : 'bg-[#f0e8dc] border-[#d8ccb8] shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.completed ? 'bg-emerald-200 text-emerald-800' : 'bg-[#d8c7b0] text-[#5c3a21]'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-semibold ${task.completed ? 'line-through text-[#7c634e]' : 'text-[#3b2a1d]'}`}>
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-[#8c5d3b] font-bold uppercase">{task.type}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#3b2a1d] bg-[#e2d7c5] px-3 py-1 rounded-xl border border-[#d0c2ad]">
                  {task.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat Widget */}
        <div className="lg:col-span-2 beige-box rounded-3xl p-6 shadow-xl flex flex-col h-[480px]">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#3b2a1d]">StudyForge AI Assistant</h2>
              <p className="text-[10px] text-[#6e5039]">Ask paper strategy or study questions</p>
            </div>
          </div>

          <div className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-3 overflow-y-auto space-y-3 text-xs mb-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex items-start space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-[#8c5d3b] text-white font-bold text-[10px]' : 'bg-[#e2d7c5] text-[#5c3a21] border border-[#d0c2ad]'
                }`}>
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  msg.role === 'user' ? 'bg-[#8c5d3b] text-white font-medium rounded-tr-none' : 'bg-[#ede6da] border border-[#d8ccb8] text-[#3b2a1d] rounded-tl-none shadow-sm'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask AI study question..."
              className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl px-3 py-2 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
            />
            <button 
              onClick={handleSendChat}
              disabled={loading}
              className="p-2 bg-[#8c5d3b] text-white rounded-xl font-bold hover:bg-[#724a2e] transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
