import { useProgress } from '../../app/stores/useProgress';
import animalsDeck from '../../assets/decks/animals-basic.json';

describe('Progress Flow', () => {
  it('updates mastered count when all cards are marked mastered', async () => {
  const store = useProgress.getState();
  await store.loadProgress();

  for (const card of animalsDeck.cards) {
      await store.setMastered(animalsDeck.id, card.id, true);
    }

  const progress = useProgress.getState().progress[animalsDeck.id];
    expect(Object.values(progress).every(p => p.status === 'mastered')).toBe(true);
  });
});
