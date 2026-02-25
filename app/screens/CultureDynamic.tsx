import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import { cultureRegistry } from '../../assets/images';
import { loadCulture } from '../content/loadCulture';
import type {
  CultureDeck,
  CultureQuizMultiStep,
  CultureQuizSingleStep,
  CultureStep,
} from '../content/types';
import { useLanguage } from '../stores/useLanguage';

// Use require.context-based culture image registry
// Images are auto-loaded from assets/images/culture/ folder
const imageMap = cultureRegistry;

const CultureDynamic: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const contentDecks: CultureDeck[] = loadCulture(selectedLanguage);
  const uiDecks: CultureDeck[] = useMemo(
    () => [
      ...contentDecks,
      { id: 'map', title: 'Interactive Map', steps: [] as any },
    ],
    [contentDecks]
  );
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const storyMapUrl =
    'https://uploads.knightlab.com/storymapjs/dadb49b390f413e3dae57604e019397c/dzardzongke/index.html';

  // quiz state
  const [singleSelected, setSingleSelected] = useState<string | null>(null);
  const [singleChecked, setSingleChecked] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [multiChecked, setMultiChecked] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;
  const go = () => {
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // reset quiz state when step changes
    setSingleSelected(null);
    setSingleChecked(false);
    setMultiSelected(new Set());
    setMultiChecked(false);
  }, [activeDeckIndex, stepIndex]);

  if (selectedLanguage !== 'dz') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Culture</Text>
        <Text style={styles.meta}>
          This section is currently available for Dzardzongke only. Quechua
          coming soon.
        </Text>
      </View>
    );
  }

  const currentDeck = uiDecks[activeDeckIndex];
  const steps = currentDeck?.steps ?? [];
  const currentStep: CultureStep | undefined = steps[stepIndex];

  const isFirst = stepIndex === 0;
  const isLastInDeck = stepIndex === steps.length - 1;
  const isLastDeck = activeDeckIndex === uiDecks.length - 1;

  const nextLabel = useMemo(() => {
    if (!currentStep) return 'Next';
    if (currentStep.type === 'quiz-single' && !singleChecked)
      return 'Check answer';
    if (currentStep.type === 'quiz-multi' && !multiChecked)
      return 'Check answers';
    if (isLastDeck && isLastInDeck) return 'Finish';
    return 'Next';
  }, [currentStep, singleChecked, multiChecked, isLastDeck, isLastInDeck]);

  const handleNext = () => {
    if (!currentStep) return;
    if (currentStep.type === 'quiz-single' && !singleChecked) {
      setSingleChecked(true);
      return;
    }
    if (currentStep.type === 'quiz-multi' && !multiChecked) {
      setMultiChecked(true);
      return;
    }
    // advance
    if (!isLastInDeck) {
      setStepIndex(stepIndex + 1);
      go();
    } else if (!isLastDeck) {
      setActiveDeckIndex(activeDeckIndex + 1);
      setStepIndex(0);
      go();
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setStepIndex(stepIndex - 1);
      go();
    } else if (activeDeckIndex > 0) {
      const prevDeckIdx = activeDeckIndex - 1;
      setActiveDeckIndex(prevDeckIdx);
      setStepIndex((uiDecks[prevDeckIdx]?.steps.length ?? 1) - 1);
      go();
    }
  };

  const renderStep = (step: CultureStep | undefined) => {
    if (!step) return null;
    switch (step.type) {
      case 'text':
        return (
          <View style={styles.card}>
            {step.header ? (
              <Text style={styles.subtitle}>{step.header}</Text>
            ) : null}
            <Text style={styles.p}>{step.text}</Text>
          </View>
        );
      case 'image': {
        const src = imageMap[step.src];
        return (
          <View style={styles.card}>
            {src ? (
              <Image source={src} style={styles.photo} resizeMode="contain" />
            ) : (
              <View
                style={[
                  styles.photo,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f1f5f9',
                  },
                ]}
              >
                <Text style={{ color: '#64748b', textAlign: 'center' }}>
                  Missing image: {step.src}
                  {'\n'}Add it to assets/images/culture/ folder.
                </Text>
              </View>
            )}
            <Text style={styles.caption}>{step.caption}</Text>
          </View>
        );
      }
      case 'quiz-single': {
        const q = step as CultureQuizSingleStep;
        return (
          <View style={styles.card}>
            {q.header ? <Text style={styles.subtitle}>{q.header}</Text> : null}
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>{q.question}</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {q.options.map((opt) => {
                const isSelected = singleSelected === opt.label;
                const isCorrect = singleChecked && opt.correct;
                const isWrong = singleChecked && isSelected && !opt.correct;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.choice,
                      isSelected ? { borderColor: '#2563eb' } : undefined,
                      isCorrect
                        ? styles.correct
                        : isWrong
                          ? styles.wrong
                          : undefined,
                    ]}
                    onPress={() => {
                      if (!singleChecked) setSingleSelected(opt.label);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.choiceText}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      }
      case 'quiz-multi': {
        const q = step as CultureQuizMultiStep;
        return (
          <View style={styles.card}>
            {q.header ? <Text style={styles.subtitle}>{q.header}</Text> : null}
            <Text style={styles.quizTitle}>Quiz</Text>
            <Text style={styles.quizQ}>{q.question}</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {q.options.map((opt) => {
                const isSelected = multiSelected.has(opt.label);
                const isCorrect = multiChecked && opt.correct;
                const isWrong = multiChecked && isSelected && !opt.correct;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.choice,
                      isSelected ? { borderColor: '#2563eb' } : undefined,
                      isCorrect
                        ? styles.correct
                        : isWrong
                          ? styles.wrong
                          : undefined,
                    ]}
                    onPress={() => {
                      if (multiChecked) return;
                      const next = new Set(multiSelected);
                      if (next.has(opt.label)) next.delete(opt.label);
                      else next.add(opt.label);
                      setMultiSelected(next);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.choiceText}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      }
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        style={styles.title}
      >{`${activeDeckIndex + 1}. ${currentDeck?.title ?? 'Culture'}`}</Text>
      <View style={styles.segmentRow}>
        {uiDecks.map((d, idx) => (
          <TouchableOpacity
            key={d.id}
            style={[
              styles.segmentBtn,
              idx === activeDeckIndex ? styles.segmentActive : undefined,
            ]}
            onPress={() => {
              setActiveDeckIndex(idx);
              setStepIndex(0);
              go();
            }}
          >
            <Text
              style={[
                styles.segmentText,
                idx === activeDeckIndex ? styles.segmentTextActive : undefined,
              ]}
            >
              {d.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentDeck?.id === 'map' ? (
        <View style={styles.card}>
          {Platform.OS === 'web' ? (
            // @ts-ignore iframe is valid on web build
            <iframe
              src={storyMapUrl}
              style={{
                width: '100%',
                height: 420,
                border: 0,
                borderRadius: 12,
              }}
              allow="fullscreen"
            />
          ) : (
            <View style={{ height: 420, borderRadius: 12, overflow: 'hidden' }}>
              <WebView source={{ uri: storyMapUrl }} style={{ flex: 1 }} />
            </View>
          )}
          <Text style={styles.caption}>
            Interactive StoryMapJS — This is an online feature and requires an
            internet connection.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: `${((stepIndex + 1) / steps.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {stepIndex + 1} / {steps.length}
            </Text>
          </View>

          <Animated.View style={{ opacity: fade }}>
            {renderStep(currentStep)}
          </Animated.View>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[
                styles.navBtn,
                isFirst && activeDeckIndex === 0 ? styles.disabled : undefined,
              ]}
              disabled={isFirst && activeDeckIndex === 0}
              onPress={handleBack}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={18}
                color={isFirst && activeDeckIndex === 0 ? '#9ca3af' : '#0f172a'}
              />
              <Text
                style={[
                  styles.navText,
                  isFirst && activeDeckIndex === 0
                    ? styles.disabledText
                    : undefined,
                ]}
              >
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.primary]}
              onPress={handleNext}
            >
              <Text style={[styles.navText, { color: 'white' }]}>
                {nextLabel}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={'white'}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f7f7fb' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6, marginLeft: 24 },
  subtitle: { fontSize: 16, color: '#475569', marginBottom: 10 },
  meta: { fontSize: 14, color: '#64748b' },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  p: { color: '#1f2937', lineHeight: 22, marginBottom: 8 },
  photo: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    height: 220,
  },
  caption: { marginTop: 10, color: '#475569', fontStyle: 'italic' },
  quizTitle: { fontWeight: '700', marginBottom: 4 },
  quizQ: { color: '#374151' },
  choice: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  choiceText: { color: '#111827' },
  correct: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  wrong: { backgroundColor: '#FDECEC', borderColor: '#FF3B30' },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  navText: { fontWeight: '600', color: '#0f172a' },
  disabled: { opacity: 0.5 },
  disabledText: { color: '#9ca3af' },
  primary: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    marginLeft: 24,
    flexWrap: 'wrap',
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  segmentActive: { backgroundColor: '#eef2ff', borderColor: '#6366f1' },
  segmentText: { color: '#0f172a', fontWeight: '600' },
  segmentTextActive: { color: '#3730a3' },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
});

export default CultureDynamic;
