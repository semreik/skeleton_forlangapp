/**
 * Unified Asset Registry
 *
 * This module provides a centralized entry point for all app assets
 * using Metro's require.context for automatic asset discovery.
 *
 * Supported asset types:
 * - Images: PNG, JPG, JPEG, GIF, WEBP from /assets/images/
 * - Audio: WAV, MP3, M4A, AAC from /assets/audio/
 * - JSON Data: Decks, Dictionary, Conversations, Culture from respective folders
 *
 * To add new assets, simply drop files into the appropriate folder.
 * No manual registration needed - Metro bundler handles it at build time.
 */

// ============================================================================
// IMAGE ASSETS
// ============================================================================
export {
  imageRegistry,
  animalsRegistry,
  cultureRegistry,
  allImages,
} from './images';

export type { ImageSourcePropType as ImageSource } from 'react-native';

// ============================================================================
// AUDIO ASSETS
// ============================================================================
export {
  audioMap,
  dictionaryAudioMap,
  normalizeDzKey,
  // Dictionary audio
  getDictionaryAudio,
  hasDictionaryAudio,
  getDictionaryAudioKeys,
  // Conversation audio
  conversationAudioRegistry,
  getConversationAudio,
  hasConversationAudio,
  // Debug helpers
  getAvailableAudioKeys,
  getConversationRegistry,
} from './audio';

// ============================================================================
// DECK ASSETS (Flashcards)
// ============================================================================
export {
  dzDecks,
  quDecks,
} from './decks';

// ============================================================================
// DICTIONARY ASSETS
// ============================================================================
export {
  dzDictionary,
  quDictionary,
  dictionaries,
  type DictionaryShape,
} from './dictionary';

// ============================================================================
// CONVERSATION ASSETS
// ============================================================================
export {
  dzConversations,
  quConversations,
  conversations,
  type ConversationsData,
  type ConversationCategory,
  type Conversation,
  type Exchange,
} from './conversations';

// ============================================================================
// CULTURE ASSETS
// ============================================================================
export {
  dzCultureDecks,
  quCultureDecks,
  cultureDecks,
  getCultureDecksByLanguage,
  type CultureDeck,
  type CultureStep,
  type CultureTextStep,
  type CultureImageStep,
  type CultureQuizSingleStep,
  type CultureQuizMultiStep,
  type CultureQuizOption,
} from './culture';

// ============================================================================
// UNIFIED ACCESS BY LANGUAGE
// ============================================================================
import { dzDecks, quDecks } from './decks';
import { dzDictionary, quDictionary, type DictionaryShape } from './dictionary';
import { dzConversations, quConversations, type ConversationsData } from './conversations';
import { dzCultureDecks, quCultureDecks, type CultureDeck } from './culture';
import { audioMap, dictionaryAudioMap } from './audio';
import { allImages } from './images';
import type { Deck } from '../app/types/deck';

export type LanguageCode = 'dz' | 'qu';

export interface LanguageAssets {
  decks: Deck[];
  dictionary: DictionaryShape;
  conversations: ConversationsData;
  culture: CultureDeck[];
}

/**
 * All content assets organized by language code
 */
export const assetsByLanguage: Record<LanguageCode, LanguageAssets> = {
  dz: {
    decks: dzDecks,
    dictionary: dzDictionary,
    conversations: dzConversations,
    culture: dzCultureDecks,
  },
  qu: {
    decks: quDecks,
    dictionary: quDictionary,
    conversations: quConversations,
    culture: quCultureDecks,
  },
};

/**
 * Get all assets for a specific language
 */
export function getAssetsByLanguage(lang: LanguageCode): LanguageAssets {
  return assetsByLanguage[lang];
}

/**
 * All media assets (images, audio)
 */
export const mediaAssets = {
  images: allImages,
  audio: audioMap,
  dictionaryAudio: dictionaryAudioMap,
};
