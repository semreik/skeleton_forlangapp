import { Platform } from 'react-native';
import { create } from 'zustand';
import { deriveKey, fromHex, makeSalt, toHex } from '../auth/authCrypto';
import { createUser, getUser } from '../db/authRepo';
// Route-safe import: use lib/ for platform files to avoid expo-router scanning app/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SecureStore = Platform.OS === 'web' ? require('../../lib/utils/secureStore.web') : require('../../lib/utils/secureStore.native');

type AuthState = {
  currentUser: string | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  signup: (username: string, password: string, confirm: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserStores: () => Promise<void>;
};

const CURRENT_USER_KEY = 'auth.currentUser';

export const useAuth = create<AuthState>((set) => ({
  currentUser: null,
  loading: false,

  hydrate: async () => {
    const u = await SecureStore.getItemAsync(CURRENT_USER_KEY);
    if (u) {
      // Verify the user record still exists in DB (handles DB reset / app data clear)
      const exists = await getUser(u);
      if (exists) {
        set({ currentUser: u });
      } else {
        // Stale session — user record gone, clear it
        await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
        set({ currentUser: null });
      }
    } else {
      set({ currentUser: null });
    }
  },

  loadUserStores: async () => {
    const { useSaved } = require('./useSaved');
    const { useProgress } = require('./useProgress');
    useSaved.getState().resetMemoryOnly();
    useProgress.getState().resetMemoryOnly();
    await Promise.all([
      useSaved.getState().loadSaved(),
      useProgress.getState().loadProgress(),
    ]);
  },

  signup: async (username, password, confirm) => {
    username = username.trim();
    if (!username) throw new Error('Username is required');
    if (!password) throw new Error('Password is required');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (password !== confirm) throw new Error('Passwords must match');
    set({ loading: true });
    try {
      const exists = await getUser(username);
      if (exists) throw new Error('Username already exists');
      const salt = makeSalt(16);
      const derived = await deriveKey(password, salt);
      await createUser({
        username,
        password_hash: toHex(derived),
        salt: toHex(salt),
        iters: 120_000,
        created_at: Date.now(),
      });
      // 1. Persist session
      await SecureStore.setItemAsync(CURRENT_USER_KEY, username);
      // 2. Set state BEFORE loading stores so getUserScopedKey() reads correct user
      set({ currentUser: username });
      // 3. Load user-scoped stores (now reads correct key)
      const { useSaved } = require('./useSaved');
      const { useProgress } = require('./useProgress');
      useSaved.getState().resetMemoryOnly();
      useProgress.getState().resetMemoryOnly();
      await Promise.all([
        useSaved.getState().loadSaved(),
        useProgress.getState().loadProgress(),
      ]);
    } finally {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    username = username.trim();
    set({ loading: true });
    try {
      const u = await getUser(username);
      if (!u) throw new Error('User not found');
      const derived = await deriveKey(password, fromHex(u.salt), u.iters);
      if (toHex(derived) !== u.password_hash) throw new Error('Invalid credentials');
      // 1. Persist session
      await SecureStore.setItemAsync(CURRENT_USER_KEY, username);
      // 2. Set state BEFORE loading stores so getUserScopedKey() reads correct user
      set({ currentUser: username });
      // 3. Load user-scoped stores (now reads correct key)
      const { useSaved } = require('./useSaved');
      const { useProgress } = require('./useProgress');
      useSaved.getState().resetMemoryOnly();
      useProgress.getState().resetMemoryOnly();
      await Promise.all([
        useSaved.getState().loadSaved(),
        useProgress.getState().loadProgress(),
      ]);
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    // 1. Clear persisted session
    await SecureStore.deleteItemAsync(CURRENT_USER_KEY);
    // 2. Clear in-memory caches only (don't delete persisted user data)
    const { useProgress } = require('./useProgress');
    const { useSaved } = require('./useSaved');
    useProgress.getState().resetMemoryOnly();
    useSaved.getState().resetMemoryOnly();
    // 3. Clear auth state
    set({ currentUser: null });
  },
}));
