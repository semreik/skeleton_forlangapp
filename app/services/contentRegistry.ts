import type { Deck } from '../types/deck';

import { dzConversations, quConversations, type ConversationsData } from '../../assets/conversations';
import { dzCultureDecks, quCultureDecks, type CultureDeck } from '../../assets/culture';
import { dzDecks, quDecks } from '../../assets/decks';
import { dzDictionary, quDictionary, type DictionaryShape } from '../../assets/dictionary';

export type LanguageCode = 'dz' | 'qu';

export type { ConversationsData, DictionaryShape, CultureDeck };

type ContentBundle = {
  decks: Deck[];
  dictionary: DictionaryShape;
  conversations: ConversationsData;
  culture: CultureDeck[];
};

export const contentRegistry: Record<LanguageCode, ContentBundle> = {
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

export const nsDeckId = (lang: LanguageCode, deckId: string) => `${lang}:${deckId}`;

// Quiz image registry
// Map prompt strings (lowercased) to statically imported images.
// Add your images under assets/images (or a subfolder) and register them here.
const reactLogo = require('../../assets/images/react-logo.png');

const baseQuizImageMap: Record<string, any> = {
  // animals / common nouns
  dog: reactLogo,
  bird: reactLogo,
  fish: reactLogo,
  horse: reactLogo,
  cat: reactLogo,
  cow: reactLogo,
  yak: reactLogo,
  water: reactLogo,
  money: reactLogo,
  house: reactLogo,
  sun: reactLogo,
  moon: reactLogo,
  flask: reactLogo,
  // colours
  white: reactLogo,
  yellow: reactLogo,
  black: reactLogo,
  green: reactLogo,
  brown: reactLogo,
  blue: reactLogo,
  red: reactLogo,
  // numbers (if used as prompts)
  one: reactLogo,
  two: reactLogo,
  three: reactLogo,
  four: reactLogo,
  five: reactLogo,
  six: reactLogo,
  seven: reactLogo,
  eight: reactLogo,
  nine: reactLogo,
  ten: reactLogo,
};

const quizImageMap: Record<LanguageCode, { byPrompt: Record<string, any> }> = {
  dz: { byPrompt: baseQuizImageMap },
  qu: { byPrompt: baseQuizImageMap },
};

export function getQuizImageForPrompt(lang: LanguageCode, prompt?: string) {
  if (!prompt) return undefined;
  const key = String(prompt).toLowerCase().trim();
  return quizImageMap[lang]?.byPrompt[key];
}


