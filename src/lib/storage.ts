import { Subject, Chapter, Note, MCQQuestion, FlashcardDeck, Flashcard, StudyPlan, WritingSubmission } from '../types';

// LocalStorage persistence layer with seed data
const STORAGE_KEYS = {
  USER: 'studyforge_user',
  SUBJECTS: 'studyforge_subjects',
  CHAPTERS: 'studyforge_chapters',
  NOTES: 'studyforge_notes',
  MCQS: 'studyforge_mcqs',
  DECKS: 'studyforge_decks',
  FLASHCARDS: 'studyforge_flashcards',
  STUDY_PLANS: 'studyforge_study_plans',
  WRITING: 'studyforge_writing',
};

const DEFAULT_USER = {
  id: 'local-user-1',
  email: 'student@studyforge.app',
  full_name: 'Alex Vance',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  xp: 1250,
  level: 4,
  streak: 12,
  last_active_date: new Date().toISOString().split('T')[0]
};

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-1', user_id: 'local-user-1', name: 'Advanced Physics', color: '#f59e0b', target_exam_date: '2026-12-05', progress: 68, created_at: new Date().toISOString() },
  { id: 'sub-2', user_id: 'local-user-1', name: 'Organic Chemistry', color: '#10b981', target_exam_date: '2026-12-10', progress: 45, created_at: new Date().toISOString() },
  { id: 'sub-3', user_id: 'local-user-1', name: 'Calculus & Linear Algebra', color: '#6366f1', target_exam_date: '2026-12-15', progress: 82, created_at: new Date().toISOString() },
  { id: 'sub-4', user_id: 'local-user-1', name: 'Data Structures & Algorithms', color: '#ec4899', target_exam_date: '2026-12-20', progress: 55, created_at: new Date().toISOString() },
];

const DEFAULT_CHAPTERS: Chapter[] = [
  { id: 'chap-1', subject_id: 'sub-1', title: 'Quantum Mechanics & Wave Packets', completed: true, order_index: 1 },
  { id: 'chap-2', subject_id: 'sub-1', title: 'Electromagnetic Induction & Maxwell Eq', completed: false, order_index: 2 },
  { id: 'chap-3', subject_id: 'sub-1', title: 'Thermodynamics & Entropy', completed: false, order_index: 3 },
  { id: 'chap-4', subject_id: 'sub-2', title: 'Reaction Mechanisms & Stereochemistry', completed: true, order_index: 1 },
  { id: 'chap-5', subject_id: 'sub-2', title: 'Spectroscopy (IR, NMR, MS)', completed: false, order_index: 2 },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    user_id: 'local-user-1',
    subject_id: 'sub-1',
    title: 'Quantum Mechanics Formula Sheet',
    content: `# Quantum Mechanics Quick Reference\n\n- **Schrödinger Equation**: $i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi$\n- **Heisenberg Uncertainty Principle**: $\\Delta x \\Delta p \\ge \\frac{\\hbar}{2}$\n- **De Broglie Wavelength**: $\\lambda = \\frac{h}{p}$\n\n\`\`\`python\n# Energy Eigenvalue calculation\ndef compute_energy(n, m, L):\n    h = 6.626e-34\n    return (n**2 * h**2) / (8 * m * L**2)\n\`\`\`\n\nKey takeaway: Energy levels are quantized in a potential well!`,
    note_type: 'formula',
    tags: ['quantum', 'physics', 'equations'],
    is_pinned: true,
    is_trashed: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'note-2',
    user_id: 'local-user-1',
    subject_id: 'sub-3',
    title: 'Multivariable Calculus Notes',
    content: `# Stokes Theorem & Divergence\n\nGradient, curl, and divergence connect line integrals, surface integrals, and volume integrals.\n\n$$\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S} = \\oint_C \\mathbf{F} \\cdot d\\mathbf{r}$$`,
    note_type: 'long-form',
    tags: ['calculus', 'math'],
    is_pinned: false,
    is_trashed: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_DECKS: FlashcardDeck[] = [
  { id: 'deck-1', user_id: 'local-user-1', subject_id: 'sub-1', title: 'Physics Exam Core Flashcards', description: 'Essential formulas and concepts for advanced physics.' },
  { id: 'deck-2', user_id: 'local-user-1', subject_id: 'sub-3', title: 'Calculus Theorems', description: 'Limits, derivatives, and integral formulas.' },
  { id: 'mistake-deck', user_id: 'local-user-1', title: 'Auto Mistake Deck', description: 'Flashcards automatically generated from missed quiz questions.', is_mistake_deck: true }
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    deck_id: 'deck-1',
    front: 'What is Heisenberg Uncertainty Principle?',
    back: 'It states that position and momentum cannot both be measured with exact precision at the same time: $\\Delta x \\Delta p \\ge \\hbar/2$.',
    tags: ['quantum'],
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    due_at: new Date().toISOString(),
    lapses: 0
  },
  {
    id: 'fc-2',
    deck_id: 'deck-1',
    front: 'State Gauss Law for Electricity',
    back: 'The total electric flux out of a closed surface is equal to the charge enclosed divided by vacuum permittivity: $\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{q_{\\text{enc}}}{\\varepsilon_0}$.',
    tags: ['electromagnetism'],
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 1,
    due_at: new Date().toISOString(),
    lapses: 0
  }
];

export const storage = {
  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : DEFAULT_USER;
  },
  saveUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getSubjects: (): Subject[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
  },
  saveSubjects: (subjects: Subject[]) => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },
  getChapters: (): Chapter[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    return data ? JSON.parse(data) : DEFAULT_CHAPTERS;
  },
  saveChapters: (chapters: Chapter[]) => {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  },
  getNotes: (): Note[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : DEFAULT_NOTES;
  },
  saveNotes: (notes: Note[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },
  getDecks: (): FlashcardDeck[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DECKS);
    return data ? JSON.parse(data) : DEFAULT_DECKS;
  },
  saveDecks: (decks: FlashcardDeck[]) => {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  },
  getFlashcards: (): Flashcard[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return data ? JSON.parse(data) : DEFAULT_FLASHCARDS;
  },
  saveFlashcards: (cards: Flashcard[]) => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
  },
  addXP: (amount: number) => {
    const user = storage.getUser();
    user.xp += amount;
    // Level up every 500 XP
    user.level = Math.floor(user.xp / 500) + 1;
    storage.saveUser(user);
    return user;
  }
};
