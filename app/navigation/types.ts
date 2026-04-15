import type { Card } from '../types/deck';

export type RootStackParamList = {
  Decks: undefined;
  Study: {
    deckId: string;
    cards: Card[];
    deckTitle: string;
  };
  Write: {
    deckId: string;
    cards: Card[];
    deckTitle: string;
  };
  NumbersWrite: {
    deckId: string;
    cards: Card[];
    deckTitle: string;
  };
  Congrats: {
    deckTitle: string;
    totalCards: number;
    masteredCards: number;
  };
  Stats: undefined;
  ConversationCategories: undefined;
  ConversationList: {
    categoryId: string;
    title: string;
  };
  ConversationPractice: {
    categoryId: string;
    conversationId: string;
    title: string;
  };
  Onboarding: undefined;
};
