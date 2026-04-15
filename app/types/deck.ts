export interface Card {
  id: string;
  front: string;
  back: string;
  hasAudio?: boolean;
  image?: string;
  notes?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
}
