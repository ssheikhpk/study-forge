-- StudyForge Supabase PostgreSQL Database Schema

create extension if not exists "uuid-ossp";

-- Users Profile table (linked to auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  last_active_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  color text default '#f59e0b',
  target_exam_date date,
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chapters table
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notes table
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  title text not null,
  content text default '',
  note_type text default 'long-form', -- long-form, scratchpad, formula, lab, journal
  tags text[] default '{}',
  is_pinned boolean default false,
  is_trashed boolean default false,
  trashed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note Version History
create table public.note_versions (
  id uuid default uuid_generate_v4() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MCQ Questions
create table public.mcq_questions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  topic text not null,
  question text not null,
  options jsonb not null, -- array of 4 options
  correct_index integer not null,
  explanation text not null,
  difficulty text default 'medium', -- easy, medium, hard, exam
  category text default 'general', -- general, english
  is_mistake boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz Attempts
create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  score integer not null,
  total integer not null,
  mode text default 'practice', -- practice, exam
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Flashcard Decks
create table public.flashcard_decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text,
  is_mistake_deck boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Flashcards (SM-2 parameters)
create table public.flashcards (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references public.flashcard_decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  image_url text,
  code_snippet text,
  tags text[] default '{}',
  ease_factor numeric default 2.5,
  interval_days integer default 0,
  repetitions integer default 0,
  due_at timestamp with time zone default timezone('utc'::text, now()),
  lapses integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Review Logs
create table public.review_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  flashcard_id uuid references public.flashcards(id) on delete cascade not null,
  rating integer not null, -- 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Study Plans
create table public.study_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  plan_data jsonb not null, -- day by day tasks
  start_date date not null,
  end_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Writing Prompts & Submissions
create table public.writing_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  prompt text not null,
  content text not null,
  word_count integer not null,
  time_spent_seconds integer not null,
  score numeric,
  feedback jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.review_logs enable row level security;
alter table public.study_plans enable row level security;
alter table public.writing_submissions enable row level security;

-- Policies (users can CRUD their own data)
create policy "Users can manage own profile" on public.users for all using (auth.uid() = id);
create policy "Users can manage own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Users can manage own chapters" on public.chapters for all using (exists (select 1 from public.subjects where subjects.id = chapters.subject_id and subjects.user_id = auth.uid()));
create policy "Users can manage own notes" on public.notes for all using (auth.uid() = user_id);
create policy "Users can manage own note versions" on public.note_versions for all using (exists (select 1 from public.notes where notes.id = note_versions.note_id and notes.user_id = auth.uid()));
create policy "Users can manage own mcq" on public.mcq_questions for all using (auth.uid() = user_id);
create policy "Users can manage own quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id);
create policy "Users can manage own decks" on public.flashcard_decks for all using (auth.uid() = user_id);
create policy "Users can manage own flashcards" on public.flashcards for all using (exists (select 1 from public.flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid()));
create policy "Users can manage own review logs" on public.review_logs for all using (auth.uid() = user_id);
create policy "Users can manage own study plans" on public.study_plans for all using (auth.uid() = user_id);
create policy "Users can manage own writing" on public.writing_submissions for all using (auth.uid() = user_id);
