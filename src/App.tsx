import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { NotesWorkspace } from './components/notes/NotesWorkspace';
import { MCQQuizEngine } from './components/mcq/MCQQuizEngine';
import { FlashcardSystem } from './components/flashcards/FlashcardSystem';
import { PhysicsSimLab } from './components/physics/PhysicsSimLab';
import { CodingPractice } from './components/coding/CodingPractice';
import { EnglishMCQs } from './components/english/EnglishMCQs';
import { SmartStudyPlanner } from './components/planner/SmartStudyPlanner';
import { LoginPage } from './components/auth/LoginPage';
import { storage } from './lib/storage';
import { UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile>(storage.getUser());
  const subjects = storage.getSubjects();

  return (
    <div className="min-h-screen bg-[#f6f2eb] text-[#3b2a1d] flex flex-col relative">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard user={user} subjects={subjects} setActiveTab={setActiveTab} />}
        {activeTab === 'notes' && <NotesWorkspace />}
        {activeTab === 'mcq' && <MCQQuizEngine />}
        {activeTab === 'flashcards' && <FlashcardSystem />}
        {activeTab === 'physics' && <PhysicsSimLab />}
        {activeTab === 'coding' && <CodingPractice />}
        {activeTab === 'english' && <EnglishMCQs />}
        {activeTab === 'planner' && <SmartStudyPlanner />}
        {activeTab === 'login' && (
          <LoginPage
            user={user}
            onUserUpdate={setUser}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
