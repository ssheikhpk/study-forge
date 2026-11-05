import React from 'react';
import { 
  BookOpen, LayoutDashboard, Brain, Layers, Cpu, Code2, 
  BookMarked, Calendar, Flame, Trophy, User, LogIn
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes Workspace', icon: BookOpen },
    { id: 'mcq', label: 'MCQ Quizzes', icon: Brain },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'physics', label: 'Physics Sim Lab', icon: Cpu },
    { id: 'coding', label: 'Python Coding', icon: Code2 },
    { id: 'english', label: 'English MCQs', icon: BookMarked },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#ede6da]/95 backdrop-blur-md border-b border-[#d8ccb8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8c5d3b] to-[#a3724e] flex items-center justify-center shadow-lg shadow-[#8c5d3b]/20 text-white font-black text-xl">
              SF
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-[#6b452b] to-[#8c5d3b] bg-clip-text text-transparent">
                StudyForge
              </span>
              <span className="block text-[10px] text-[#8c5d3b] font-bold tracking-wider uppercase">
                Warm Light Beige Edition
              </span>
            </div>
          </div>

          {/* User Stats & Badges & Top Bar Login */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-[#e2d7c5] border border-[#d0c2ad] px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-semibold text-[#3b2a1d]">{user.streak} Day Streak</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#e2d7c5] border border-[#d0c2ad] px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4 text-[#8c5d3b]" />
              <span className="text-xs font-semibold text-[#3b2a1d]">Lvl {user.level}</span>
              <span className="text-[10px] text-[#5c3a21] font-bold bg-[#d5c5b0] px-1.5 py-0.5 rounded">
                {user.xp} XP
              </span>
            </div>

            {/* Clickable User Login Button on Top Bar */}
            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center space-x-2 border-l border-[#d8ccb8] pl-3 py-1 pr-2 rounded-xl transition-all ${
                activeTab === 'login' ? 'bg-[#8c5d3b]/15 border border-[#8c5d3b]/40' : 'hover:bg-[#e2d7c5]/60'
              }`}
              title="Click to view Login & Account settings"
            >
              <img 
                src={user.avatar_url} 
                alt={user.full_name} 
                className="w-8 h-8 rounded-full border-2 border-[#8c5d3b] object-cover"
              />
              <span className="hidden lg:inline text-xs font-bold text-[#3b2a1d] max-w-[100px] truncate">
                {user.full_name}
              </span>
              <LogIn className="w-3.5 h-3.5 text-[#8c5d3b]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-[#d8ccb8]/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8c5d3b] text-white shadow-md shadow-[#8c5d3b]/20'
                    : 'text-[#3b2a1d]/80 hover:text-[#261b12] hover:bg-[#e2d7c5]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8c5d3b]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
