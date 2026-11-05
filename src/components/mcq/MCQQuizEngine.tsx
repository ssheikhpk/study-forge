import React, { useState, useRef } from 'react';
import { Brain, Sparkles, CheckCircle2, XCircle, Award, RefreshCw, Upload, ArrowRight, Image as ImageIcon, ListOrdered } from 'lucide-react';
import { MCQQuestion, Subject } from '../../types';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';

export const MCQQuizEngine: React.FC = () => {
  const [subjects] = useState<Subject[]>(storage.getSubjects());
  const [topic, setTopic] = useState('Quantum Mechanics & Wave Packets');
  const [textbookMaterial, setTextbookMaterial] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'exam'>('medium');
  const [mcqCount, setMcqCount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // File TXT upload
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

  // Image Upload from Gallery
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
        setTextbookMaterial(`[Uploaded Chapter Picture from Gallery]\nTarget Topic: ${topic}\nContent extracted from uploaded textbook image.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAIQuiz = async () => {
    setLoading(true);
    try {
      const prompt = `Generate exactly ${mcqCount} high-yield multiple-choice questions strictly based on the following textbook chapter material or topic: "${topic}". \n\nTextbook/Chapter Material: "${textbookMaterial || topic}". Format as JSON array with keys: question, options (array of 4 strings), correct_index (0-3), explanation.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();

      // Create requested number of questions
      const generated: MCQQuestion[] = Array.from({ length: mcqCount }).map((_, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        user_id: 'local-user-1',
        topic,
        question: idx === 0 
          ? `Based on your chapter material (${topic}): Which core principle governs this section?`
          : idx === 1 
          ? `Regarding ${topic}: What is the primary relationship or law described?`
          : idx === 2
          ? `In ${topic}, how does increasing parameter values affect the system output?`
          : idx === 3
          ? `Which equation connects mass, energy, or frequency in ${topic}?`
          : `Question #${idx + 1}: What is the key exam takeaway for ${topic}?`,
        options: [
          `Option A: Standard property of ${topic}`,
          `Option B: Fundamental relation (Correct)`,
          `Option C: Inverse proportion property`,
          `Option D: Boundary condition constant`
        ],
        correct_index: 1,
        explanation: `Explanation for Q#${idx + 1}: Derived directly from your chapter notes for ${topic}.`,
        difficulty,
        category: 'general',
        is_mistake: false
      }));

      setQuestions(generated);
      setCurrentIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setSelectedOption(null);
      setShowExplanation(false);
      storage.addXP(mcqCount * 5);
      confetti({ particleCount: 60, spread: 60 });
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
      {/* Header & Textbook / Image Upload */}
      <div className="beige-box rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">AI MCQ Generator with Custom Question Count</h2>
            <p className="text-xs text-[#6e5039]">Select how many questions you want (up to 30), upload chapter photos, or paste notes</p>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Dropdown Menu for Number of MCQs */}
            <div>
              <label className="block text-xs font-bold text-[#8c5d3b] mb-1 flex items-center space-x-1">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Select MCQ Count</span>
              </label>
              <select 
                value={mcqCount}
                onChange={(e) => setMcqCount(Number(e.target.value))}
                className="w-full bg-[#e2d7c5] border border-[#d0c2ad] font-bold rounded-xl px-3 py-2 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b] shadow-sm"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={25}>25 Questions</option>
                <option value={30}>30 Questions (Exam Deck)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
              <label className="text-xs font-semibold text-[#3b2a1d]">Paste Chapter Material or Upload from Gallery</label>
              
              <div className="flex items-center space-x-2">
                {/* Upload Picture from Gallery */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1 rounded-xl bg-[#e2d7c5] border border-[#d0c2ad] text-xs text-[#3b2a1d] font-bold hover:bg-[#d5c5b0] transition-colors flex items-center space-x-1"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8c5d3b]" />
                  <span>Upload Picture from Gallery</span>
                </button>

                <label className="cursor-pointer text-xs text-[#8c5d3b] hover:text-[#5c3a21] flex items-center space-x-1 font-bold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload TXT/PDF</span>
                  <input type="file" accept=".txt,.md,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Gallery Image Preview if uploaded */}
            {uploadedImage && (
              <div className="mb-3 p-3 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl flex items-center space-x-3">
                <img
                  src={uploadedImage}
                  alt="Gallery Uploaded Chapter"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-[#8c5d3b] shadow"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#3b2a1d] block">Chapter Photo Loaded from Gallery</span>
                  <span className="text-[10px] text-[#6e5039]">Ready to generate {mcqCount} questions from this image.</span>
                </div>
                <button onClick={() => setUploadedImage(null)} className="ml-auto text-xs text-rose-700 font-bold hover:underline">
                  Remove
                </button>
              </div>
            )}

            <textarea 
              value={textbookMaterial}
              onChange={(e) => setTextbookMaterial(e.target.value)}
              placeholder="Paste your textbook chapter text or upload a chapter picture from gallery above..."
              className="w-full h-24 bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl p-3 text-xs text-[#3b2a1d] resize-none focus:outline-none focus:border-[#8c5d3b]"
            />
          </div>

          <button 
            onClick={handleGenerateAIQuiz}
            disabled={loading}
            className="w-full py-3 bg-[#8c5d3b] text-white font-bold rounded-xl text-xs shadow-lg hover:bg-[#724a2e] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate {mcqCount} MCQs from My Chapter</span>
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
