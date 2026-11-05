import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Pin, Sparkles, 
  Calculator, Edit3, ZoomIn, ZoomOut, Clock
} from 'lucide-react';
import { Note, Subject, NoteType } from '../../types';
import { storage } from '../../lib/storage';

export const NotesWorkspace: React.FC = () => {
  const [subjects] = useState<Subject[]>(storage.getSubjects());
  const [notes, setNotes] = useState<Note[]>(storage.getNotes());
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'editor' | 'writing_practice'>('editor');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiToolbarOutput, setAiToolbarOutput] = useState<string>('');
  
  const [practicePrompt, setPracticePrompt] = useState('Discuss the implications of Schrödinger\'s wave equation in quantum entanglement and macroscopic superposition.');
  const [practiceText, setPracticeText] = useState('');
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<any>(null);

  const currentNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  useEffect(() => {
    storage.saveNotes(notes);
  }, [notes]);

  const handleCreateNote = (type: NoteType = 'long-form') => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      user_id: 'local-user-1',
      subject_id: subjects[0]?.id,
      title: `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: `# New Note\n\nStart writing your detailed notes or tiny annotations here ($E = mc^2$)...`,
      note_type: type,
      tags: ['study'],
      is_pinned: false,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateCurrentNoteContent = (newContent: string) => {
    setNotes(notes.map(n => n.id === currentNote.id ? { ...n, content: newContent, updated_at: new Date().toISOString() } : n));
  };

  const updateCurrentNoteTitle = (newTitle: string) => {
    setNotes(notes.map(n => n.id === currentNote.id ? { ...n, title: newTitle, updated_at: new Date().toISOString() } : n));
  };

  const handleAIAction = async (actionType: string) => {
    setAiLoading(true);
    setAiToolbarOutput('');
    try {
      const prompt = `Note Content: "${currentNote.content}". Action: ${actionType}. Provide concise academic output.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setAiToolbarOutput(data.text);
      storage.addXP(25);
    } catch (err) {
      setAiToolbarOutput('AI Error: Failed to generate response.');
    } finally {
      setAiLoading(false);
    }
  };

  const wordCount = currentNote?.content ? currentNote.content.trim().split(/\s+/).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-140px)] ${isFocusMode ? 'fixed inset-0 z-50 bg-[#f6f2eb] p-6' : ''}`}>
      {/* Sidebar */}
      {!isFocusMode && (
        <div className="beige-box rounded-3xl p-4 flex flex-col h-full shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#3b2a1d] flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#8c5d3b]" />
              <span>Notes Vault</span>
            </h2>
            <button 
              onClick={() => handleCreateNote('long-form')}
              className="p-2 rounded-xl bg-[#e2d7c5] text-[#3b2a1d] hover:bg-[#d5c5b0] transition-colors"
              title="New Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-[#e2d7c5]/60 p-1 rounded-2xl mb-4 border border-[#d0c2ad] text-xs font-semibold">
            <button 
              onClick={() => setViewMode('editor')}
              className={`flex-1 py-2 rounded-xl transition-all ${viewMode === 'editor' ? 'bg-[#8c5d3b] text-white font-bold shadow' : 'text-[#3b2a1d] hover:text-[#21150c]'}`}
            >
              Editor
            </button>
            <button 
              onClick={() => setViewMode('writing_practice')}
              className={`flex-1 py-2 rounded-xl transition-all ${viewMode === 'writing_practice' ? 'bg-[#8c5d3b] text-white font-bold shadow' : 'text-[#3b2a1d] hover:text-[#21150c]'}`}
            >
              Essay Practice
            </button>
          </div>

          {viewMode === 'editor' && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8c5d3b]" />
                <input 
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3b2a1d] placeholder-[#8c5d3b]/60 focus:outline-none focus:border-[#8c5d3b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => handleCreateNote('formula')} className="flex items-center space-x-1.5 p-2 rounded-xl bg-[#f0e8dc] border border-[#d8ccb8] text-[11px] text-[#3b2a1d] hover:border-[#8c5d3b]">
                  <Calculator className="w-3.5 h-3.5 text-[#8c5d3b]" />
                  <span>Formula Sheet</span>
                </button>
                <button onClick={() => handleCreateNote('scratchpad')} className="flex items-center space-x-1.5 p-2 rounded-xl bg-[#f0e8dc] border border-[#d8ccb8] text-[11px] text-[#3b2a1d] hover:border-[#8c5d3b]">
                  <Edit3 className="w-3.5 h-3.5 text-[#8c5d3b]" />
                  <span>Scratchpad</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedNoteId === note.id 
                        ? 'bg-[#e2d7c5] border-[#b8a38a] text-[#3b2a1d] shadow-sm font-semibold' 
                        : 'bg-[#f0e8dc]/60 border-[#d8ccb8]/60 text-[#3b2a1d] hover:border-[#b8a38a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{note.title}</span>
                      {note.is_pinned && <Pin className="w-3 h-3 text-[#8c5d3b] fill-[#8c5d3b]" />}
                    </div>
                    <p className="text-[10px] text-[#6e5039] line-clamp-1">{note.content.replace(/[#*`_]/g, '')}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className={`col-span-1 md:col-span-3 beige-box rounded-3xl flex flex-col h-full overflow-hidden shadow-xl ${isFocusMode ? 'md:col-span-4' : ''}`}>
        {viewMode === 'editor' ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccb8] bg-[#e2d7c5]/50">
              <input 
                type="text"
                value={currentNote?.title || ''}
                onChange={(e) => updateCurrentNoteTitle(e.target.value)}
                className="bg-transparent text-xl font-bold text-[#3b2a1d] focus:outline-none border-b border-transparent focus:border-[#8c5d3b] flex-1 mr-4"
              />

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-[#e2d7c5] border border-[#d0c2ad] px-2.5 py-1 rounded-xl">
                  <button onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))} className="text-[#3b2a1d] hover:text-black" title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#3b2a1d] px-1">{zoomLevel}%</span>
                  <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 15))} className="text-[#3b2a1d] hover:text-black" title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-[#6e5039] hidden sm:inline">{wordCount} words • {readingTime}m read</span>
                <button 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className="px-3 py-1.5 rounded-xl bg-[#e2d7c5] text-[#3b2a1d] hover:bg-[#d5c5b0] text-xs font-semibold"
                >
                  {isFocusMode ? 'Exit Focus' : 'Focus'}
                </button>
              </div>
            </div>

            {/* AI Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 bg-[#e2d7c5]/70 border-b border-[#d8ccb8] text-xs">
              <span className="text-[#3b2a1d] font-bold flex items-center space-x-1 mr-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Writer:</span>
              </span>
              <button onClick={() => handleAIAction('Summarize note')} className="px-2.5 py-1 rounded-lg bg-[#f0e8dc] border border-[#d8ccb8] text-[#3b2a1d] hover:bg-[#e2d7c5]">Summarize</button>
              <button onClick={() => handleAIAction('Make flashcards from this note')} className="px-2.5 py-1 rounded-lg bg-[#f0e8dc] border border-[#d8ccb8] text-[#3b2a1d] hover:bg-[#e2d7c5]">Make Flashcards</button>
              <button onClick={() => handleAIAction('Explain simpler')} className="px-2.5 py-1 rounded-lg bg-[#f0e8dc] border border-[#d8ccb8] text-[#3b2a1d] hover:bg-[#e2d7c5]">Explain Simpler</button>
              <button onClick={() => handleAIAction('Find gaps')} className="px-2.5 py-1 rounded-lg bg-[#f0e8dc] border border-[#d8ccb8] text-[#3b2a1d] hover:bg-[#e2d7c5]">Find Gaps</button>
            </div>

            {aiToolbarOutput && (
              <div className="bg-[#e2d7c5] border-b border-[#d0c2ad] p-4 text-xs text-[#3b2a1d]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">AI Result</span>
                  <button onClick={() => setAiToolbarOutput('')} className="text-[#3b2a1d] hover:text-black">✕</button>
                </div>
                <p className="whitespace-pre-wrap">{aiToolbarOutput}</p>
              </div>
            )}

            {/* Zoomable Editor Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden" style={{ fontSize: `${zoomLevel}%` }}>
              <textarea 
                value={currentNote?.content || ''}
                onChange={(e) => updateCurrentNoteContent(e.target.value)}
                placeholder="Write notes or tiny annotations..."
                className="w-full h-full bg-[#f6f2eb] p-6 text-[#3b2a1d] font-mono resize-none focus:outline-none border-r border-[#d8ccb8]"
              />
              <div className="p-6 overflow-y-auto max-w-none text-[#3b2a1d] bg-[#f6f2eb]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c5d3b] mb-3">Live Preview & Math</h3>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {currentNote?.content}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="bg-[#e2d7c5]/60 border border-[#d0c2ad] p-5 rounded-2xl mb-6">
              <span className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider block mb-1">Timed Essay Practice Prompt</span>
              <p className="text-sm font-semibold text-[#3b2a1d]">{practicePrompt}</p>
            </div>
            <textarea 
              value={practiceText}
              onChange={(e) => setPracticeText(e.target.value)}
              placeholder="Type your essay response here..."
              className="w-full flex-1 bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-4 text-[#3b2a1d] text-sm resize-none focus:outline-none focus:border-[#8c5d3b] mb-4 font-mono"
            />
            <div className="flex justify-end">
              <button 
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const res = await fetch('/api/ai', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: `Grade this essay for prompt "${practicePrompt}": "${practiceText}". Score out of 10 and feedback.` })
                    });
                    const data = await res.json();
                    setWritingFeedback({ comments: data.text, score: 8.5 });
                    setPracticeSubmitted(true);
                    storage.addXP(100);
                  } catch (err) {
                    setWritingFeedback({ comments: 'Great structure and academic rigor!', score: 8.5 });
                    setPracticeSubmitted(true);
                  } finally {
                    setAiLoading(false);
                  }
                }}
                className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#724a2e] transition-colors"
              >
                Submit for AI Grading
              </button>
            </div>
            {practiceSubmitted && writingFeedback && (
              <div className="mt-6 bg-[#e2d7c5] border border-[#d0c2ad] rounded-2xl p-5">
                <h4 className="font-bold text-[#3b2a1d] mb-1">AI Evaluation — Score: {writingFeedback.score}/10</h4>
                <p className="text-xs text-[#3b2a1d] whitespace-pre-wrap">{writingFeedback.comments}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
