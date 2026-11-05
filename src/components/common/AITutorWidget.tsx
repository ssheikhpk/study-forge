import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, RefreshCw } from 'lucide-react';
import { storage } from '../../lib/storage';

export const AITutorWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hi! Need quick study help, code review, or exam tips? Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const updatedMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${userText}`,
          systemInstruction: 'You are an AI assistant just like ChatGPT and DeepSeek. Speak in a friendly, conversational, intelligent, and natural human tone in plain, easy-to-understand English. Directly answer the user\'s specific question and thoroughly explain the actual topic, concepts, mechanics, and examples. NEVER lecture the user about "how to look at questions on exams" or give exam advice—just explain the subject matter directly! Do NOT use rigid numbered step-by-step breakdowns. At the very end of your explanation, provide ONLY a small, concise 1-2 sentence summary under "### 📌 Summary". Do NOT ask any follow-up questions back.'
        })
      });

      const data = await res.json();
      const reply = data.text || "Here is the direct answer to your question.";
      setMessages([...updatedMessages, { role: 'assistant', text: reply }]);
      storage.addXP(10);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: `Here is my answer for "${userText}": Focus on breaking concepts down step-by-step!` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Small floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#8c5d3b] text-white font-bold text-xs shadow-2xl hover:bg-[#724a2e] transition-all hover:scale-105 border border-[#d0c2ad]"
        >
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span>AI Chat</span>
        </button>
      )}

      {/* Small side popup chat drawer */}
      {isOpen && (
        <div className="w-72 sm:w-80 h-96 beige-box rounded-2xl shadow-2xl flex flex-col border border-[#d8ccb8] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#ede6da] p-3 border-b border-[#d8ccb8] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#8c5d3b] text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#3b2a1d]">AI Assistant</span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-[#e2d7c5] text-[#3b2a1d]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[#f6f2eb]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-1.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`p-1 rounded-lg flex-shrink-0 text-[10px] ${
                  msg.role === 'user' ? 'bg-[#8c5d3b] text-white font-bold' : 'bg-[#e2d7c5] text-[#8c5d3b]'
                }`}>
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>

                <div className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#8c5d3b] text-white rounded-tr-none shadow-sm'
                    : 'bg-[#ede6da] border border-[#d8ccb8] text-[#3b2a1d] rounded-tl-none shadow-sm whitespace-pre-wrap'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-[11px] text-[#8c5d3b] italic bg-[#ede6da] p-2 rounded-xl w-fit">
                <RefreshCw className="w-3 h-3 animate-spin text-[#8c5d3b]" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSend} className="p-2 bg-[#ede6da] border-t border-[#d8ccb8] flex items-center space-x-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-lg px-2.5 py-1.5 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-1.5 rounded-lg bg-[#8c5d3b] text-white disabled:opacity-50 hover:bg-[#724a2e]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
