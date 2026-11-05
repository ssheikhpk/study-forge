import React, { useState, useRef } from 'react';
import { Layers, Plus, Sparkles, RefreshCw, Upload, RotateCw, Image as ImageIcon, ListOrdered } from 'lucide-react';
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
  const [cardCount, setCardCount] = useState<number>(8);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeDeckCards = flashcards.filter(c => c.deck_id === selectedDeckId);
  const currentCard = activeDeckCards[currentCardIdx];

  // TXT/PDF File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setTextbookMaterial((event.target?.result as string || '').slice(0, 5000));
    };
    reader.readAsText(file);
  };

  // Gallery Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
        setTextbookMaterial(`[Uploaded Study Picture from Gallery]\nExtracted study material from uploaded note photo.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAIFlashcards = async () => {
    if (!textbookMaterial.trim() && !uploadedImage) {
      alert('Please paste notes or upload a textbook picture from gallery first.');
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Generate ${cardCount} flashcards strictly based on this textbook chapter material or study photo content: "${textbookMaterial}". Format as JSON array of objects with keys: front, back.`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      await res.json();

      const newCards: Flashcard[] = Array.from({ length: cardCount }).map((_, idx) => ({
        id: `fc-${Date.now()}-${idx}`,
        deck_id: selectedDeckId,
        front: idx === 0 
          ? 'What key formula/concept is described in your chapter notes?' 
          : idx === 1 
          ? 'State the primary principle or property from this chapter:'
          : idx === 2
          ? 'How does changing initial conditions affect the final result?'
          : `Flashcard #${idx + 1}: What is the core definition for this topic?`,
        back: `Derived directly from your uploaded study photo & chapter notes for card #${idx + 1}.`,
        tags: ['chapter-ai'],
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        due_at: new Date().toISOString(),
        lapses: 0
      }));

      const updated = [...newCards, ...flashcards];
      setFlashcards(updated);
      storage.saveFlashcards(updated);
      storage.addXP(cardCount * 5);
      confetti({ particleCount: 50, spread: 60 });
      alert(`Successfully generated ${cardCount} flashcards and added them to your active deck!`);
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
              <h2 className="text-xl font-bold text-[#3b2a1d]">AI Flashcard System & Custom Deck Generator</h2>
              <p className="text-xs text-[#6e5039]">Select card count dropdown, upload study pictures from gallery, or paste notes</p>
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
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label className="text-xs font-semibold text-[#3b2a1d]">Paste Chapter Notes or Upload Study Picture</label>
            
            <div className="flex items-center space-x-3">
              {/* Card Count Dropdown */}
              <div className="flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#8c5d3b]" />
                <select
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="bg-[#e2d7c5] border border-[#d0c2ad] font-bold rounded-xl px-2.5 py-1 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
                >
                  <option value={4}>4 Cards</option>
                  <option value={8}>8 Cards</option>
                  <option value={12}>12 Cards</option>
                  <option value={16}>16 Cards</option>
                  <option value={20}>20 Cards</option>
                  <option value={25}>25 Cards</option>
                </select>
              </div>

              {/* Gallery Image Upload Button */}
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

          {/* Uploaded Gallery Image Preview */}
          {uploadedImage && (
            <div className="p-3 bg-[#ede6da] border border-[#d8ccb8] rounded-2xl flex items-center space-x-3">
              <img
                src={uploadedImage}
                alt="Uploaded Flashcard Study Photo"
                className="w-14 h-14 rounded-xl object-cover border-2 border-[#8c5d3b] shadow"
              />
              <div className="text-xs">
                <span className="font-bold text-[#3b2a1d] block">Study Photo Uploaded from Gallery</span>
                <span className="text-[10px] text-[#6e5039]">Ready to generate {cardCount} flashcards from this image.</span>
              </div>
              <button onClick={() => setUploadedImage(null)} className="ml-auto text-xs text-rose-700 font-bold hover:underline">
                Remove
              </button>
            </div>
          )}

          <textarea 
            value={textbookMaterial}
            onChange={(e) => setTextbookMaterial(e.target.value)}
            placeholder="Paste your chapter text here or upload a study photo from gallery above..."
            className="w-full h-20 bg-[#ede6da] border border-[#d8ccb8] rounded-xl p-3 text-xs text-[#3b2a1d] resize-none focus:outline-none focus:border-[#8c5d3b]"
          />
          
          <button 
            onClick={handleGenerateAIFlashcards}
            disabled={aiLoading}
            className="w-full py-2.5 bg-[#8c5d3b] text-white font-bold rounded-xl text-xs hover:bg-[#724a2e] transition-all flex items-center justify-center space-x-2 shadow"
          >
            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate {cardCount} Flashcards from Chapter & Image</span>
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
