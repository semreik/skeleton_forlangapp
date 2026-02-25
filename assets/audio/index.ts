// Auto-import all audio files dynamically using require.context
// Audio files are automatically discovered at build time - no manual registration needed

type AudioSource = number; // React Native asset type

// ============================================================================
// AUDIO CONTEXTS - Load all audio files recursively
// ============================================================================

// Load all audio files from conversations folder
const conversationsContext = require.context('./conversations', true, /\.(wav|mp3|m4a|aac)$/);

// Load all audio files from dictionary_words folder
const dictionaryContext = require.context('./dictionary_words', true, /\.(wav|mp3|m4a|aac)$/);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert a require.context key to a flat audio key
 * Example: "./birthday/from_1_A.wav" -> "conversations_birthday_from_1_A"
 */
function keyFromPath(prefix: string, contextKey: string): string {
  return (
    prefix +
    '_' +
    contextKey
      .replace('./', '')
      .replace(/\.(wav|mp3|m4a|aac)$/, '')
      .replace(/\//g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  );
}

/**
 * Extract dictionary word key from filename
 * Example: "ang-also_even.wav" -> "ang"
 */
function dictionaryKeyFromPath(contextKey: string): string {
  const filename = contextKey.replace('./', '').replace(/\.(wav|mp3|m4a|aac)$/, '');
  return filename.split('-')[0];
}

/**
 * Normalize a Dzongkha key for dictionary lookup
 */
export function normalizeDzKey(input: string): string {
  const lower = input.toLowerCase();
  const stripped = lower.normalize('NFD').replace(/\p{M}+/gu, '');
  return stripped.replace(/\s+/g, '_');
}

// ============================================================================
// FLAT AUDIO MAP (for backward compatibility)
// ============================================================================

const audioMap: Record<string, AudioSource> = {};

// Add conversation audio to flat map
conversationsContext.keys().forEach((key) => {
  const audioKey = keyFromPath('conversations', key);
  audioMap[audioKey] = conversationsContext(key);
});

// Add dictionary audio to flat map
dictionaryContext.keys().forEach((key) => {
  const audioKey = keyFromPath('dictionary_words', key);
  audioMap[audioKey] = dictionaryContext(key);
});

// ============================================================================
// DICTIONARY AUDIO MAP (keyed by word)
// ============================================================================

/**
 * Dictionary audio files should be named to match the word:
 *
 * Simple format (recommended):
 *   assets/audio/dictionary_words/{word}.wav
 *   Example: hello.wav -> matches entry { dz: "hello" }
 *
 * With hint format (legacy):
 *   assets/audio/dictionary_words/{word}-{hint}.wav
 *   Example: hello-greeting.wav -> matches entry { dz: "hello" }
 *
 * The lookup tries multiple formats:
 *   1. Exact match: "hello" -> hello.wav
 *   2. Normalized match: "Hello" -> hello.wav
 *   3. Legacy format: "hello" -> hello-*.wav (first part before hyphen)
 */
const dictionaryAudioMap: Record<string, AudioSource> = {};

dictionaryContext.keys().forEach((key) => {
  // Remove leading ./ and extension
  // Example: "./hello.wav" -> "hello" or "./hello-greeting.wav" -> "hello-greeting"
  const filename = key.replace('./', '').replace(/\.(wav|mp3|m4a|aac)$/, '');

  // Handle nested folders: "./subfolder/word.wav" -> "word"
  const parts = filename.split('/');
  const basename = parts[parts.length - 1];

  // Register with multiple keys for flexible matching:

  // 1. Full filename (without extension)
  dictionaryAudioMap[basename] = dictionaryContext(key);

  // 2. Lowercase version
  dictionaryAudioMap[basename.toLowerCase()] = dictionaryContext(key);

  // 3. If filename has hyphen, also register the part before hyphen (legacy format)
  // Example: "hello-greeting" -> also register as "hello"
  if (basename.includes('-')) {
    const wordPart = basename.split('-')[0];
    dictionaryAudioMap[wordPart] = dictionaryContext(key);
    dictionaryAudioMap[wordPart.toLowerCase()] = dictionaryContext(key);
  }
});

// ============================================================================
// DICTIONARY AUDIO LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get audio source for a dictionary word
 *
 * @param word - The word to look up (e.g., "hello", "water")
 * @returns Audio source if found, undefined otherwise
 *
 * Matching order:
 *   1. Exact match
 *   2. Lowercase match
 *   3. Normalized match (no diacritics, underscores for spaces)
 */
export function getDictionaryAudio(word: string): AudioSource | undefined {
  if (!word) return undefined;

  // 1. Try exact match
  if (dictionaryAudioMap[word]) {
    return dictionaryAudioMap[word];
  }

  // 2. Try lowercase
  const lower = word.toLowerCase();
  if (dictionaryAudioMap[lower]) {
    return dictionaryAudioMap[lower];
  }

  // 3. Try normalized (no diacritics, spaces -> underscores)
  const normalized = normalizeDzKey(word);
  if (dictionaryAudioMap[normalized]) {
    return dictionaryAudioMap[normalized];
  }

  return undefined;
}

/**
 * Check if audio exists for a dictionary word
 */
export function hasDictionaryAudio(word: string): boolean {
  return getDictionaryAudio(word) !== undefined;
}

/**
 * Get all registered dictionary audio keys (for debugging)
 */
export function getDictionaryAudioKeys(): string[] {
  return Object.keys(dictionaryAudioMap);
}

// ============================================================================
// CONVERSATION AUDIO REGISTRY
// ============================================================================

/**
 * Structure: conversationAudioRegistry[conversationId][exchangeKey] = AudioSource[]
 *
 * Audio files should be named: {conversationId}_{number}_{speaker}.wav
 * Located in: assets/audio/conversations/{conversationId}/
 *
 * Example for conversation "hey":
 *   assets/audio/conversations/hey/hey_1_A.wav
 *   assets/audio/conversations/hey/hey_2_B.wav
 *
 * Multi-part audio (multiple files for same exchange):
 *   hey_1_A.wav, hey_2_A.wav -> both play for exchange 1, speaker A
 */
type ConversationAudioRegistry = Record<string, Record<string, AudioSource[]>>;

const conversationAudioRegistry: ConversationAudioRegistry = {};

// Build the conversation audio registry
conversationsContext.keys().forEach((key) => {
  // Remove leading ./ and extension
  // Example: "./hey/hey_1_A.wav" -> "hey/hey_1_A"
  const path = key.replace('./', '').replace(/\.(wav|mp3|m4a|aac)$/, '');
  const parts = path.split('/');

  if (parts.length < 2) return;

  // Folder name is the conversation ID
  const conversationId = parts[0];

  // Filename: {prefix}_{number}_{speaker} or {prefix}_{number}_{speaker}_edited
  const filename = parts[parts.length - 1];

  // Remove _edited suffix if present
  const cleanFilename = filename.replace(/_edited$/, '');

  // Parse: prefix_N_S (e.g., hey_1_A, oyle_2_B)
  const match = cleanFilename.match(/^(.+?)_(\d+)_([AB])$/);
  if (!match) return;

  const exchangeNumber = parseInt(match[2], 10);
  const speaker = match[3];
  const exchangeKey = `${exchangeNumber}_${speaker}`;

  // Initialize registry for this conversation
  if (!conversationAudioRegistry[conversationId]) {
    conversationAudioRegistry[conversationId] = {};
  }
  if (!conversationAudioRegistry[conversationId][exchangeKey]) {
    conversationAudioRegistry[conversationId][exchangeKey] = [];
  }

  // Add audio source
  conversationAudioRegistry[conversationId][exchangeKey].push(conversationsContext(key));
});

// ============================================================================
// CONVERSATION AUDIO LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get audio sources for a conversation exchange
 *
 * @param conversationId - The conversation ID (e.g., "hey", "oyle")
 * @param exchangeNumber - The exchange number (1-based)
 * @param speaker - The speaker ("A" or "B")
 * @returns Array of audio sources to play in sequence
 *
 * Example: getConversationAudio("hey", 1, "A")
 *   -> Returns audio for hey_1_A.wav (and hey_2_A.wav if multi-part)
 */
export function getConversationAudio(
  conversationId: string,
  exchangeNumber: number,
  speaker: string
): AudioSource[] {
  const exchangeKey = `${exchangeNumber}_${speaker}`;

  // Direct lookup by conversation ID
  const convData = conversationAudioRegistry[conversationId];
  if (convData && convData[exchangeKey]) {
    return convData[exchangeKey];
  }

  // Fallback: try flat audioMap with common patterns
  const flatKey = `conversations_${conversationId}_${conversationId}_${exchangeNumber}_${speaker}`;
  if (audioMap[flatKey]) {
    return [audioMap[flatKey]];
  }

  // Try with _edited suffix
  const editedKey = `${flatKey}_edited`;
  if (audioMap[editedKey]) {
    return [audioMap[editedKey]];
  }

  return [];
}

/**
 * Check if audio exists for a conversation exchange
 */
export function hasConversationAudio(
  conversationId: string,
  exchangeNumber: number,
  speaker: string
): boolean {
  return getConversationAudio(conversationId, exchangeNumber, speaker).length > 0;
}

/**
 * Get all available audio keys (for debugging)
 */
export function getAvailableAudioKeys(): string[] {
  return Object.keys(audioMap);
}

/**
 * Get conversation registry structure (for debugging)
 */
export function getConversationRegistry(): ConversationAudioRegistry {
  return conversationAudioRegistry;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { audioMap, dictionaryAudioMap, conversationAudioRegistry };
