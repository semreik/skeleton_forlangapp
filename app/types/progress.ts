export type ProgressStatus = 'new' | 'learning' | 'mastered';

export interface CardProgress {
  status: ProgressStatus;
  lastAttempt?: string;   // ISO date
  lastCorrect?: string;   // ISO date
}
