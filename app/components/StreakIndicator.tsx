import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StreakIndicatorProps {
  streak: number;
  showAnimation?: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  streak,
  showAnimation = true,
}) => {
  const flameScale = useSharedValue(1);
  const flameGlow = useSharedValue(0);
  const numberScale = useSharedValue(0);
  const numberOpacity = useSharedValue(0);

  useEffect(() => {
    if (showAnimation && streak > 0) {
      // Flame pulse animation
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System })
        ),
        -1, // infinite
        true
      );

      // Glow effect
      flameGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, reduceMotion: ReduceMotion.System }),
          withTiming(0.3, { duration: 800, reduceMotion: ReduceMotion.System })
        ),
        -1,
        true
      );

      // Number entrance animation
      numberScale.value = withDelay(
        200,
        withSpring(1, { damping: 12, stiffness: 200, reduceMotion: ReduceMotion.System })
      );
      numberOpacity.value = withDelay(
        200,
        withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System })
      );
    }

    return () => {
      cancelAnimation(flameScale);
      cancelAnimation(flameGlow);
    };
  }, [showAnimation, streak]);

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flameGlow.value * 0.5,
    transform: [{ scale: 1 + flameGlow.value * 0.3 }],
  }));

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
    opacity: numberOpacity.value,
  }));

  const flameColor = streak >= 7 ? '#FF4500' : streak >= 3 ? '#FF8C00' : '#FFA500';

  if (streak === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Glow effect behind flame */}
      <Animated.View style={[styles.glow, { backgroundColor: flameColor }, glowAnimatedStyle]} />

      {/* Flame icon */}
      <Animated.View style={flameAnimatedStyle}>
        <MaterialCommunityIcons name="fire" size={28} color={flameColor} />
      </Animated.View>

      {/* Streak count */}
      <Animated.View style={numberAnimatedStyle}>
        <Text style={[styles.streakText, { color: flameColor }]}>{streak}</Text>
      </Animated.View>

      {/* Label */}
      <Text style={styles.label}>day streak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  glow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    left: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
});

export default StreakIndicator;
