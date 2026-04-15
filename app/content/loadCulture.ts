// Auto-loads culture decks using require.context
// New JSON files added to assets/culture/{lang}/ folders are automatically included

import { getCultureDecksByLanguage, type CultureDeck } from '../../assets/culture';

export type { CultureDeck };

export const loadCulture = (language: string): CultureDeck[] => {
  return getCultureDecksByLanguage(language);
};
