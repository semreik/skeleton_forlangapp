// Auto-import all deck files dynamically
// Any JSON file in this folder will be automatically loaded

import type { Deck } from '../../app/types/deck';

// Use require.context to dynamically load all JSON files
const deckContext = require.context('./', false, /\.json$/);

// Get all deck files and filter/categorize them
const allDecks = deckContext.keys()
  .filter(key => !key.includes('schema')) // Exclude schema files
  .map(key => deckContext(key) as Deck);

// Separate decks by language prefix
export const dzDecks: Deck[] = allDecks.filter(
  deck => !deck.id.startsWith('qu-')
);

export const quDecks: Deck[] = allDecks.filter(
  deck => deck.id.startsWith('qu-')
);
