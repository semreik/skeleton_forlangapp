import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../navigation/types';
import AnimatedButton from '../components/AnimatedButton';
import Confetti from '../components/Confetti';

type CongratsScreenRouteProp = RouteProp<RootStackParamList, 'Congrats'>;
type CongratsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Animated counter component
const AnimatedCounter: React.FC<{ target: number; delay?: number }> = ({ target, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Update display value using a simple interval
    const startTime = Date.now() + delay;
    const duration = 1500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) return;
      if (elapsed >= duration) {
        setDisplayValue(target);
        clearInterval(interval);
        return;
      }
      const progress = elapsed / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setDisplayValue(Math.round(easedProgress * target));
    }, 32);

    return () => clearInterval(interval);
  }, [target, delay]);

  return <Text style={styles.statNumber}>{displayValue}</Text>;
};

export const Congrats: React.FC = () => {
  const navigation = useNavigation<CongratsScreenNavigationProp>();
  const route = useRoute<CongratsScreenRouteProp>();
  const { deckTitle, totalCards, masteredCards } = route.params;

  const [showConfetti, setShowConfetti] = useState(true);

  // Animation values
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);
  const badgeScale = useSharedValue(0);
  const badgeRotation = useSharedValue(-10);
  const shimmerPosition = useSharedValue(-100);

  useEffect(() => {
    // Trigger haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Title animation
    titleScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 100, reduceMotion: ReduceMotion.System })
    );
    titleOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 500, reduceMotion: ReduceMotion.System })
    );

    // Subtitle animation
    subtitleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500, reduceMotion: ReduceMotion.System })
    );

    // Stats animation
    statsOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 500, reduceMotion: ReduceMotion.System })
    );

    // Badge animation
    badgeScale.value = withDelay(
      1000,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150, reduceMotion: ReduceMotion.System }),
        withSpring(1, { damping: 12, stiffness: 100, reduceMotion: ReduceMotion.System })
      )
    );
    badgeRotation.value = withDelay(
      1000,
      withSpring(0, { damping: 15, stiffness: 100, reduceMotion: ReduceMotion.System })
    );

    // Shimmer animation for badge
    shimmerPosition.value = withDelay(
      1500,
      withTiming(200, { duration: 1000, reduceMotion: ReduceMotion.System })
    );

    // Button animation
    buttonOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 500, reduceMotion: ReduceMotion.System })
    );
    buttonTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 15, stiffness: 100, reduceMotion: ReduceMotion.System })
    );
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  const percentage = Math.round((masteredCards / totalCards) * 100);

  return (
    <View style={styles.container}>
      <Confetti trigger={showConfetti} />

      <View style={styles.content}>
        {/* Achievement Badge */}
        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
          <View style={styles.badgeInner}>
            <Text style={styles.badgeIcon}>🏆</Text>
            <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Congratulations!
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          You've mastered all cards in{'\n'}
          <Text style={styles.deckName}>{deckTitle}</Text>
        </Animated.Text>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
          <View style={styles.statBox}>
            <AnimatedCounter target={masteredCards} delay={1000} />
            <Text style={styles.statLabel}>Cards Mastered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <AnimatedCounter target={percentage} delay={1200} />
            <Text style={styles.statLabel}>% Complete</Text>
          </View>
        </Animated.View>

        {/* Motivational message */}
        <Animated.Text style={[styles.message, statsAnimatedStyle]}>
          Keep up the great work! 🌟
        </Animated.Text>
      </View>

      {/* Button */}
      <Animated.View style={buttonAnimatedStyle}>
        <AnimatedButton
          style={styles.button}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Decks');
          }}
          hapticFeedback="medium"
        >
          <Text style={styles.buttonText}>Continue Learning</Text>
        </AnimatedButton>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    marginBottom: 24,
  },
  badgeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  badgeIcon: {
    fontSize: 48,
  },
  shimmer: {
    position: 'absolute',
    width: 30,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '20deg' }],
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  deckName: {
    fontWeight: '700',
    color: '#6366f1',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
