import React, { useState, useEffect, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  ReduceMotion,
} from 'react-native-reanimated';
import { useProgress } from '../stores/useProgress';
import AnimatedButton from '../components/AnimatedButton';
import { useInputFeedback } from '../hooks/useAnimations';
import { ProgressBar } from '../components/ProgressBar';
import type { Card } from '../types/deck';

type RootStackParamList = {
  Write: { deckId: string; cards: Card[] };
};

interface Props {
  navigation: any;
  route: any;
}

export const Write: React.FC<Props> = ({ navigation, route }) => {
  const { deckId, cards } = route.params;
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const { setMastered } = useProgress();

  // Shared input feedback animations
  const { inputAnimatedStyle, resultAnimatedStyle, showCorrect, showIncorrect, reset: resetFeedback } = useInputFeedback();
  const cardOpacity = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);

  const currentCard = cards[currentCardIndex];

  // Convert PNG filename to clean text for comparison
  const getCleanText = (text: string) => {
    if (text.endsWith('.png')) {
      // Remove .png and convert kebab-case to Title Case
      return text
        .replace('.png', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return text;
  };

  const cleanBackText = useMemo(() => getCleanText(currentCard.back), [currentCard.back]);
  const isCorrect = userInput.toLowerCase().trim() === cleanBackText.toLowerCase().trim();

  const handleCheck = () => {
    setShowResult(true);

    if (isCorrect) {
      showCorrect();
      setMastered(deckId, currentCard.id, true);
    } else {
      showIncorrect();
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      // Animate card out
      cardOpacity.value = withTiming(0, { duration: 150, reduceMotion: ReduceMotion.System }, () => {
        cardTranslateX.value = 0;
        cardOpacity.value = withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System });
      });
      resetFeedback();

      setCurrentCardIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
    } else {
      navigation.goBack();
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  const progress = (currentCardIndex + 1) / cards.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.progressText}>Card {currentCardIndex + 1} of {cards.length}</Text>
          <ProgressBar progress={progress} showMilestones={false} />
        </View>

        <Animated.View style={[styles.cardContent, cardAnimatedStyle]}>
          <Text style={styles.front}>{currentCard.front}</Text>

          <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type the Dzardzongke word..."
              placeholderTextColor="#999"
              onSubmitEditing={handleCheck}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              editable={!showResult}
            />
          </Animated.View>

          {!showResult ? (
            <AnimatedButton
              style={styles.button}
              onPress={handleCheck}
              hapticFeedback="medium"
            >
              <Text style={styles.buttonText}>Check</Text>
            </AnimatedButton>
          ) : (
            <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
              <Text style={[styles.result, isCorrect ? styles.correct : styles.incorrect]}>
                {isCorrect ? '✓ Correct!' : `✗ Incorrect. The answer is: ${cleanBackText}`}
              </Text>
              <AnimatedButton
                style={styles.button}
                onPress={handleNext}
                hapticFeedback="medium"
              >
                <Text style={styles.buttonText}>
                  {currentCardIndex < cards.length - 1 ? 'Next' : 'Finish'}
                </Text>
              </AnimatedButton>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    marginLeft: 24,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  front: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#1f2937',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    padding: 16,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '100%',
    gap: 16,
  },
  result: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  correct: {
    color: '#34C759',
  },
  incorrect: {
    color: '#FF3B30',
  },
});
