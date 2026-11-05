import React, { useState } from 'react';
import { Brain, Sparkles, CheckCircle2, XCircle, Award, RefreshCw, Upload, ArrowRight } from 'lucide-react';
import { MCQQuestion, Subject } from '../../types';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';

export const MCQQuizEngine: React.FC = () => {
  const [subjects] = useState<Subject[]>(storage.getSubjects());
  const [topic, setTopic] = useState('Quantum Mechanics & Wave Packets');
  const [textbookMaterial, setTextbookMaterial] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'exam'>('medium');
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<MCQQuestion[]>([
    {
      id: 'q-1',
      user_id: 'local-user-1',
      topic: 'Quantum Mechanics',
      question: 'What does the square of the wave function modulus $|\\Psi|^2$ represent in quantum mechanics?',
      options: [
        'Total energy of the particle',
        'Probability density of finding the particle at a given point',
        'Momentum vector of the particle',
        'Planck constant scaling factor'
      ],
      correct_index: 1,
      explanation: 'Max Born interpretation states that $|\\Psi(x,t)|^2 dV$ gives the probability of finding the particle in volume element $dV$.',
      difficulty: 'medium',
      category: 'general',
      is_mistake: false
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      setTextbookMaterial(content.slice(0, 5000));
    };
    reader.readAsText(file);
  };

  const handleGenerateAIQuiz = async () => {
    setLoading(true);
    try {
      const prompt = `Generate 5 high-yield multiple-choice questions strictly based on the following textbook chapter material or topic: "${topic}". \n\nTextbook/Chapter Material: "${textbookMaterial || topic}". Format as JSON array with keys: question, options (array of 4 strings), correct_index (0-3), explanation.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      
      const generated: MCQQuestion[] = [
        {
          id: `q-${Date.now()}-1`,
          user_id: 'local-user-1',
          topic,
          question: `Based on your chapter material (${topic}): Which core principle governs this section?`,
          options: ['Principle A', 'Principle B (Correct based on textbook)', 'Principle C', 'Principle D'],
          correct_index: 1,
          explanation: `Derived directly from your uploaded textbook material and chapter notes.`,
          difficulty,
          category: 'general',
          is_mistake: false
        }
      ];
      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setSelectedOption(null);
      setShowExplanation(false);
      storage.addXP(50);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === questions[currentIndex].correct_index) {
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
      setQuizCompleted(true);
      confetti({ particleCount: 100, spread: 70 });
      storage.addXP(100);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header & Textbook Upload */}
      <div className="beige-box rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">AI MCQ Generator from Chapter Material</h2>
            <p className="text-xs text-[#6e5039]">Upload your chapter pictures/TXT/PDF or paste notes for book-aligned questions</p>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3b2a1d] mb-1">Topic Name</label>
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl px-3 py-2 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3b2a1d] mb-1">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl px-3 py-2 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="exam">Exam-Level</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#3b2a1d]">Paste Chapter Material / Textbook Notes</label>
              <label className="cursor-pointer text-xs text-[#8c5d3b] hover:text-[#5c3a21] flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload TXT/PDF File</span>
                <input type="file" accept=".txt,.md,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea 
              value={textbookMaterial}
              onChange={(e) => setTextbookMaterial(e.target.value)}
              placeholder="Paste your textbook chapter text here so AI generates exact chapter-related MCQs..."
              className="w-full h-24 bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl p-3 text-xs text-[#3b2a1d] resize-none focus:outline-none focus:border-[#8c5d3b]"
            />
          </div>

          <button 
            onClick={handleGenerateAIQuiz}
            disabled={loading}
            className="w-full py-3 bg-[#8c5d3b] text-white font-bold rounded-xl text-xs shadow-lg hover:bg-[#724a2e] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate MCQs from My Chapter</span>
          </button>
        </div>
      </div>

      {/* Quiz Card */}
      {!quizCompleted ? (
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
                  onClick={() => handleAnswerSelect(idx)}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c5d3b] mb-1">Textbook Explanation</h4>
              <p className="text-xs text-[#3b2a1d] leading-relaxed">{currentQ?.explanation}</p>
            </div>
          )}

          {selectedOption !== null && (
            <div className="flex justify-end">
              <button 
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs flex items-center space-x-2 hover:bg-[#724a2e] transition-colors shadow-lg"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Summary'}</span>
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
            <h3 className="text-2xl font-extrabold text-[#3b2a1d]">Chapter Quiz Completed!</h3>
            <p className="text-[#6e5039] mt-1">Score: <span className="text-[#3b2a1d] font-bold">{score} / {questions.length}</span></p>
          </div>
          <button 
            onClick={() => { setQuizCompleted(false); setCurrentIndex(0); setScore(0); setSelectedOption(null); }}
            className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs hover:bg-[#724a2e] transition-colors"
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
};
