import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#96CEB4', // green
  '#FFEAA7', // yellow
  '#DDA0DD', // plum
  '#98D8C8', // mint
  '#F7DC6F', // gold
  '#BB8FCE', // purple
  '#85C1E9', // light blue
];

const PARTICLE_COUNT = 20;

interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

interface ParticleProps {
  particle: ConfettiParticle;
  onComplete?: () => void;
  isLast: boolean;
}

const Particle: React.FC<ParticleProps> = ({ particle, onComplete, isLast }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Random horizontal drift
    const drift = (Math.random() - 0.5) * 100;

    scale.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System })
    );

    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        reduceMotion: ReduceMotion.System,
      })
    );

    translateX.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(drift / 2, { duration: 1000, reduceMotion: ReduceMotion.System }),
        withTiming(drift, { duration: 1000, reduceMotion: ReduceMotion.System })
      )
    );

    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation + 720, {
        duration: 2500,
        reduceMotion: ReduceMotion.System,
      })
    );

    opacity.value = withDelay(
      particle.delay + 1500,
      withTiming(0, { duration: 500, reduceMotion: ReduceMotion.System }, () => {
        if (isLast && onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: Math.random() > 0.5 ? particle.size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger = true, onComplete }) => {
  const particles = useMemo<ConfettiParticle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      delay: Math.random() * 500,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Particle
          key={`${particle.id}-${trigger}`}
          particle={particle}
          onComplete={onComplete}
          isLast={index === particles.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});

export default Confetti;
