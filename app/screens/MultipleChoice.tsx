import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState, useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { contentRegistry, getQuizImageForPrompt } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import { useSaved } from '../stores/useSaved';
import AnimatedButton from '../components/AnimatedButton';
import { triggerShake } from '../hooks/useAnimations';
import type { Card, Deck } from '../types/deck';

type QuizOption = {
  text: string;
  isCorrect: boolean;
};

type QuizItem = { prompt: string; answer: string; notes?: string };

export const MultipleChoice: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const decks: Deck[] = contentRegistry[selectedLanguage].decks;
  const dictionary = contentRegistry[selectedLanguage].dictionary;

  // Heuristics to decide if a string is a good standalone prompt/answer
  const isSensibleText = (s?: string) => {
    if (!s) return false;
    const t = s.trim();
    if (!t) return false;
    if (/🎉|\!|\?|…/.test(t)) return false;
    if (t.endsWith('.png')) return false;
    if (t.length > 24) return false;
    return true;
  };

  const deckItems = useMemo<QuizItem[]>(() => {
    const items: QuizItem[] = [];
    decks.forEach(deck => {
      deck.cards.forEach((c: Card) => {
        if (
          typeof c.back === 'string' &&
          isSensibleText(c.back) &&
          typeof c.front === 'string' &&
          isSensibleText(c.front) &&
          !/celebration/i.test(c.id)
        ) {
          items.push({ prompt: String(c.front), answer: String(c.back), notes: c.notes });
        }
      });
    });
    return items;
  }, [decks]);

  const dictItems = useMemo<QuizItem[]>(() => {
    const items: QuizItem[] = [];
    const seen = new Set<string>();
    dictionary.entries.forEach((e: any) => {
      const en = e.en as string;
      const dz = e.dz as string;
      if (isSensibleText(en) && isSensibleText(dz)) {
        const key = `${en}=>${dz}`;
        if (!seen.has(key)) {
          items.push({ prompt: en, answer: dz });
          seen.add(key);
        }
      }
    });
    return items;
  }, [dictionary.entries]);

  const quizPool = useMemo<QuizItem[]>(() => {
    const combined = [...dictItems, ...deckItems];
    // dedupe by prompt=>answer
    const map = new Map<string, QuizItem>();
    combined.forEach(it => {
      const key = `${it.prompt}=>${it.answer}`;
      if (!map.has(key)) map.set(key, it);
    });
    const arr = Array.from(map.values());
    // shuffle
    return arr
      .map(a => [Math.random(), a] as const)
      .sort((a, b) => a[0] - b[0])
      .map(([, a]) => a);
  }, [dictItems, deckItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { saveItem, items, loadSaved } = useSaved();
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [questionKey, setQuestionKey] = useState(0);

  // Animation values for options
  const optionScales = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];
  const optionShakes = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];
  const checkmarkOpacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0.5);

  // Top-level animated styles for each option (Rules of Hooks compliant)
  const optionAnimatedStyles = [
    useAnimatedStyle(() => ({
      transform: [
        { scale: optionScales[0].value },
        { translateX: optionShakes[0].value },
      ],
    })),
    useAnimatedStyle(() => ({
      transform: [
        { scale: optionScales[1].value },
        { translateX: optionShakes[1].value },
      ],
    })),
    useAnimatedStyle(() => ({
      transform: [
        { scale: optionScales[2].value },
        { translateX: optionShakes[2].value },
      ],
    })),
    useAnimatedStyle(() => ({
      transform: [
        { scale: optionScales[3].value },
        { translateX: optionShakes[3].value },
      ],
    })),
  ];

  // Seed saved markers from persisted store
  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useEffect(() => {
    if (items) {
      const next = new Set<string>();
      items.forEach(i => next.add(`${i.prompt}=>${i.answer}`));
      setSavedKeys(next);
    }
  }, [items]);

  const currentItem = quizPool.length > 0 ? quizPool[currentIndex % quizPool.length] : null;
  const currentImage = currentItem ? getQuizImageForPrompt(selectedLanguage as any, currentItem.prompt) : undefined;

  const options: QuizOption[] = useMemo(() => {
    if (!currentItem) return [];
    const correct = currentItem.answer;
    // Pick 3 distractors
    const pool = quizPool
      .map(q => q.answer)
      .filter((v, idx, arr) => typeof v === 'string' && v.trim().length > 0 && v !== correct && arr.indexOf(v) === idx);

    // Shuffle helper
    const shuffle = <T,>(arr: T[]) => arr.map(a => [Math.random(), a] as const).sort((a, b) => a[0] - b[0]).map(([, a]) => a);

    const distractors = shuffle(pool).slice(0, 3);
    const combined = shuffle([correct, ...distractors]).map(text => ({ text, isCorrect: text === correct }));
    return combined;
  }, [currentItem, quizPool]);

  const handleSelect = (opt: QuizOption, index: number) => {
    if (showResult) return;
    setSelected(opt.text);
    setShowResult(true);

    if (opt.isCorrect) {
      // Success animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      optionScales[index].value = withSequence(
        withSpring(1.05, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 15, stiffness: 150, reduceMotion: ReduceMotion.System })
      );
      checkmarkOpacity.value = withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System });
      checkmarkScale.value = withSpring(1, { damping: 12, stiffness: 200, reduceMotion: ReduceMotion.System });
    } else {
      // Error animation - shake
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake(optionShakes[index]);
    }
  };

  const handleNext = () => {
    // Reset animations
    optionScales.forEach(scale => { scale.value = 1; });
    optionShakes.forEach(shake => { shake.value = 0; });
    checkmarkOpacity.value = 0;
    checkmarkScale.value = 0.5;

    setCurrentIndex(prev => prev + 1);
    setSelected(null);
    setShowResult(false);
    setQuestionKey(prev => prev + 1);
  };

  const handlePrev = () => {
    // Reset animations
    optionScales.forEach(scale => { scale.value = 1; });
    optionShakes.forEach(shake => { shake.value = 0; });
    checkmarkOpacity.value = 0;
    checkmarkScale.value = 0.5;

    setCurrentIndex(prev => (prev - 1 + quizPool.length) % quizPool.length);
    setSelected(null);
    setShowResult(false);
    setQuestionKey(prev => prev + 1);
  };

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
    transform: [{ scale: checkmarkScale.value }],
  }));

  if (!currentItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Multiple Choice</Text>
        <Text style={styles.placeholder}>No cards available for this language.</Text>
      </View>
    );
  }

  const isCorrect = options.find(o => o.text === selected)?.isCorrect === true;
  const targetLabel = selectedLanguage === 'qu' ? 'Quechua' : 'Dzardzongke';
  const currentKey = `${currentItem.prompt}=>${currentItem.answer}`;
  const isSaved = savedKeys.has(currentKey);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Multiple Choice</Text>

        <Animated.View
          key={questionKey}
          entering={SlideInRight.duration(300).reduceMotion(ReduceMotion.System)}
          style={styles.promptCard}
        >
          <View style={styles.promptHeader}>
            <MaterialCommunityIcons name="translate" size={16} color="#2563eb" />
            <Text style={styles.promptHeaderText}>English → {targetLabel}</Text>
          </View>
          <Text style={styles.bigPrompt}>{currentItem.prompt}</Text>
          {currentImage ? (
            <View style={styles.imageWrap}>
              <View style={styles.imageBox}>
                <MaterialCommunityIcons name="image" size={14} color="#6b7280" style={{ position: 'absolute', top: 6, right: 6 }} />
                <View style={{ flex: 1, borderRadius: 8 }}>
                  <Image source={currentImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                </View>
              </View>
              <Text style={styles.imageCaption}>Illustration</Text>
            </View>
          ) : null}
        </Animated.View>

        <View style={styles.optionsContainer}>
          {options.map((opt, index) => {
            const isSelected = selected === opt.text;
            const showCorrectStyle = showResult && opt.isCorrect;
            const showWrongStyle = showResult && isSelected && !opt.isCorrect;

            return (
              <Animated.View
                key={`${questionKey}-${opt.text}`}
                entering={FadeIn.delay(index * 50).duration(200).reduceMotion(ReduceMotion.System)}
                style={[optionAnimatedStyles[index]]}
              >
                <AnimatedButton
                  style={[
                    styles.optionBtn,
                    showCorrectStyle && styles.correctBtn,
                    showWrongStyle && styles.wrongBtn,
                  ]}
                  onPress={() => handleSelect(opt, index)}
                  disabled={showResult}
                  hapticFeedback="light"
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{opt.text}</Text>
                    {showCorrectStyle && (
                      <Animated.View style={[styles.checkmark, checkmarkAnimatedStyle]}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                      </Animated.View>
                    )}
                    {showWrongStyle && (
                      <MaterialCommunityIcons name="close-circle" size={24} color="#FF3B30" />
                    )}
                  </View>
                </AnimatedButton>
              </Animated.View>
            );
          })}
        </View>

        {showResult && (
          <Animated.View
            entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
            style={styles.feedbackContainer}
          >
            {isCorrect ? (
              <Text style={[styles.feedback, styles.correctText]}>Correct!</Text>
            ) : (
              <>
                <Text style={[styles.feedback, styles.wrongText]}>Not quite.</Text>
                <Text style={styles.explanationTitle}>Answer</Text>
                <Text style={styles.explanation}>{selectedLanguage === 'qu' ? 'Quechua' : 'Dzardzongke'}: {currentItem.answer}</Text>
                <Text style={styles.explanation}>English: {currentItem.prompt}</Text>
                {currentItem.notes && <Text style={styles.notes}>Notes: {currentItem.notes}</Text>}
              </>
            )}
            {isSaved ? (
              <Text style={styles.savedBadge}>Saved</Text>
            ) : (
              <AnimatedButton
                style={styles.saveBtn}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  await saveItem({
                    prompt: currentItem.prompt,
                    answer: currentItem.answer,
                    language: selectedLanguage as any,
                    explanation: `"${currentItem.answer}" means "${currentItem.prompt}". ${currentItem.notes ? `Notes: ${currentItem.notes}` : ''}`,
                    source: 'deck',
                  });
                  setSavedKeys(prev => new Set(prev).add(currentKey));
                }}
                hapticFeedback="light"
              >
                <Text style={styles.saveText}>Save to Profile</Text>
              </AnimatedButton>
            )}
            <View style={styles.navRow}>
              <AnimatedButton style={styles.prevBtn} onPress={handlePrev} hapticFeedback="light">
                <Text style={styles.prevText}>Previous</Text>
              </AnimatedButton>
              <AnimatedButton style={styles.nextBtn} onPress={handleNext} hapticFeedback="light">
                <Text style={styles.nextText}>Next</Text>
              </AnimatedButton>
            </View>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8, marginLeft: 24 },
  placeholder: { fontSize: 16, color: '#666' },
  promptCard: { backgroundColor: '#eef2ff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 12 },
  promptHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  promptHeaderText: { color: '#2563eb', fontWeight: '600' },
  bigPrompt: { fontSize: 24, fontWeight: '700', color: '#1e3a8a', textAlign: 'center', marginTop: 8 },
  imageWrap: { marginTop: 10, alignItems: 'center' },
  imageBox: { width: '100%', height: 160, backgroundColor: '#f1f5f9', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', position: 'relative' },
  imageCaption: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  optionsContainer: { gap: 10, marginTop: 8 },
  optionBtn: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  optionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { fontSize: 16, color: '#111827', flex: 1 },
  checkmark: { marginLeft: 8 },
  correctBtn: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  wrongBtn: { backgroundColor: '#FDECEC', borderColor: '#FF3B30' },
  feedbackContainer: { marginTop: 16, gap: 8 },
  feedback: { fontSize: 18 },
  correctText: { color: '#2e7d32', fontWeight: '600' },
  wrongText: { color: '#c62828', fontWeight: '600' },
  explanationTitle: { fontSize: 16, fontWeight: '600' },
  explanation: { fontSize: 16, color: '#374151' },
  notes: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  saveBtn: { alignSelf: 'flex-start', backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 4 },
  saveText: { color: 'white', fontWeight: '600', fontSize: 16 },
  savedBadge: { color: '#10b981', fontWeight: '700', marginTop: 8 },
  navRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  prevBtn: { backgroundColor: '#6b7280', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  prevText: { color: 'white', fontWeight: '600', fontSize: 16 },
  nextBtn: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  nextText: { color: 'white', fontWeight: '600', fontSize: 16 },
});

export default MultipleChoice;
