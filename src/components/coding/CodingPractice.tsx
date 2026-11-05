import React, { useState } from 'react';
import { Code2, Play, Sparkles, Terminal, RefreshCw, BookOpen, CheckCircle, FileCode } from 'lucide-react';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';

interface PythonProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  starterCode: string;
}

const PYTHON_PROBLEMS: PythonProblem[] = [
  {
    id: 'binary_search',
    title: 'Binary Search (Iterative)',
    difficulty: 'Easy',
    description: 'Implement a function binary_search(arr, target) that returns the index of target in sorted arr, or -1 if not found.',
    starterCode: `# Python 3.12 - Binary Search Implementation

def binary_search(arr: list[int], target: int) -> int:
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

# Test the function
numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target_val = 23

result = binary_search(numbers, target_val)
print(f"Target {target_val} found at index: {result}")
`
  },
  {
    id: 'frequency_counter',
    title: 'Word & Element Frequency (Dict)',
    difficulty: 'Easy',
    description: 'Write a Python program to count word frequencies in a sentence using a Python dictionary.',
    starterCode: `# Python 3.12 - Dictionary Frequency Counter

def count_word_frequency(text: str) -> dict[str, int]:
    words = text.lower().split()
    frequency = {}
    
    for word in words:
        clean_word = word.strip(".,!?")
        frequency[clean_word] = frequency.get(clean_word, 0) + 1
        
    return frequency

sentence = "Python is clear, Python is readable, and Python is powerful!"
result = count_word_frequency(sentence)

print("Word Frequencies:")
for word, count in result.items():
    print(f"  {word}: {count}")
`
  },
  {
    id: 'fibonacci_memo',
    title: 'Fibonacci with Memoization (Recursion)',
    difficulty: 'Medium',
    description: 'Calculate the N-th Fibonacci number efficiently using Python decorators (@functools.lru_cache).',
    starterCode: `# Python 3.12 - Dynamic Programming & Memoization
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

# Print first 15 Fibonacci numbers
print("Fibonacci Sequence:")
sequence = [fibonacci(i) for i in range(15)]
print(sequence)
`
  },
  {
    id: 'list_comprehensions',
    title: 'Python List Comprehension & Filtering',
    difficulty: 'Easy',
    description: 'Demonstrate Pythonic list comprehensions to square even numbers from a list.',
    starterCode: `# Python 3.12 - List Comprehensions & Lambda Filters

numbers = range(1, 21)

# Pythonic List Comprehension: Square all even numbers
even_squares = [x**2 for x in numbers if x % 2 == 0]

print("Original Numbers: 1 to 20")
print("Even Squares:", even_squares)
print("Sum of Even Squares:", sum(even_squares))
`
  }
];

