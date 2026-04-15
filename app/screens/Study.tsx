import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../navigation/types';
import AnimatedButton from '../components/AnimatedButton';
import { useProgress } from '../stores/useProgress';
import { getDeckImage } from '../../assets/images';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESH = SW * 0.25;
const RM = ReduceMotion.System;

/* Card dimensions are now computed reactively via useWindowDimensions */

/* ── Animation presets ── */
const SNAP = { damping: 25, stiffness: 120, mass: 1, reduceMotion: RM };

const EXIT_CFG = {
  liftY: -350,
  driftX: SW * 0.6,
  dur: 700,
  fadeDur: 600,
  scale: 0.6,
  angles: [5, -8, 15, -10, 25] as const,
  steps: [120, 140, 160, 140, 140] as const,
  liftE: Easing.bezier(0.25, 0.1, 0.25, 1),
  driftE: Easing.in(Easing.quad),
  scaleE: Easing.out(Easing.quad),
  fadeE: Easing.in(Easing.quad),
};

const ENTER_CFG = {
  y: -60,
  rot: 3,
  scale: 0.92,
  fadeDur: 350,
  posS: { damping: 18, stiffness: 80, reduceMotion: RM },
  rotS: { damping: 14, stiffness: 90, reduceMotion: RM },
  scaS: { damping: 16, stiffness: 90, reduceMotion: RM },
};

const DRAG_CFG = { yDamp: 0.15, maxLift: -25, maxRot: 6, minScale: 0.98 };

/* ── Flashcard color themes (cycling per card index) ── */
const CARD_THEMES = [
  { bg: '#E8D5F5', border: '#C9A0DC', label: '#7B2D8E', labelBg: '#D4A5E5' },
  { bg: '#D6EAF8', border: '#AED6F1', label: '#2471A3', labelBg: '#AED6F1' },
  { bg: '#FADBD8', border: '#F5B7B1', label: '#C0392B', labelBg: '#F5B7B1' },
  { bg: '#FCF3CF', border: '#F9E79F', label: '#B7950B', labelBg: '#F9E79F' },
  { bg: '#D5F5E3', border: '#A9DFBF', label: '#1E8449', labelBg: '#A9DFBF' },
  { bg: '#FDEBD0', border: '#F5CBA7', label: '#C0702B', labelBg: '#F5CBA7' },
  { bg: '#D5F5F1', border: '#A3E4D7', label: '#148F77', labelBg: '#A3E4D7' },
  { bg: '#FAD7A0', border: '#F0B27A', label: '#AF601A', labelBg: '#F0B27A' },
];

type Route = RouteProp<RootStackParamList, 'Study'>;
type Nav = StackNavigationProp<RootStackParamList>;

// ─── Streak Indicator ────────────────────────────────────────────────────────

const StreakIndicator = ({ streak }: { streak: number }) => {
  if (streak <= 0) return null;
  return (
    <View style={st.streak}>
      <Text style={st.streakFlame}>🔥</Text>
      <Text style={st.streakCount}>{streak}</Text>
    </View>
  );
};

// ─── Stack Card (background depth cards) ─────────────────────────────────────

const StackCard = ({ offset, bgColor, w, h }: { offset: number; bgColor?: string; w: number; h: number }) => (
  <View
    style={[
      st.stackCard,
      {
        width: w,
        height: h,
        backgroundColor: bgColor || '#f0f0f0',
        transform: [
          { scale: 1 - offset * 0.04 },
          { translateY: offset * 8 },
        ],
        opacity: 1 - offset * 0.3,
      },
    ]}
  />
);

// ─── Main Study Screen ───────────────────────────────────────────────────────

