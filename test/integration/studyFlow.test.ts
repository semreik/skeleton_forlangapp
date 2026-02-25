import { useProgress } from '../../app/stores/useProgress';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

describe('Study Flow', () => {
  beforeEach(() => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  it('updates progress when marking cards as mastered', async () => {
    const store = useProgress.getState();
    const deckId = 'animals-basic';
    const cardId = 'animal-1';
    
    // Mark a card as mastered
    await store.setMastered(deckId, cardId, true);
    
    // Verify the card is marked as mastered
    const masteredCount = store.countByStatus(deckId, 'mastered');
    expect(masteredCount).toBe(1);
    
    // Verify progress calculation
    const progress = store.getDeckProgress(deckId, [{ id: cardId, front: 'རི་བོང', back: 'Rabbit' }]);
    expect(progress).toBe(1);
    
    // Verify SecureStore was called
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'flashcard_progress',
      expect.any(String)
    );
  });
});
