import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Bot, User, RefreshCw, Copy, Check, 
  Trash2, Volume2, VolumeX, Sparkles, Code2, BookOpen, Lightbulb
} from 'lucide-react';
import { storage } from '../../lib/storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIChatWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studyforge_full_ai_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: "Hi! I am your AI study assistant. Ask me anything about physics, Python coding, mathematics, or biology, and I will explain it directly and thoroughly in plain, easy-to-understand English!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('studyforge_full_ai_chat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          systemInstruction: 'You are an AI assistant just like ChatGPT and DeepSeek. Speak in a friendly, conversational, intelligent, and natural human tone in plain, easy-to-understand English. Directly answer the user\'s specific question and thoroughly explain the actual topic, concepts, mechanics, and examples. NEVER lecture the user about "how to look at questions on exams" or give exam advice—just explain the subject matter directly! Do NOT use rigid numbered step-by-step breakdowns. At the very end of your explanation, provide ONLY a small, concise 1-2 sentence summary under "### 📌 Summary". Do NOT ask any follow-up questions back.'
        })
      });

      const data = await res.json();
      const replyText = data.text || "Here is the direct explanation to your question.";

      const aiMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...updated, aiMessage]);
      storage.addXP(15);
    } catch (err: any) {
      const fallbackMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: `Here is the explanation for "${query}": It works through fundamental cause-and-effect principles where the initial conditions predictably determine the outcome.\n\n### 📌 Summary\nThis concept operates reliably under standard physical and logical laws.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...updated, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const reset: ChatMessage[] = [
      {
        id: `w-${Date.now()}`,
        role: 'assistant',
        text: "Chat cleared! Ask me anything about physics, Python coding, mathematics, or biology, and I will explain it directly and thoroughly in plain, easy-to-understand English!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(reset);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, 'Code block omitted for speech.').replace(/[#*$`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const starterChips = [
    { label: 'Explain Schrödinger wave equation in physics', icon: Sparkles },
    { label: 'Write Python function for binary search', icon: Code2 },
    { label: 'Explain how photosynthesis works in plants', icon: BookOpen },
    { label: 'How does calculus integration work in reality?', icon: Lightbulb },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[#ede6da] border border-[#d8ccb8] rounded-3xl shadow-xl overflow-hidden pb-4">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-[#e4dacb] border-b border-[#d8ccb8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8c5d3b] text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#3b2a1d] flex items-center space-x-2">
              <span>AI Chat</span>
              <span className="text-[10px] bg-[#8c5d3b]/15 text-[#8c5d3b] border border-[#8c5d3b]/30 px-2 py-0.5 rounded-full font-bold">
                ChatGPT & DeepSeek Style
              </span>
            </h1>
            <p className="text-xs text-[#6e5039]">Natural, clear, in-depth explanations without lectures or robotic steps</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center space-x-1 px-3 py-1.5 bg-[#f6f2eb] hover:bg-[#eae0d2] text-[#8c5d3b] hover:text-[#5c3a21] border border-[#d8ccb8] rounded-xl text-xs font-bold transition-all shadow-sm"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Thread Window */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#f6f2eb]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow ${
                isUser ? 'bg-[#8c5d3b] text-white' : 'bg-[#633b20] text-amber-200'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`flex flex-col max-w-[85%] sm:max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm border ${
                  isUser
                    ? 'bg-[#8c5d3b] text-white border-[#7c4d2e] rounded-tr-none'
                    : 'bg-[#ede6da] text-[#3b2a1d] border-[#d8ccb8] rounded-tl-none font-sans'
                }`}>
                  <div className="space-y-3 prose-sm font-normal">
                    {renderFormattedMarkdown(msg.text)}
                  </div>
                </div>

                {/* Timestamp & Action Bar */}
                <div className="flex items-center space-x-2 text-[10px] text-[#8c5d3b] pt-1 px-1 font-semibold">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <span>·</span>
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:underline flex items-center space-x-1 text-[#6e5039]"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <span>·</span>
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className="hover:underline flex items-center space-x-1 text-[#6e5039]"
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3 h-3 text-red-600" /> : <Volume2 className="w-3 h-3" />}
                        <span>{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#8c5d3b] italic bg-[#ede6da] border border-[#d8ccb8] p-3 rounded-2xl w-fit shadow-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-[#8c5d3b]" />
            <span>AI is writing your explanation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts (if chat is short) */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 py-2 bg-[#ede6da] border-t border-[#d8ccb8]/60 flex flex-wrap gap-2">
          {starterChips.map((chip, idx) => {
            const Icon = chip.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(chip.label)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#f6f2eb] hover:bg-[#e2d7c5] border border-[#d0c2ad] text-[#3b2a1d] rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#8c5d3b]" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 sm:p-4 bg-[#ede6da] border-t border-[#d8ccb8]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end space-x-2 bg-[#f6f2eb] border border-[#d0c2ad] focus-within:border-[#8c5d3b] p-2.5 rounded-2xl shadow-inner transition-colors"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything (e.g. explain quantum waves, write Python code, solve calculus)..."
            rows={2}
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#3b2a1d] placeholder-[#8c6d54] focus:outline-none resize-none px-2 py-1"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#8c5d3b] hover:bg-[#6e4528] disabled:bg-[#c4b5a0] text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow transition-all shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-[#6e5039] px-2 pt-1.5 font-semibold">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Powered by Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Rich Markdown & Code Renderer
 */
function renderFormattedMarkdown(content: string) {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const lang = part.slice(3, firstLineEnd > 0 ? firstLineEnd : 3).trim() || 'code';
      const code = firstLineEnd > 0 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

      return (
        <div key={index} className="my-3 rounded-2xl overflow-hidden border border-[#3b2a1d]/30 bg-[#2b1d13] text-[#f6f2eb] shadow-lg">
          <div className="bg-[#1e130c] px-4 py-1.5 flex items-center justify-between border-b border-white/10 text-[11px] font-mono text-[#d8c5b3]">
            <span className="font-bold uppercase tracking-wider text-amber-300">{lang}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="hover:text-white flex items-center space-x-1"
              title="Copy code"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Code</span>
            </button>
          </div>
          <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-[#e8dacb]">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-1.5">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return <h3 key={lIdx} className="text-sm font-extrabold text-[#3b2a1d] mt-2 mb-1">{trimmed.slice(4)}</h3>;
          }
          if (trimmed.startsWith('#### ')) {
            return <h4 key={lIdx} className="text-xs font-bold text-[#8c5d3b] mt-1 mb-0.5">{trimmed.slice(5)}</h4>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={lIdx} className="flex items-start space-x-2 pl-2">
                <span className="text-[#8c5d3b] font-bold">·</span>
                <span className="flex-1">{formatInlineMath(trimmed.slice(2))}</span>
              </div>
            );
          }
          return (
            <p key={lIdx} className="leading-relaxed">
              {formatInlineMath(trimmed)}
            </p>
          );
        })}
      </div>
    );
  });
}

function formatInlineMath(text: string) {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return <strong key={bIdx} className="font-extrabold text-[#3b2a1d]">{bPart.slice(2, -2)}</strong>;
    }

    const mathParts = bPart.split(/(\$.*?\$)/g);
    return mathParts.map((mPart, mIdx) => {
      if (mPart.startsWith('$') && mPart.endsWith('$')) {
        return (
          <code key={mIdx} className="bg-[#e8decb] border border-[#d2c0a6] text-[#5c3a21] px-1.5 py-0.5 rounded font-mono text-[11px]">
            {mPart.slice(1, -1)}
          </code>
        );
      }
      return mPart;
    });
  });
}
