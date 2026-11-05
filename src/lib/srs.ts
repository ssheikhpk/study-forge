import { Flashcard } from '../types';

export interface SM2Result {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_at: string;
  lapses: number;
}

export function calculateSM2(card: Flashcard, rating: number): SM2Result {
  let { ease_factor, interval_days, repetitions, lapses } = card;

  // rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  if (rating < 3) {
    repetitions = 0;
    interval_days = 1;
    lapses += 1;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  // update ease factor
  // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  // Here grade corresponds to rating (1->1, 2->2, 3->4, 4->5 or similar mapping)
  // Let's map rating 1..4 to grade 1..5: 1->1, 2->3, 3->4, 4->5
  const grade = rating === 1 ? 1 : rating === 2 ? 3 : rating === 3 ? 4 : 5;
  ease_factor = ease_factor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  ease_factor = Math.max(1.3, Math.min(3.5, ease_factor));

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval_days);

  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    due_at: dueDate.toISOString(),
    lapses
  };
}
