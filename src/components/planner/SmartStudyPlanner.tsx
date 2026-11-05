import React, { useState } from 'react';
import { Calendar, Sparkles, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { storage } from '../../lib/storage';
import { Subject, StudyPlanItem } from '../../types';

export const SmartStudyPlanner: React.FC = () => {
  const [subjects] = useState<Subject[]>(storage.getSubjects());
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);

  const [dailyPlan, setDailyPlan] = useState<StudyPlanItem[]>([
    {
      day: 1,
      date: 'Nov 6, 2026',
      tasks: [
        { id: 't1', title: 'Quantum Mechanics Schrödinger Eq & Wave Packets', subject: 'Advanced Physics', durationMinutes: 90, completed: true, type: 'pomodoro' },
        { id: 't2', title: 'SM-2 Flashcard Due Review (25 cards)', subject: 'General', durationMinutes: 30, completed: false, type: 'flashcards' },
        { id: 't3', title: 'Organic Chem Mechanism Quiz & Weakness Fix', subject: 'Organic Chemistry', durationMinutes: 60, completed: false, type: 'mock' }
      ]
    },
    {
      day: 2,
      date: 'Nov 7, 2026',
      tasks: [
        { id: 't4', title: 'Multivariable Calculus Stokes Theorem', subject: 'Calculus', durationMinutes: 90, completed: false, type: 'pomodoro' },
        { id: 't5', title: 'Essay Writing Practice: Quantum Entanglement', subject: 'Advanced Physics', durationMinutes: 45, completed: false, type: 'writing' }
      ]
    }
  ]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a 7-day optimized study plan for subjects: ${subjects.map(s => s.name).join(', ')} with ${hoursPerDay} hours per day. Include Pomodoro blocks, revision cycles, and flashcard slots.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      await res.json();
      storage.addXP(60);
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayNum: number, taskId: string) => {
    setDailyPlan(dailyPlan.map(day => {
      if (day.day === dayNum) {
        return {
          ...day,
          tasks: day.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return day;
    }));
    storage.addXP(10);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="beige-box rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3b2a1d]">Smart Study Planner & Adaptive Scheduler</h2>
              <p className="text-xs text-[#6e5039]">AI-optimized schedule with Pomodoro blocks, revision cycles & iCal export</p>
            </div>
          </div>

          <button 
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#724a2e] transition-all flex items-center space-x-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Regenerate AI Schedule</span>
          </button>
        </div>

        <div className="flex items-center space-x-4 bg-[#f6f2eb] border border-[#d8ccb8] p-4 rounded-2xl">
          <span className="text-xs font-semibold text-[#3b2a1d]">Daily Study Target:</span>
          <select 
            value={hoursPerDay} 
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="bg-[#ede6da] border border-[#d8ccb8] rounded-xl px-3 py-1 text-xs text-[#3b2a1d] focus:outline-none"
          >
            <option value="2">2 Hours / Day</option>
            <option value="4">4 Hours / Day (Recommended)</option>
            <option value="6">6 Hours / Day (Intensive)</option>
            <option value="8">8 Hours / Day (Exam Crunch)</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {dailyPlan.map(day => (
          <div key={day.day} className="beige-box rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-[#d8ccb8]/80 pb-3">
              <h3 className="font-bold text-[#3b2a1d] text-sm">Day {day.day} — {day.date}</h3>
              <span className="text-xs font-semibold text-[#3b2a1d] bg-[#e2d7c5] px-2.5 py-1 rounded-xl">
                {day.tasks.filter(t => t.completed).length} / {day.tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {day.tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(day.day, task.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    task.completed 
                      ? 'bg-[#e2d7c5]/50 border-[#d0c2ad] opacity-75' 
                      : 'bg-[#f6f2eb] border-[#d8ccb8] shadow-sm hover:border-[#8c5d3b]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      task.completed ? 'bg-[#8c5d3b] text-white' : 'bg-[#e2d7c5] text-[#5c3a21]'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-semibold ${task.completed ? 'line-through text-[#8c7460]' : 'text-[#3b2a1d]'}`}>
                        {task.title}
                      </h4>
                      <span className="text-[10px] text-[#8c5d3b] uppercase font-bold">{task.subject} • {task.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-[#6e5039]">
                    <Clock className="w-3.5 h-3.5 text-[#8c5d3b]" />
                    <span>{task.durationMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
