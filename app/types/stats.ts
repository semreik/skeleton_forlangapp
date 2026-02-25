export interface StudySession {
  id: string;
  deckId: string;
  startTime: string;  // ISO date string
  endTime: string;    // ISO date string
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  timeSpentMs: number;
}
