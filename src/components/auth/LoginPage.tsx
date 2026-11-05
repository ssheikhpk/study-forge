import React, { useState, useRef } from 'react';
import { User, LogIn, UserPlus, KeyRound, Mail, CheckCircle2, Sparkles, UserCheck, RefreshCw, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { UserProfile } from '../../types';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onNavigateToDashboard?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ user, onUserUpdate, onNavigateToDashboard }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(user.email || '');
  const [fullName, setFullName] = useState(user.full_name || '');
  const [password, setPassword] = useState('••••••••');
  const [photoUrl, setPhotoUrl] = useState<string>(user.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload (converts photo to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    setTimeout(() => {
      const updated: UserProfile = {
        ...user,
        email: email || 'student@studyforge.app',
        full_name: fullName || 'StudyForge Student',
        avatar_url: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      };

      storage.saveUser(updated);
      onUserUpdate(updated);
      setLoading(false);
      setSuccessMsg(`Welcome, ${updated.full_name}! Account saved successfully.`);
      confetti({ particleCount: 50, spread: 60 });
      if (onNavigateToDashboard) {
        setTimeout(onNavigateToDashboard, 1000);
      }
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="beige-box rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-[#e2d7c5] text-[#8c5d3b]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#3b2a1d]">Student Sign In & Profile</h2>
            <p className="text-xs text-[#6e5039]">Manage your credentials, upload your own photo, and access your profile</p>
          </div>
        </div>

        {/* Active Profile Status */}
        <div className="flex items-center space-x-3 bg-[#e2d7c5] border border-[#d0c2ad] px-4 py-2 rounded-2xl shadow-sm">
          <img
            src={user.avatar_url}
            alt={user.full_name}
            className="w-10 h-10 rounded-full border-2 border-[#8c5d3b] object-cover"
          />
          <div className="text-left">
            <div className="text-xs font-black text-[#3b2a1d] flex items-center gap-1">
              <span>{user.full_name}</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span className="text-[10px] text-[#6e5039] font-medium">Lvl {user.level} • {user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Mode switch */}
        <div className="beige-box rounded-3xl p-5 shadow-xl space-y-3 h-fit">
          <h3 className="text-xs font-bold text-[#8c5d3b] uppercase tracking-wider mb-2">Sign In Options</h3>
          
          <button
            onClick={() => setMode('signin')}
            className={`w-full flex items-center space-x-3 p-3 rounded-2xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-[#8c5d3b] text-white shadow-md'
                : 'bg-[#f6f2eb] text-[#3b2a1d] hover:bg-[#e2d7c5] border border-[#d8ccb8]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Account</span>
          </button>

          <button
            onClick={() => setMode('signup')}
            className={`w-full flex items-center space-x-3 p-3 rounded-2xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-[#8c5d3b] text-white shadow-md'
                : 'bg-[#f6f2eb] text-[#3b2a1d] hover:bg-[#e2d7c5] border border-[#d8ccb8]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>

          <div className="pt-4 border-t border-[#d8ccb8] text-[11px] text-[#6e5039] space-y-2">
            <p className="flex items-center gap-1.5 font-semibold text-[#8c5d3b]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Study Sync</span>
            </p>
            <p className="text-[10px] leading-relaxed">
              Upload your own profile picture below. All your notes, streak progress, and test scores will sync automatically.
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="md:col-span-2 beige-box rounded-3xl p-6 shadow-xl">
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#d8ccb8] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#3b2a1d]">
                {mode === 'signin' ? 'Sign In' : 'Create New Account'}
              </h3>
              <span className="text-[10px] text-[#8c5d3b] font-bold uppercase tracking-wider bg-[#e2d7c5] px-2 py-0.5 rounded">
                {mode === 'signin' ? 'Existing Student' : 'New Registration'}
              </span>
            </div>

            {/* Upload Custom Profile Photo Section */}
            <div>
              <label className="block text-xs font-bold text-[#6e5039] mb-2">Upload Your Profile Photo</label>
              <div className="flex items-center space-x-4 bg-[#f6f2eb] p-4 rounded-2xl border border-[#d8ccb8]">
                {/* Image preview */}
                <div className="relative group">
                  <img
                    src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces'}
                    alt="Profile Photo Preview"
                    className="w-16 h-16 rounded-full border-2 border-[#8c5d3b] object-cover shadow-md"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3.5 py-1.5 rounded-xl bg-[#8c5d3b] text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-[#724a2e] transition-colors shadow-sm"
                    >
                      {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Choose Photo from Device</span>
                    </button>
                  </div>

                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-[#8c5d3b] absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={photoUrl.startsWith('data:') ? '' : photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Or paste an image URL..."
                      className="w-full bg-[#ede6da] border border-[#d8ccb8] rounded-xl pl-9 pr-3 py-1.5 text-[11px] text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6e5039] mb-1">Full Student Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8c5d3b] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6e5039] mb-1">Student Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8c5d3b] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@studyforge.app"
                  className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6e5039] mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8c5d3b] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f6f2eb] border border-[#d8ccb8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#3b2a1d] focus:outline-none focus:border-[#8c5d3b]"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={loading || isUploading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#8c5d3b] text-white font-bold text-xs flex items-center justify-center space-x-2 hover:bg-[#724a2e] transition-colors shadow-md"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{mode === 'signin' ? 'Sign In & Save Profile' : 'Register Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const gUser: UserProfile = {
                    ...user,
                    email: 'google.student@studyforge.app',
                    full_name: 'Google Scholar Student',
                  };
                  storage.saveUser(gUser);
                  onUserUpdate(gUser);
                  setSuccessMsg('Signed in via Google Account!');
                  confetti({ particleCount: 50, spread: 60 });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#e2d7c5] border border-[#d0c2ad] text-xs font-bold text-[#3b2a1d] hover:bg-[#d5c5b0] flex items-center justify-center space-x-2"
              >
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