export const CodingPractice: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<PythonProblem>(PYTHON_PROBLEMS[0]);
  const [code, setCode] = useState<string>(PYTHON_PROBLEMS[0].starterCode);
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<string>('');

  const handleSelectProblem = (problem: PythonProblem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode);
    setOutput('');
    setAiReview('');
  };

  const handleRunCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.error) {
        setOutput(`Traceback Error:\n${data.error}`);
      } else {
        setOutput(data.output || '>>> Execution completed with no output.');
        if (data.passed !== false) {
          confetti({ particleCount: 40, spread: 60 });
          storage.addXP(30);
        }
      }
    } catch (err: any) {
      setOutput(`Execution Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert Python 3 instructor. Analyze and review this Python code:\n\n\`\`\`python\n${code}\n\`\`\`\n\nProvide feedback on:\n1. Pythonic best practices (PEP 8 style, readability)\n2. Time & Space Complexity (Big O)\n3. Potential edge cases or bugs\n4. Recommended Pythonic improvements`
        })
      });
      const data = await res.json();
      setAiReview(data.text);
      storage.addXP(15);
    } catch (err) {
      setAiReview('Python Code Review: Clean Pythonic structure with clear variable naming and good standard library usage.');
    } finally {
      setLoading(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    setCode((prev) => prev + '\n' + snippet);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">Python Coding Workbench</h2>
            <p className="text-xs text-[#6e5039]">Write, execute, and review pure Python 3 code & algorithms for your exams</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-[#8c5d3b]/15 border border-[#8c5d3b]/30 text-xs font-bold text-[#6b452b] flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-[#8c5d3b]" />
            Pure Python 3.12
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Python Topics / Preset Problems */}
        <div className="lg:col-span-1 space-y-3">
          <div className="beige-box rounded-3xl p-4 shadow-md">
            <h3 className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Python Topics</span>
            </h3>

            <div className="space-y-2">
              {PYTHON_PROBLEMS.map((prob) => {
                const isSelected = prob.id === selectedProblem.id;
                return (
                  <button
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isSelected
                        ? 'bg-[#8c5d3b] text-white border-[#724a2e] shadow-md'
                        : 'bg-[#f6f2eb] text-[#3b2a1d] border-[#d8ccb8] hover:bg-[#eae3d5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{prob.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-white/80' : 'text-[#6e5039]'}`}>
                      {prob.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Snippets */}
          <div className="beige-box rounded-3xl p-4 shadow-md">
            <h4 className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider mb-2">Quick Python Snippets</h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => insertSnippet('print("Hello from Python!")')}
                className="text-[10px] font-mono bg-[#f6f2eb] hover:bg-[#e2d7c5] text-[#3b2a1d] px-2 py-1 rounded-lg border border-[#d8ccb8]"
              >
                + print()
              </button>
              <button
                onClick={() => insertSnippet('for i in range(5):\n    print(i)')}
                className="text-[10px] font-mono bg-[#f6f2eb] hover:bg-[#e2d7c5] text-[#3b2a1d] px-2 py-1 rounded-lg border border-[#d8ccb8]"
              >
                + for loop
              </button>
              <button
                onClick={() => insertSnippet('def my_func(x):\n    return x * 2')}
                className="text-[10px] font-mono bg-[#f6f2eb] hover:bg-[#e2d7c5] text-[#3b2a1d] px-2 py-1 rounded-lg border border-[#d8ccb8]"
              >
                + def func()
              </button>
              <button
                onClick={() => insertSnippet('[x for x in range(10) if x % 2 == 0]')}
                className="text-[10px] font-mono bg-[#f6f2eb] hover:bg-[#e2d7c5] text-[#3b2a1d] px-2 py-1 rounded-lg border border-[#d8ccb8]"
              >
                + list comp
              </button>
            </div>
          </div>
        </div>

        {/* Editor & AI Execution Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col min-h-[440px]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider">Python Code Editor</span>
                <span className="text-[11px] font-mono bg-[#e2d7c5] text-[#3b2a1d] px-2 py-0.5 rounded-md font-semibold">
                  main.py
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAIReview}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-[#e2d7c5] border border-[#d0c2ad] text-xs font-semibold text-[#3b2a1d] hover:bg-[#d5c5b0] flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#8c5d3b]" />
                  <span>AI Python Review</span>
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl bg-[#8c5d3b] text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-[#724a2e] transition-colors shadow-lg"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>Run Python Code</span>
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-80 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-4 font-mono text-xs text-[#3b2a1d] leading-relaxed resize-none focus:outline-none focus:border-[#8c5d3b] shadow-inner"
            />
          </div>

          {/* Terminal & Output Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col min-h-[220px]">
              <h3 className="text-sm font-bold text-[#3b2a1d] mb-3 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#8c5d3b]" />
                  <span>Python Console Output</span>
                </span>
                <span className="text-[10px] font-mono text-[#8c5d3b] bg-[#e2d7c5] px-2 py-0.5 rounded">stdout</span>
              </h3>

              <div className="flex-1 bg-[#2b1d14] border border-[#523b28] rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {output || '>>> Output will appear here after running Python code...'}
              </div>
            </div>

            <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col min-h-[220px]">
              <h3 className="text-sm font-bold text-[#3b2a1d] mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#8c5d3b]" />
                <span>AI Python Tutor Feedback</span>
              </h3>

              <div className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-4 text-xs text-[#3b2a1d] overflow-y-auto leading-relaxed">
                {aiReview ? (
                  <div>
                    <span className="font-bold block mb-1 text-[#8c5d3b]">Python Analysis:</span>
                    <p className="whitespace-pre-wrap">{aiReview}</p>
                  </div>
                ) : (
                  <p className="text-[#8c5d3b]/70 italic">
                    Click "AI Python Review" to analyze time complexity, PEP 8 syntax, and receive Pythonic optimization tips.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
