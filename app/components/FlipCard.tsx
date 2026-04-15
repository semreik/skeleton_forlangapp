import React, { useCallback, useEffect } from 'react';
import { StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FlipCardProps {
  isFlipped: boolean;
  onFlip?: () => void;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  style?: ViewStyle;
  flipDuration?: number;
  disabled?: boolean;
}

export default function FlipCard({
  isFlipped,
  onFlip,
  frontContent,
  backContent,
  style,
  flipDuration = 400,
  disabled = false,
}: FlipCardProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isFlipped ? 180 : 0, {
      damping: 20,
      stiffness: 90,
      mass: 1,
      reduceMotion: ReduceMotion.System,
    });
  }, [isFlipped]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
      opacity: rotation.value < 90 ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: 'hidden',
      opacity: rotation.value >= 90 ? 1 : 0,
    };
  });

  const handlePress = useCallback(() => {
    if (!disabled && onFlip) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFlip();
    }
  }, [disabled, onFlip]);

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]} disabled={disabled}>
      <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
        {frontContent}
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        {backContent}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardFront: {
    zIndex: 1,
  },
  cardBack: {
    zIndex: 0,
  },
});
