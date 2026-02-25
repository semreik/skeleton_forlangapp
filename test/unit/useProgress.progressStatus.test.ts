import { useProgress } from '../../app/stores/useProgress';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

describe('Progress Status Type Safety', () => {
  beforeEach(() => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  });

  it('correctly types card status as mastered', async () => {
    const { setMastered, setLearning } = useProgress.getState();
    await setMastered('animals-basic', 'a1', true);
    expect(useProgress.getState().progress['animals-basic']['a1'].status).toBe<'mastered'>('mastered');
  });

  it('correctly types card status as learning', async () => {
    const { setMastered, setLearning } = useProgress.getState();
    await setLearning('animals-basic', 'a1', true);
    expect(useProgress.getState().progress['animals-basic']['a1'].status).toBe<'learning'>('learning');
  });

  it('correctly types card status as new', async () => {
    const { setMastered, setLearning } = useProgress.getState();
    await setMastered('animals-basic', 'a1', false);
    expect(useProgress.getState().progress['animals-basic']['a1'].status).toBe<'new'>('new');
  });
});
