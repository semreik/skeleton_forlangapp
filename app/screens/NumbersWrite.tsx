import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../navigation/types';
import type { Card } from '../types/deck';
import { useProgress } from '../stores/useProgress';
import { useLanguage } from '../stores/useLanguage';
import AnimatedButton from '../components/AnimatedButton';
import { useInputFeedback } from '../hooks/useAnimations';
import { ProgressBar } from '../components/ProgressBar';

type NumbersWriteScreenRouteProp = RouteProp<RootStackParamList, 'NumbersWrite'>;
type NumbersWriteScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NumbersWrite: React.FC = () => {
  const route = useRoute<NumbersWriteScreenRouteProp>();
  const navigation = useNavigation<NumbersWriteScreenNavigationProp>();
  const { deckId, cards } = route.params;
  const { selectedLanguage } = useLanguage();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const { setMastered, setLearning, startSession, endSession } = useProgress();
  const currentCard = cards[currentCardIndex];

  // Shared input feedback animations
  const { inputAnimatedStyle, resultAnimatedStyle, showCorrect, showIncorrect, reset: resetFeedback } = useInputFeedback();
  const numberScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  React.useEffect(() => {
    startSession(deckId, cards.length);
    return () => {
      endSession();
    };
  }, [deckId, cards.length, startSession, endSession]);

  const checkAnswer = () => {
    const isAnswerCorrect = userInput.toLowerCase().trim() === currentCard.back.toLowerCase().trim();
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    if (isAnswerCorrect) {
      showCorrect();
      numberScale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 15, stiffness: 150, reduceMotion: ReduceMotion.System })
      );
      setMastered(deckId, currentCard.id, true);
    } else {
      showIncorrect();
      setLearning(deckId, currentCard.id, true);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      // Animate transition
      cardOpacity.value = withTiming(0, { duration: 150, reduceMotion: ReduceMotion.System }, () => {
        numberScale.value = 1;
        cardOpacity.value = withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System });
      });
      resetFeedback();

      setCurrentCardIndex(prev => prev + 1);
      setUserInput('');
      setShowResult(false);
      setShowAnswer(false);
    } else {
      endSession();
      Alert.alert(
        "Congratulations!",
        "You've completed the numbers deck!",
        [{ text: "OK", onPress: () => navigation.navigate('DeckList') }]
      );
    }
  };

  const handleShowAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAnswer(true);
  };

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const progress = (currentCardIndex + 1) / cards.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Card {currentCardIndex + 1} of {cards.length}
        </Text>
        <ProgressBar progress={progress} />
      </View>

      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <Text style={styles.prompt}>
          {selectedLanguage === 'qu' ? 'Write the Quechua word for:' : 'Write the Dzardzongke word for:'}
        </Text>
        <Animated.Text style={[styles.number, numberAnimatedStyle]}>
          {currentCard.front}
        </Animated.Text>

        <Animated.View style={[styles.inputWrapper, inputAnimatedStyle]}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your answer here..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!showResult}
            onSubmitEditing={checkAnswer}
          />
        </Animated.View>

        {!showResult ? (
          <View style={styles.buttonRow}>
            <AnimatedButton
              style={[styles.button, styles.checkButton]}
              onPress={checkAnswer}
              hapticFeedback="medium"
            >
              <Text style={styles.buttonText}>Check</Text>
            </AnimatedButton>

            <AnimatedButton
              style={[styles.button, styles.showAnswerButton]}
              onPress={handleShowAnswer}
              hapticFeedback="light"
            >
              <Text style={[styles.buttonText, styles.showAnswerText]}>Show Answer</Text>
            </AnimatedButton>
          </View>
        ) : (
          <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
            {isCorrect ? (
              <Text style={[styles.resultText, styles.correctText]}>
                You got it!
              </Text>
            ) : (
              <Text style={[styles.resultText, styles.incorrectText]}>
                Try again! The correct answer is: <Text style={styles.answer}>{currentCard.back}</Text>
              </Text>
            )}

            <AnimatedButton
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
              hapticFeedback="medium"
            >
              <Text style={styles.buttonText}>
                {currentCardIndex < cards.length - 1 ? 'Next Number' : 'Finish'}
              </Text>
            </AnimatedButton>
          </Animated.View>
        )}

        {showAnswer && !showResult && (
          <Animated.View
            entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
            style={styles.answerContainer}
          >
            <Text style={styles.answerLabel}>Answer:</Text>
            <Text style={styles.answer}>{currentCard.back}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 16,
    marginLeft: 24,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
  },
  prompt: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  number: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1f2937',
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    padding: 16,
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  showAnswerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    marginTop: 16,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showAnswerText: {
    color: '#007AFF',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#FF3B30',
  },
  answerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  answer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default NumbersWrite;