const Study: React.FC = () => {
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxCardW = winW - 48;
  const maxCardH = winH * 0.65;

  const { deckId, cards, deckTitle } = useRoute<Route>().params;
  const nav = useNavigation<Nav>();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [imgRatio, setImgRatio] = useState(0.667); // default 2:3 portrait
  const {
    setMastered,
    setLearning,
    countByStatus,
    startSession,
    endSession,
  } = useProgress();
  const card = cards[idx];
  const theme = CARD_THEMES[idx % CARD_THEMES.length];
  const img = card.image ? getDeckImage(deckId, card.image) : undefined;

  // Reset image ratio when switching cards
  useEffect(() => { setImgRatio(0.667); }, [idx]);

  // Card dimensions: image cards adapt to image aspect ratio, text cards use default
  let cardW: number;
  let cardH: number;
  if (img) {
    cardH = maxCardH;
    cardW = Math.min(cardH * imgRatio, maxCardW);
  } else {
    cardW = maxCardW;
    cardH = Math.min(cardW * 1.55, maxCardH);
  }
  const animating = useRef(false);

  // Card transform shared values
  const sx = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const ro = useSharedValue(0);
  const op = useSharedValue(1);
  const sc = useSharedValue(1);

  // Flip animation
  const flipRotation = useSharedValue(0);

  useEffect(() => {
    startSession(deckId, cards.length);
    return () => {
      endSession();
    };
  }, [deckId, cards.length, startSession, endSession]);

  /* ── Flip card ── */
  const toggleFlip = useCallback(() => {
    if (animating.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = flipped ? 0 : 180;
    flipRotation.value = withSpring(toValue, {
      damping: 20,
      stiffness: 90,
      reduceMotion: RM,
    });
    setFlipped(f => !f);
  }, [flipped]);

  /* ── Fly card out ── */
  const flyOut = useCallback(
    (dir: 'left' | 'right', cb: () => void) => {
      animating.current = true;
      const s = dir === 'left' ? -1 : 1;
      ty.value = withTiming(EXIT_CFG.liftY, {
        duration: EXIT_CFG.dur,
        easing: EXIT_CFG.liftE,
        reduceMotion: RM,
      });
      tx.value = withTiming(s * EXIT_CFG.driftX, {
        duration: EXIT_CFG.dur,
        easing: EXIT_CFG.driftE,
        reduceMotion: RM,
      });
      ro.value = withSequence(
        ...EXIT_CFG.angles.map((a, j) =>
          withTiming(s * a, {
            duration: EXIT_CFG.steps[j],
            reduceMotion: RM,
          }),
        ),
      );
      sc.value = withTiming(EXIT_CFG.scale, {
        duration: EXIT_CFG.dur,
        easing: EXIT_CFG.scaleE,
        reduceMotion: RM,
      });
      op.value = withTiming(
        0,
        {
          duration: EXIT_CFG.fadeDur,
          easing: EXIT_CFG.fadeE,
          reduceMotion: RM,
        },
        () => runOnJS(cb)(),
      );
    },
    [],
  );

  /* ── Fly card in ── */
  const flyIn = useCallback(() => {
    tx.value = 0;
    ty.value = ENTER_CFG.y;
    ro.value = ENTER_CFG.rot;
    sc.value = ENTER_CFG.scale;
    op.value = 0;
    flipRotation.value = 0;

    ty.value = withSpring(0, ENTER_CFG.posS);
    ro.value = withSpring(0, ENTER_CFG.rotS);
    op.value = withTiming(1, {
      duration: ENTER_CFG.fadeDur,
      easing: Easing.out(Easing.quad),
      reduceMotion: RM,
    });
    sc.value = withSpring(1, ENTER_CFG.scaS, () => {
      animating.current = false;
    });
  }, []);

  const next = useCallback(
    (dir: 'left' | 'right', after: () => void) => {
      flyOut(dir, () => {
        after();
        flyIn();
      });
    },
    [flyOut, flyIn],
  );

  /* ── Got it ── */
  const gotIt = useCallback(async () => {
    if (animating.current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setMastered(deckId, card.id, true);
    setStreak(s => s + 1);

    const m = countByStatus(deckId, 'mastered');
    if (m === cards.length) {
      flyOut('right', () => {
        endSession();
        nav.navigate('Congrats', {
          deckTitle,
          totalCards: cards.length,
          masteredCards: m,
        });
      });
      return;
    }
    if (idx < cards.length - 1) {
      next('right', () => {
        setIdx(n => n + 1);
        setFlipped(false);
      });
    } else {
      flyOut('right', () => {
        endSession();
        nav.goBack();
      });
    }
  }, [
    idx,
    cards.length,
    deckId,
    card,
    deckTitle,
    countByStatus,
    setMastered,
    endSession,
    nav,
    flyOut,
    next,
  ]);

  /* ── Repeat ── */
  const repeat = useCallback(() => {
    if (animating.current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setMastered(deckId, card.id, false);
    setLearning(deckId, card.id, true);
    setStreak(0);

    if (idx < cards.length - 1) {
      next('left', () => {
        setIdx(n => n + 1);
        setFlipped(false);
      });
    } else {
      flyOut('left', () => {
        endSession();
        nav.goBack();
      });
    }
  }, [
    idx,
    cards.length,
    deckId,
    card,
    setMastered,
    setLearning,
    endSession,
    nav,
    flyOut,
    next,
  ]);

  /* ── Pan gesture ── */
  const pan = Gesture.Pan()
    .onStart(() => {
      sx.value = tx.value;
    })
    .onUpdate(e => {
      tx.value = sx.value + e.translationX;
      const lift = interpolate(
        Math.abs(tx.value),
        [0, SW / 3],
        [0, DRAG_CFG.maxLift],
        Extrapolation.CLAMP,
      );
      ty.value = e.translationY * DRAG_CFG.yDamp + lift;
      ro.value = interpolate(
        tx.value,
        [-SW / 2, 0, SW / 2],
        [-DRAG_CFG.maxRot, 0, DRAG_CFG.maxRot],
        Extrapolation.CLAMP,
      );
      sc.value = interpolate(
        Math.abs(tx.value),
        [0, SW / 3],
        [1, DRAG_CFG.minScale],
        Extrapolation.CLAMP,
      );
    })
    .onEnd(() => {
      if (tx.value > SWIPE_THRESH) runOnJS(gotIt)();
      else if (tx.value < -SWIPE_THRESH) runOnJS(repeat)();
      else {
        tx.value = withSpring(0, SNAP);
        ty.value = withSpring(0, SNAP);
        ro.value = withSpring(0, SNAP);
        sc.value = withSpring(1, SNAP);
      }
    });

  // Card drag animated style
  const cardAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${ro.value}deg` },
      { scale: sc.value },
    ],
    opacity: op.value,
  }));

  // Front face — visible 0-89°, hidden from 90°
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [0, 180]);
    const show = flipRotation.value < 90 ? 1 : 0;
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: show,
      zIndex: show ? 2 : 0,
    };
  });

  // Back face — hidden 0-89°, visible from 90°
  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipRotation.value, [0, 180], [180, 360]);
    const show = flipRotation.value >= 90 ? 1 : 0;
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: show,
      zIndex: show ? 2 : 0,
    };
  });

  // Swipe feedback glow opacity
  const leftGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      tx.value,
      [-SWIPE_THRESH * 1.2, -SWIPE_THRESH * 0.3, 0],
      [0.6, 0.2, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const rightGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      tx.value,
      [0, SWIPE_THRESH * 0.3, SWIPE_THRESH * 1.2],
      [0, 0.2, 0.6],
      Extrapolation.CLAMP,
    ),
  }));

  // Swipe labels
  const leftLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      tx.value,
      [-SWIPE_THRESH * 1.2, -SWIPE_THRESH * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotate: '12deg' }],
  }));
  const rightLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      tx.value,
      [0, SWIPE_THRESH * 0.5, SWIPE_THRESH * 1.2],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotate: '-12deg' }],
  }));

  const remainingCards = cards.length - idx - 1;

  return (
    <View style={st.root}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top }]}>
        <View style={st.progressTrack}>
          <View style={[st.progressFill, { width: `${((idx + 1) / cards.length) * 100}%` }]} />
        </View>
        <View style={st.headerRow}>
          <Text style={st.headerTitle} numberOfLines={1}>
            {deckTitle}
          </Text>
          <View style={st.headerBadges}>
            <StreakIndicator streak={streak} />
            <View style={st.counterPill}>
              <Text style={st.counterText}>
                {idx + 1} / {cards.length}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card stage */}
      <View style={st.stage}>
        {/* Directional glow */}
        <Animated.View style={[st.glowLeft, leftGlowStyle]} />
        <Animated.View style={[st.glowRight, rightGlowStyle]} />

        {/* Swipe labels */}
        <Animated.View
          style={[st.swipeLabel, st.swipeLabelLeft, leftLabelStyle]}
        >
          <Text style={[st.swipeLabelText, { color: '#6366f1' }]}>
            REPEAT
          </Text>
        </Animated.View>
        <Animated.View
          style={[st.swipeLabel, st.swipeLabelRight, rightLabelStyle]}
        >
          <Text style={[st.swipeLabelText, { color: '#4f46e5' }]}>
            GOT IT
          </Text>
        </Animated.View>

        {/* Active card with gesture */}
        <GestureDetector gesture={pan}>
          <Animated.View style={[st.cardOuter, { width: cardW, height: cardH }, cardAnim]}>
            <Pressable onPress={toggleFlip} style={st.cardPressable}>
              {/* Front face */}
              {img ? (
                <Animated.View style={[st.cardFace, frontStyle]}>
                  <Image
                    source={img}
                    style={st.imgFill}
                    resizeMode="cover"
                    onLoad={(e) => {
                      const { width, height } = e.nativeEvent.source;
                      if (width && height) setImgRatio(width / height);
                    }}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.55)']}
                    style={st.bottomScrim}
                    pointerEvents="none"
                  />
                  <View style={st.overlayBottom}>
                    <Text style={st.imgWordText}>{card.front}</Text>
                    <View style={st.flipHintRow}>
                      <Ionicons name="sync-outline" size={14} color="rgba(255,255,255,0.7)" />
                      <Text style={[st.flipHintText, { color: 'rgba(255,255,255,0.7)' }]}>Tap to flip</Text>
                    </View>
                  </View>
                </Animated.View>
              ) : (
                <Animated.View style={[st.cardFace, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 3 }, frontStyle]}>
                  <View style={st.plainCenter}>
                    <Text style={st.wordText}>{card.front}</Text>
                  </View>
                  <View style={st.flipHintRow}>
                    <Ionicons name="sync-outline" size={14} color={theme.label + '80'} />
                    <Text style={[st.flipHintText, { color: theme.label + '80' }]}>Tap to flip</Text>
                  </View>
                </Animated.View>
              )}

              {/* Back face */}
              <Animated.View style={[st.cardFace, { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 3 }, backStyle]}>
                <View style={st.plainCenter}>
                  <Text style={[st.wordText, { color: theme.label }]}>{card.back}</Text>
                  {card.notes ? (
                    <Text style={st.sentenceText}>{card.notes}</Text>
                  ) : null}
                </View>
                <View style={st.flipHintRow}>
                  <Ionicons name="sync-outline" size={14} color={theme.label + '80'} />
                  <Text style={[st.flipHintText, { color: theme.label + '80' }]}>Tap to flip back</Text>
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Hint text */}
      <Text style={st.hint}>
        Swipe left to repeat · Swipe right for got it
      </Text>

      {/* Action buttons */}
      <View style={[st.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AnimatedButton
          style={[st.btn, st.btnRep]}
          onPress={repeat}
          hapticFeedback="medium"
        >
          <View style={st.btnInner}>
            <Ionicons name="arrow-back" size={18} color="#6366f1" />
            <Text style={[st.btnTxt, st.btnRepTxt]}>Repeat</Text>
          </View>
        </AnimatedButton>
        <AnimatedButton
          style={[st.btn, st.btnGot]}
          onPress={gotIt}
          hapticFeedback="medium"
        >
          <View style={st.btnInner}>
            <Text style={st.btnTxt}>Got it</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </AnimatedButton>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    paddingTop: 0,
    paddingLeft: 36,
    paddingRight: 16,
    paddingBottom: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
    flex: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counterPill: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#6366f1',
  },

  // Streak
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  streakFlame: {
    fontSize: 11,
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d97706',
  },

  // Stage
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Directional glows
  glowLeft: {
    position: 'absolute',
    left: 0,
    top: '15%',
    bottom: '15%',
    width: 50,
    backgroundColor: '#e0e7ff',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
  },
  glowRight: {
    position: 'absolute',
    right: 0,
    top: '15%',
    bottom: '15%',
    width: 50,
    backgroundColor: '#c7d2fe',
    borderTopLeftRadius: 40,
    borderBottomLeftRadius: 40,
  },

  // Swipe labels
  swipeLabel: {
    position: 'absolute',
    top: '10%',
    zIndex: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: '#ffffff',
  },
  swipeLabelLeft: {
    left: 24,
    borderColor: '#6366f1',
  },
  swipeLabelRight: {
    right: 24,
    borderColor: '#4f46e5',
  },
  swipeLabelText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Stack cards (background depth)
  stackCard: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Active card
  cardOuter: {
    backgroundColor: 'transparent',
  },
  cardPressable: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },

  /* ── Image-card layers ── */
  imgFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imgWordText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  imgSentenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 6,
    lineHeight: 20,
  },

  /* ── Plain (no-image) card ── */
  plainCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  wordText: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a1a2e',
  },
  sentenceText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 20,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  flipHintText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Hint
  hint: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: 8,
    letterSpacing: 0.3,
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  btnRep: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  btnRepTxt: {
    color: '#6366f1',
  },
  btnGot: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
  },
});

export default Study;
