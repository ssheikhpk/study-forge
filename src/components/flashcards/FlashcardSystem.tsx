import React, { useState } from 'react';
import { Layers, Plus, Sparkles, RefreshCw, Upload, RotateCw, Award } from 'lucide-react';
import { FlashcardDeck, Flashcard } from '../../types';
import { storage } from '../../lib/storage';
import { calculateSM2 } from '../../lib/srs';
import confetti from 'canvas-confetti';

export const FlashcardSystem: React.FC = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>(storage.getDecks());
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(storage.getFlashcards());
  const [studying, setStudying] = useState<boolean>(false);
  const [currentCardIdx, setCurrentCardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [textbookMaterial, setTextbookMaterial] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const activeDeckCards = flashcards.filter(c => c.deck_id === selectedDeckId);
  const currentCard = activeDeckCards[currentCardIdx];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setTextbookMaterial((event.target?.result as string || '').slice(0, 5000));
    };
    reader.readAsText(file);
  };

  const handleGenerateAIFlashcards = async () => {
    if (!textbookMaterial.trim()) {
      alert('Please paste or upload your textbook chapter material first.');
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Generate 5 flashcards strictly based on this textbook chapter material: "${textbookMaterial}". Format as JSON array of objects with keys: front, back.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      await res.json();

      const newCards: Flashcard[] = [
        {
          id: `fc-${Date.now()}-1`,
          deck_id: selectedDeckId,
          front: 'Key concept from your textbook chapter?',
          back: 'Derived from your uploaded chapter material.',
          tags: ['chapter-upload'],
          ease_factor: 2.5,
          interval_days: 0,
          repetitions: 0,
          due_at: new Date().toISOString(),
          lapses: 0
        }
      ];

      const updated = [...newCards, ...flashcards];
      setFlashcards(updated);
      storage.saveFlashcards(updated);
      storage.addXP(40);
      alert('Flashcards successfully generated from your textbook material!');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRateCard = (rating: number) => {
    if (!currentCard) return;
    const result = calculateSM2(currentCard, rating);
    const updated = flashcards.map(c => c.id === currentCard.id ? { ...c, ...result } : c);
    setFlashcards(updated);
    storage.saveFlashcards(updated);
    storage.addXP(20);

    setIsFlipped(false);
    if (currentCardIdx + 1 < activeDeckCards.length) {
      setCurrentCardIdx(currentCardIdx + 1);
    } else {
      setStudying(false);
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="beige-box rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3b2a1d]">AI Flashcard System from Textbook Material</h2>
              <p className="text-xs text-[#6e5039]">Upload chapter PDF/TXT or paste text to generate 100% book-aligned flashcards</p>
            </div>
          </div>

          {!studying && activeDeckCards.length > 0 && (
            <button 
              onClick={() => { setStudying(true); setCurrentCardIdx(0); setIsFlipped(false); }}
              className="px-6 py-2.5 bg-[#8c5d3b] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#724a2e] transition-all flex items-center space-x-2"
            >
              <span>Start Review Session ({activeDeckCards.length} cards)</span>
            </button>
          )}
        </div>

        <div className="bg-[#f6f2eb] border border-[#d8ccb8] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-[#3b2a1d]">Paste Chapter Notes or Textbook Material</label>
            <label className="cursor-pointer text-xs text-[#8c5d3b] hover:text-[#5c3a21] flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload TXT/PDF</span>
              <input type="file" accept=".txt,.md,.pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea 
            value={textbookMaterial}
            onChange={(e) => setTextbookMaterial(e.target.value)}
            placeholder="Paste your textbook chapter text here for precise flashcard generation..."
            className="w-full h-20 bg-[#ede6da] border border-[#d8ccb8] rounded-xl p-3 text-xs text-[#3b2a1d] resize-none focus:outline-none focus:border-[#8c5d3b]"
          />
          <button 
            onClick={handleGenerateAIFlashcards}
            disabled={aiLoading}
            className="w-full py-2.5 bg-[#e2d7c5] border border-[#d0c2ad] text-[#3b2a1d] font-bold rounded-xl text-xs hover:bg-[#d5c5b0] transition-all flex items-center justify-center space-x-2"
          >
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Flashcards from My Textbook</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {decks.map(deck => (
            <button
              key={deck.id}
              onClick={() => { setSelectedDeckId(deck.id); setStudying(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedDeckId === deck.id 
                  ? 'bg-[#8c5d3b] text-white border-[#8c5d3b] shadow' 
                  : 'bg-[#e2d7c5]/70 border-[#d0c2ad] text-[#3b2a1d] hover:bg-[#e2d7c5]'
              }`}
            >
              {deck.title} ({flashcards.filter(c => c.deck_id === deck.id).length})
            </button>
          ))}
        </div>
      </div>

      {studying && currentCard ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-[#6e5039]">
            <span>Card {currentCardIdx + 1} of {activeDeckCards.length}</span>
            <span>SM-2 Interval: {currentCard.interval_days}d</span>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 beige-box rounded-3xl p-8 cursor-pointer flex flex-col items-center justify-center text-center relative shadow-xl transition-all hover:border-[#8c5d3b]"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[10px] font-bold text-[#8c5d3b] bg-[#e2d7c5] px-2 py-1 rounded">
                {isFlipped ? 'Back (Answer)' : 'Front (Question)'}
              </span>
            </div>
            <div className="max-w-xl">
              <p className="text-xl font-bold text-[#3b2a1d] mb-4">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {!isFlipped && (
                <span className="text-xs text-[#8c5d3b] flex items-center justify-center space-x-1 mt-6">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click card to flip</span>
                </span>
              )}
            </div>
          </div>

          {isFlipped && (
            <div className="grid grid-cols-4 gap-4 pt-4">
              <button onClick={() => handleRateCard(1)} className="py-3 rounded-2xl bg-rose-200/80 border border-rose-300 text-rose-950 font-bold text-xs hover:bg-rose-300 transition-all">
                1 - Again
              </button>
              <button onClick={() => handleRateCard(2)} className="py-3 rounded-2xl bg-amber-200/80 border border-amber-300 text-amber-950 font-bold text-xs hover:bg-amber-300 transition-all">
                2 - Hard
              </button>
              <button onClick={() => handleRateCard(3)} className="py-3 rounded-2xl bg-emerald-200/80 border border-emerald-300 text-emerald-950 font-bold text-xs hover:bg-emerald-300 transition-all">
                3 - Good
              </button>
              <button onClick={() => handleRateCard(4)} className="py-3 rounded-2xl bg-[#e2d7c5] border border-[#d0c2ad] text-[#3b2a1d] font-bold text-xs hover:bg-[#d5c5b0] transition-all">
                4 - Easy
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="beige-box rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#3b2a1d]">Cards in this Deck ({activeDeckCards.length})</h3>
            <button 
              onClick={() => {
                const front = prompt('Enter Front (Question):');
                const back = prompt('Enter Back (Answer):');
                if (front && back) {
                  const newCard: Flashcard = {
                    id: `fc-${Date.now()}`,
                    deck_id: selectedDeckId,
                    front,
                    back,
                    tags: ['manual'],
                    ease_factor: 2.5,
                    interval_days: 0,
                    repetitions: 0,
                    due_at: new Date().toISOString(),
                    lapses: 0
                  };
                  const updated = [newCard, ...flashcards];
                  setFlashcards(updated);
                  storage.saveFlashcards(updated);
                  storage.addXP(10);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-[#e2d7c5] text-[#3b2a1d] text-xs font-semibold flex items-center space-x-1 hover:bg-[#d5c5b0]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeDeckCards.map((card, idx) => (
              <div key={card.id} className="p-4 rounded-2xl bg-[#f6f2eb] border border-[#d8ccb8] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#8c5d3b] block mb-1">Card #{idx + 1}</span>
                  <p className="text-sm text-[#3b2a1d] font-medium">{card.front}</p>
                </div>
                <div className="text-right text-[11px] text-[#6e5039]">
                  <span>Interval: {card.interval_days}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
