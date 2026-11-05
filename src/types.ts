export type NoteType = 'long-form' | 'scratchpad' | 'formula' | 'lab' | 'journal';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  streak: number;
  last_active_date: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  target_exam_date: string;
  progress: number; // 0 - 100
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  completed: boolean;
  order_index: number;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  content: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id?: string;
  chapter_id?: string;
  title: string;
  content: string;
  note_type: NoteType;
  tags: string[];
  is_pinned: boolean;
  is_trashed: boolean;
  trashed_at?: string;
  created_at: string;
  updated_at: string;
  versions?: NoteVersion[];
}

export interface MCQQuestion {
  id: string;
  user_id: string;
  subject_id?: string;
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'exam';
  category: 'general' | 'english';
  is_mistake: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  subject_id?: string;
  score: number;
  total: number;
  mode: 'practice' | 'exam';
  completed_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  is_mistake_deck?: boolean;
  card_count?: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  image_url?: string;
  code_snippet?: string;
  tags: string[];
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  lapses: number;
}

export interface ReviewLog {
  id: string;
  user_id: string;
  flashcard_id: string;
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewed_at: string;
}

export interface StudyPlanItem {
  day: number;
  date: string;
  tasks: {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    completed: boolean;
    type: 'pomodoro' | 'revision' | 'mock' | 'flashcards' | 'writing';
  }[];
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  plan_data: StudyPlanItem[];
  start_date: string;
  end_date: string;
}

export interface WritingSubmission {
  id: string;
  user_id: string;
  prompt: string;
  content: string;
  word_count: number;
  time_spent_seconds: number;
  score?: number;
  feedback?: {
    grammarScore: number;
    coherenceScore: number;
    vocabularyScore: number;
    structureScore: number;
    comments: string;
    modelAnswerComparison: string;
  };
  created_at: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  language: 'python' | 'cpp' | 'java' | 'javascript';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  initialCode: string;
  testCases: { input: string; expected: string }[];
  hints: string[];
}
