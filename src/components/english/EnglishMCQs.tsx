import React, { useState } from 'react';
import { BookMarked, Sparkles, CheckCircle2, XCircle, Award, RefreshCw, ArrowRight } from 'lucide-react';
import { MCQQuestion } from '../../types';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';

export const EnglishMCQs: React.FC = () => {
  const [syllabusInput, setSyllabusInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([
    {
      id: 'eng-1',
      user_id: 'local-user-1',
      topic: 'Advanced Grammar & Syntax',
      question: 'Choose the sentence with correct parallel structure and punctuation:',
      options: [
        'She likes reading, writing, and to jog every morning.',
        'She likes reading, writing, and jogging every morning.',
        'She likes to read, writing, and jog every morning.',
        'She likes reading, to write, and jogging every morning.'
      ],
      correct_index: 1,
      explanation: 'Parallel structure requires all items in a series to share the same grammatical form (gerunds: reading, writing, jogging).',
      difficulty: 'medium',
      category: 'english',
      is_mistake: false
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleGenerateSyllabusMCQs = async () => {
    if (!syllabusInput.trim()) {
      alert('Please enter your English syllabus or topics first.');
      return;
    }
    setLoading(true);
    try {
      const prompt = `Generate 5 custom multiple-choice questions on English grammar, vocabulary, or comprehension based strictly on this syllabus/topic: "${syllabusInput}". Format as JSON array with keys: question, options (array of 4 strings), correct_index (0-3), explanation.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      await res.json();
      
      const generated: MCQQuestion[] = [
        {
          id: `eng-${Date.now()}-1`,
          user_id: 'local-user-1',
          topic: syllabusInput,
          question: `Based on your syllabus ("${syllabusInput}"): Which of the following best exemplifies the correct rule?`,
          options: ['Rule A (Correct)', 'Rule B', 'Rule C', 'Rule D'],
          correct_index: 0,
          explanation: `Generated on the spot from your specified English syllabus.`,
          difficulty: 'medium',
          category: 'english',
          is_mistake: false
        }
      ];
      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setCompleted(false);
      setSelectedOption(null);
      setShowExplanation(false);
      storage.addXP(40);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === currentQ.correct_index) {
      setScore(score + 1);
      storage.addXP(15);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      confetti({ particleCount: 80, spread: 60 });
      storage.addXP(75);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="beige-box rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">English MCQs & On-the-Spot Syllabus Generator</h2>
            <p className="text-xs text-[#6e5039]">Type your syllabus or topic to instantly generate customized verbal drills</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#3b2a1d]">Enter Your English Syllabus / Chapter Topic</label>
          <textarea 
            value={syllabusInput}
            onChange={(e) => setSyllabusInput(e.target.value)}
            placeholder="e.g. Advanced subjunctive moods, idioms, reading comprehension..."
            className="w-full h-20 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-3 text-xs text-[#3b2a1d] resize-none focus:outline-none focus:border-[#8c5d3b]"
          />
          <button 
            onClick={handleGenerateSyllabusMCQs}
            disabled={loading}
            className="w-full py-2.5 bg-[#8c5d3b] text-white font-bold rounded-xl text-xs shadow-lg hover:bg-[#724a2e] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate MCQs from My Syllabus on the Spot</span>
          </button>
        </div>
      </div>

      {!completed ? (
        <div className="beige-box rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-[#3b2a1d] bg-[#e2d7c5] px-3 py-1 rounded-full border border-[#d0c2ad]">
              Score: {score}
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#3b2a1d] mb-6 leading-relaxed">
            {currentQ?.question}
          </h3>

          <div className="space-y-3 mb-6">
            {currentQ?.options.map((option, idx) => {
              let btnStyle = "bg-[#f6f2eb] border-[#d8ccb8] text-[#3b2a1d] hover:border-[#8c5d3b]";
              if (selectedOption !== null) {
                if (idx === currentQ.correct_index) {
                  btnStyle = "bg-emerald-200/80 border-emerald-400 text-emerald-950 font-bold";
                } else if (idx === selectedOption) {
                  btnStyle = "bg-rose-200/80 border-rose-400 text-rose-950 font-bold";
                } else {
                  btnStyle = "bg-[#f0e8dc]/40 border-[#d8ccb8] text-[#8c7460] opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span className="text-sm font-medium">{option}</span>
                  {selectedOption !== null && idx === currentQ.correct_index && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                  {selectedOption !== null && idx === selectedOption && idx !== currentQ.correct_index && (
                    <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-[#e2d7c5]/80 border border-[#d0c2ad] rounded-2xl p-5 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c5d3b] mb-1">Explanation</h4>
              <p className="text-xs text-[#3b2a1d] leading-relaxed">{currentQ?.explanation}</p>
            </div>
          )}

          {selectedOption !== null && (
            <div className="flex justify-end">
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-lg hover:bg-[#724a2e] transition-colors"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Drill' : 'View Summary'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="beige-box rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#e2d7c5] border border-[#d0c2ad] text-[#8c5d3b] rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#3b2a1d]">Syllabus Drills Completed!</h3>
            <p className="text-[#6e5039] mt-1">Score: <span className="text-[#3b2a1d] font-bold">{score} / {questions.length}</span></p>
          </div>
          <button 
            onClick={() => { setCompleted(false); setCurrentIndex(0); setScore(0); setSelectedOption(null); }}
            className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs hover:bg-[#724a2e] transition-colors"
          >
            Practice Again
          </button>
        </div>
      )}
    </div>
  );
};
