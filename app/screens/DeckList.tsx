import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  FadeInUp,
  ReduceMotion,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AnimatedButton from '../components/AnimatedButton';
import { contentRegistry, nsDeckId } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import { useProgress } from '../stores/useProgress';
import { haptics } from '../hooks/useAnimations';
import type { Deck } from '../types/deck';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Progress Ring ───────────────────────────────────────────────────────────

const RING_SIZE = 60;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ProgressRing = React.memo(({ progress }: { progress: number }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      reduceMotion: ReduceMotion.System,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset:
      RING_CIRCUMFERENCE - animatedProgress.value * RING_CIRCUMFERENCE,
  }));

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.ringContainer}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#e5e7eb"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="#6366f1"
          strokeWidth={RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          animatedProps={animatedProps}
          transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
        />
      </Svg>
      <Text style={styles.ringText}>{percentage}%</Text>
    </View>
  );
});

// ─── Deck Card ───────────────────────────────────────────────────────────────

const DeckCard = React.memo(
  ({
    deck,
    index,
    selectedLanguage,
  }: {
    deck: Deck;
    index: number;
    selectedLanguage: string;
  }) => {
    const navigation = useNavigation<StackNavigationProp<any>>();

    const namespacedId = nsDeckId(selectedLanguage as any, deck.id);
    const deckProgress = useProgress(state => state.progress[namespacedId]);
    const masteredCount = useMemo(() => {
      if (!deckProgress) return 0;
      return deck.cards.reduce((count, card) => {
        return deckProgress[card.id]?.status === 'mastered' ? count + 1 : count;
      }, 0);
    }, [deckProgress, deck.cards]);
    const progress =
      deck.cards.length > 0 ? masteredCount / deck.cards.length : 0;

    const handleStudy = useCallback(() => {
      haptics.medium();
      navigation.navigate('Study', {
        deckId: namespacedId,
        cards: deck.cards,
        deckTitle: deck.title,
      });
    }, [namespacedId, deck.cards, deck.title]);

    const handleWrite = useCallback(() => {
      haptics.light();
      navigation.navigate('Write', {
        deckId: namespacedId,
        cards: deck.cards,
        deckTitle: deck.title,
      });
    }, [namespacedId, deck.cards, deck.title]);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100)
          .springify()
          .reduceMotion(ReduceMotion.System)}
        style={styles.deckCard}
      >
        <View style={styles.deckCardContent}>
          {/* Left: Progress ring */}
          <ProgressRing progress={progress} />

          {/* Right: Info + actions */}
          <View style={styles.deckInfo}>
            <Text style={styles.deckTitle} numberOfLines={2}>
              {deck.title}
            </Text>
            <Text style={styles.deckDescription} numberOfLines={2}>
              {deck.description}
            </Text>

            {/* Card count + mastered badge row */}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {deck.cards.length} cards
                </Text>
              </View>
              <View style={[styles.badge, styles.masteredBadge]}>
                <Text style={[styles.badgeText, styles.masteredBadgeText]}>
                  {masteredCount} mastered
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <AnimatedButton
                onPress={handleStudy}
                hapticFeedback="medium"
                style={styles.studyButton}
              >
                <Text style={styles.studyButtonText}>Study</Text>
              </AnimatedButton>
              <AnimatedButton
                onPress={handleWrite}
                hapticFeedback="light"
                style={styles.writeButton}
              >
                <Text style={styles.writeButtonText}>Write</Text>
              </AnimatedButton>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  },
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const DeckList: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const decks: Deck[] = contentRegistry[selectedLanguage].decks;

  const renderItem = useCallback(
    ({ item, index }: { item: Deck; index: number }) => (
      <DeckCard
        deck={item}
        index={index}
        selectedLanguage={selectedLanguage}
      />
    ),
    [selectedLanguage],
  );

  const keyExtractor = useCallback((item: Deck) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Vertical deck list */}
      <FlatList
        data={decks}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Deck card
  deckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  deckCardContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },

  // Progress ring
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },

  // Deck info
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 3,
  },
  deckDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 8,
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  masteredBadge: {
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  badgeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  masteredBadgeText: {
    color: '#6366f1',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  studyButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  studyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  writeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  writeButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DeckList;
export { DeckList };
