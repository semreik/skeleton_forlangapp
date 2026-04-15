import { create } from 'zustand';
import * as SecureStore from '../../lib/utils/secureStore';
import { useAuth } from './useAuth';

export type SavedSource = 'deck' | 'dictionary';

export interface SavedItem {
  id: string; // unique id
  prompt: string; // English prompt
  answer: string; // target language answer
  language: 'dz' | 'qu';
  explanation: string; // rich text explanation
  notes?: string;
  source: SavedSource;
  deckId?: string;
  cardId?: string;
  createdAt: string; // ISO
}

interface SavedState {
  items: SavedItem[];
  loadSaved: () => Promise<void>;
  saveItem: (item: Omit<SavedItem, 'id' | 'createdAt'>) => Promise<SavedItem>;
  removeItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  resetMemoryOnly: () => void;
}

const BASE_STORAGE_KEY = 'saved_items';
function getUserScopedKey(): string {
  const user = useAuth.getState().currentUser || 'guest';
  return `${BASE_STORAGE_KEY}:user:${user}`;
}

export const useSaved = create<SavedState>((set, get) => ({
  items: [],

  loadSaved: async () => {
    const stored = await SecureStore.getItemAsync(getUserScopedKey());
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedItem[];
        set({ items: parsed });
      } catch {
        // ignore corrupt
      }
    }
  },

  saveItem: async (item) => {
    const id = Math.random().toString(36).slice(2);
    const createdAt = new Date().toISOString();
    const newItem: SavedItem = { id, createdAt, ...item };
    const next = [...get().items, newItem];
    set({ items: next });
    const payload = JSON.stringify(next);
    await SecureStore.setItemAsync(getUserScopedKey(), payload);
    return newItem;
  },

  removeItem: async (id: string) => {
    const next = get().items.filter(i => i.id !== id);
    set({ items: next });
    const payload = JSON.stringify(next);
    await SecureStore.setItemAsync(getUserScopedKey(), payload);
  },

  clearAll: async () => {
    set({ items: [] });
    await SecureStore.deleteItemAsync(getUserScopedKey());
  },

  resetMemoryOnly: () => {
    set({ items: [] });
  },
}));


