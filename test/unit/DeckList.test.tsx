import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import { DeckList } from '../../app/screens/DeckList';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock progress store
jest.mock('../../app/stores/useProgress', () => ({
  useProgress: () => (deckId: string, cards: any[]) => 0,
}));

describe('DeckList', () => {
  it('displays all decks', () => {
    render(
      <NavigationContainer>
        <DeckList />
      </NavigationContainer>
    );
    
    // Check all deck titles are displayed (current assets)
    expect(screen.getByText('Basic Animals')).toBeTruthy();
    expect(screen.getByText('Basic Colors')).toBeTruthy();
    expect(screen.getByText('Numbers (1-10)')).toBeTruthy();
  });
});
