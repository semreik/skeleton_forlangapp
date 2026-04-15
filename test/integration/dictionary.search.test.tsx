import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Dictionary from '../../app/screens/Dictionary';

describe('Dictionary Screen', () => {
  it('searches for a word', async () => {
    const { getByPlaceholderText, getAllByText, queryAllByText, getByText } = render(
      <NavigationContainer>
        <Dictionary />
      </NavigationContainer>
    );
    const input = getByPlaceholderText('Search in target language or English...');
    fireEvent.changeText(input, 'money');
    await waitFor(() => expect(getAllByText(/money/i).length).toBeGreaterThan(0));
    fireEvent.changeText(input, '');
    await waitFor(() => expect(queryAllByText(/money/i).length).toBe(0));
    expect(getByText('Dictionary')).toBeTruthy();
  });
});
