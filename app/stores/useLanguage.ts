import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type LanguageCode = 'dz' | 'qu';

interface LanguageState {
  selectedLanguage: LanguageCode;
  hasChosenLanguage: boolean;
  loadLanguage: () => Promise<void>;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  resetLanguageChoice: () => Promise<void>;
}

const STORAGE_KEY = 'app_language';

export const useLanguage = create<LanguageState>((set, get) => ({
  selectedLanguage: 'dz',
  hasChosenLanguage: false,

  loadLanguage: async () => {
    let stored: string | null;
    if (Platform.OS === 'web') {
      stored = localStorage.getItem(STORAGE_KEY);
    } else {
      stored = await SecureStore.getItemAsync(STORAGE_KEY);
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { selectedLanguage?: LanguageCode; hasChosenLanguage?: boolean };
        set({
          selectedLanguage: parsed.selectedLanguage ?? 'dz',
          hasChosenLanguage: !!parsed.hasChosenLanguage,
        });
      } catch {
        // ignore corrupt storage, keep defaults
      }
    }
  },

  setLanguage: async (lang: LanguageCode) => {
    set({ selectedLanguage: lang, hasChosenLanguage: true });
    const data = JSON.stringify({ selectedLanguage: lang, hasChosenLanguage: true });
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, data);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEY, data);
    }
  },

  resetLanguageChoice: async () => {
    set({ hasChosenLanguage: false });
    if (Platform.OS === 'web') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  },
}));


