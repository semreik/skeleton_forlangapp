import 'react-native-get-random-values';
import { create } from 'zustand';
import * as SecureStore from '../../lib/utils/secureStore';
import { useAuth } from './useAuth';
import type { Card } from '../types/deck';
import type { CardProgress, ProgressStatus } from '../types/progress';
import type { StudySession } from '../types/stats';
import logger from '../utils/logger';

type DeckProgress = Record<string, CardProgress>; // cardId → progress

export interface ProgressState {
  progress: Record<string, DeckProgress>;  // deckId → cards
  sessions: StudySession[];  // Study session history
  currentSession: StudySession | null;  // Active study session
  setMastered: (deckId: string, cardId: string, mastered: boolean) => Promise<void>;
  setLearning: (deckId: string, cardId: string, learning: boolean) => Promise<void>;
  getDeckProgress: (deckId: string, cards: Card[]) => number;
  getLastAttempt: (deckId: string) => string | null;
  getLastCorrect: (deckId: string) => string | null;
  countByStatus: (deckId: string, status: ProgressStatus) => number;
  loadProgress: () => Promise<void>;
  startSession: (deckId: string, totalCards: number) => void;
  endSession: () => Promise<void>;
  getSessionsByDeck: (deckId: string) => StudySession[];
  resetAll: () => Promise<void>;
  resetMemoryOnly: () => void;
}

const BASE_STORAGE_KEY = 'flashcard_progress';

function getUserScopedKey(): string {
  const user = useAuth.getState().currentUser || 'guest';
  return `${BASE_STORAGE_KEY}:user:${user}`;
}

export const useProgress = create<ProgressState>((set, get) => ({
  progress: {},
  sessions: [],
  currentSession: null,

  setMastered: async (deckId: string, cardId: string, mastered: boolean) => {
    // Create a completely new state object to ensure React sees the change
    const newProgress = { ...get().progress };

    // Initialize deck progress if it doesn't exist
    if (!newProgress[deckId]) {
      newProgress[deckId] = {};
    }

    // Create new card progress
    const newStatus: ProgressStatus = mastered ? 'mastered' : 'new';
    newProgress[deckId] = {
      ...newProgress[deckId],
      [cardId]: {
        status: newStatus,
        lastCorrect: mastered ? new Date().toISOString() : undefined,
        lastAttempt: new Date().toISOString()
      }
    };

    logger('[setMastered] Before update:', {
      deckId,
      cardId,
      mastered,
      currentDeckProgress: newProgress[deckId],
      newStatus
    });

    set({ progress: newProgress });

    // Save both progress and sessions
    const data = JSON.stringify({
      progress: newProgress,
      sessions: get().sessions
    });
    await SecureStore.setItemAsync(getUserScopedKey(), data);

    logger('[setMastered] After update:', {
      deckId,
      cardId,
      storedProgress: get().progress[deckId]?.[cardId],
      allProgress: get().progress
    });
  },

  setLearning: async (deckId: string, cardId: string, learning: boolean) => {
    // Create a completely new state object to ensure React sees the change
    const newProgress = { ...get().progress };

    // Initialize deck progress if it doesn't exist
    if (!newProgress[deckId]) {
      newProgress[deckId] = {};
    }

    // Create new card progress
    const newStatus: ProgressStatus = learning ? 'learning' : 'new';
    newProgress[deckId] = {
      ...newProgress[deckId],
      [cardId]: {
        status: newStatus,
        lastAttempt: new Date().toISOString()
      }
    };

    set({ progress: newProgress });

    // Save both progress and sessions
    const data = JSON.stringify({
      progress: newProgress,
      sessions: get().sessions
    });
    await SecureStore.setItemAsync(getUserScopedKey(), data);
  },

  getDeckProgress: (deckId: string, cards: Card[]) => {
    const deckProgress = get().progress[deckId] || {};
    logger('[getDeckProgress]', {
      deckId,
      deckProgress,
      totalCards: cards.length,
      cardStatuses: cards.map(card => ({
        cardId: card.id,
        status: deckProgress[card.id]?.status
      }))
    });

    // Count cards explicitly marked as mastered
    return cards.reduce((count, card) => {
      const status = deckProgress[card.id]?.status;
      return status === 'mastered' ? count + 1 : count;
    }, 0);
  },

  loadProgress: async () => {
    const stored = await SecureStore.getItemAsync(getUserScopedKey());
    logger('[loadProgress] Stored data:', stored);
    if (stored) {
      const { progress, sessions } = JSON.parse(stored);
      logger('[loadProgress] Parsed data:', { progress, sessions });
      // Migrate legacy un-namespaced deckIds to 'dz:' once
      let nextProgress = progress;
      if (progress && typeof progress === 'object') {
        const keys = Object.keys(progress);
        const hasPrefixed = keys.some(k => k.includes(':'));
        if (!hasPrefixed) {
          const migrated: Record<string, any> = {};
          keys.forEach(k => {
            migrated[`dz:${k}`] = progress[k];
          });
          nextProgress = migrated;
          logger('[loadProgress] Migrated legacy progress keys to dz:* namespace');
        }
      }
      set({ progress: nextProgress || {}, sessions: sessions || [] });
    }
  },

  startSession: (deckId: string, totalCards: number) => {
    const session: StudySession = {
      id: crypto.randomUUID(),
      deckId,
      startTime: new Date().toISOString(),
      endTime: '',
      totalCards,
      masteredCards: 0,
      learningCards: 0,
      timeSpentMs: 0
    };
    set({ currentSession: session });
  },

  endSession: async () => {
    const { currentSession, sessions } = get();
    if (currentSession) {
      const endTime = new Date().toISOString();
      const timeSpentMs = new Date(endTime).getTime() - new Date(currentSession.startTime).getTime();
      const completedSession = {
        ...currentSession,
        endTime,
        timeSpentMs,
        masteredCards: get().countByStatus(currentSession.deckId, 'mastered'),
        learningCards: get().countByStatus(currentSession.deckId, 'learning')
      };

      const newSessions = [...sessions, completedSession];
      set({ sessions: newSessions, currentSession: null });

      // Persist to storage
      const data = JSON.stringify({ progress: get().progress, sessions: newSessions });
      await SecureStore.setItemAsync(getUserScopedKey(), data);
    }
  },

  getSessionsByDeck: (deckId: string) => {
    return get().sessions.filter(session => session.deckId === deckId);
  },

  getLastAttempt: (deckId: string) => {
    const deckProgress = get().progress[deckId] || {};
    const attempts = Object.values(deckProgress)
      .map(p => p.lastAttempt)
      .filter(Boolean) as string[];
    return attempts.length ? attempts.reduce((max, a) => (a > max ? a : max), attempts[0]) : null;
  },

  getLastCorrect: (deckId: string) => {
    const deckProgress = get().progress[deckId] || {};
    const corrects = Object.values(deckProgress)
      .map(p => p.lastCorrect)
      .filter(Boolean) as string[];
    return corrects.length ? corrects.reduce((max, a) => (a > max ? a : max), corrects[0]) : null;
  },

  countByStatus: (deckId: string, status: 'new' | 'learning' | 'mastered') => {
    const deckProgress = get().progress[deckId] || {};
    return Object.values(deckProgress).filter(p => p.status === status).length;
  },

  resetAll: async () => {
    set({ progress: {}, sessions: [], currentSession: null });
    await SecureStore.deleteItemAsync(getUserScopedKey());
  },

  resetMemoryOnly: () => {
    set({ progress: {}, sessions: [], currentSession: null });
  },
}));
