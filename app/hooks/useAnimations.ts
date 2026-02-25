import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  ReduceMotion,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Spring configuration for natural feel
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  reduceMotion: ReduceMotion.System,
};

export const TIMING_CONFIG = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  reduceMotion: ReduceMotion.System,
};

/**
 * Standalone shake animation — drives a shared value through a 5-step sequence.
 * Can be used without the useShake hook when you already have a shared value.
 */
export function triggerShake(sharedValue: SharedValue<number>) {
  'worklet';
  sharedValue.value = withSequence(
    withTiming(10, { duration: 50, reduceMotion: ReduceMotion.System }),
    withTiming(-10, { duration: 50, reduceMotion: ReduceMotion.System }),
    withTiming(10, { duration: 50, reduceMotion: ReduceMotion.System }),
    withTiming(-10, { duration: 50, reduceMotion: ReduceMotion.System }),
    withTiming(0, { duration: 50, reduceMotion: ReduceMotion.System })
  );
}

/**
 * Shared input-feedback hook for Write / NumbersWrite screens.
 * Combines border-colour animation, shake, and result scale+opacity.
 */
export function useInputFeedback() {
  const inputBorderColor = useSharedValue(0); // 0 = neutral, 1 = correct, -1 = incorrect
  const shakeX = useSharedValue(0);
  const resultScale = useSharedValue(0.8);
  const resultOpacity = useSharedValue(0);

  const inputAnimatedStyle = useAnimatedStyle(() => {
    const borderColor =
      inputBorderColor.value === 1
        ? '#4CAF50'
        : inputBorderColor.value === -1
          ? '#FF3B30'
          : '#ddd';

    return {
      borderColor,
      borderWidth: inputBorderColor.value !== 0 ? 2 : 1,
      transform: [{ translateX: shakeX.value }],
    };
  });

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ scale: resultScale.value }],
  }));

  const showCorrect = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    inputBorderColor.value = withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System });
    resultOpacity.value = withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System });
    resultScale.value = withSpring(1, { damping: 15, stiffness: 200, reduceMotion: ReduceMotion.System });
  }, []);

  const showIncorrect = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    inputBorderColor.value = withTiming(-1, { duration: 300, reduceMotion: ReduceMotion.System });
    triggerShake(shakeX);
    resultOpacity.value = withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System });
    resultScale.value = withSpring(1, { damping: 15, stiffness: 200, reduceMotion: ReduceMotion.System });
  }, []);

  const reset = useCallback(() => {
    inputBorderColor.value = 0;
    shakeX.value = 0;
    resultScale.value = 0.8;
    resultOpacity.value = 0;
  }, []);

  return {
    inputAnimatedStyle,
    resultAnimatedStyle,
    showCorrect,
    showIncorrect,
    reset,
  };
}

/**
 * Button press scale animation with optional haptic feedback
 */
export function useScalePress(enableHaptics = true) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
    if (enableHaptics) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [enableHaptics]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}

/**
 * Shake animation for wrong answers
 */
export function useShake() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const shake = useCallback((withHaptics = true) => {
    if (withHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    translateX.value = withSequence(
      withTiming(10, { duration: 50, reduceMotion: ReduceMotion.System }),
      withTiming(-10, { duration: 50, reduceMotion: ReduceMotion.System }),
      withTiming(10, { duration: 50, reduceMotion: ReduceMotion.System }),
      withTiming(-10, { duration: 50, reduceMotion: ReduceMotion.System }),
      withTiming(0, { duration: 50, reduceMotion: ReduceMotion.System })
    );
  }, []);

  return {
    animatedStyle,
    shake,
  };
}

/**
 * Fade in entrance animation
 */
export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const fadeIn = useCallback(() => {
    opacity.value = withDelay(delay, withTiming(1, TIMING_CONFIG));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, [delay]);

  const reset = useCallback(() => {
    opacity.value = 0;
    translateY.value = 20;
  }, []);

  return {
    animatedStyle,
    fadeIn,
    reset,
  };
}

/**
 * Pulse animation for success feedback
 */
export function usePulse() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulse = useCallback((withHaptics = true) => {
    if (withHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.System }),
      withSpring(1, { damping: 15, stiffness: 150, reduceMotion: ReduceMotion.System })
    );
  }, []);

  return {
    animatedStyle,
    pulse,
  };
}

/**
 * Slide animation for card transitions
 */
export function useSlide(direction: 'left' | 'right' = 'left') {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const slideOut = useCallback((onComplete?: () => void) => {
    const targetX = direction === 'left' ? -400 : 400;
    const targetRotate = direction === 'left' ? -15 : 15;

    translateX.value = withTiming(targetX, { duration: 300, reduceMotion: ReduceMotion.System });
    rotate.value = withTiming(targetRotate, { duration: 300, reduceMotion: ReduceMotion.System });
    opacity.value = withTiming(0, { duration: 300, reduceMotion: ReduceMotion.System }, () => {
      if (onComplete) {
        runOnJS(onComplete)();
      }
    });
  }, [direction]);

  const slideIn = useCallback(() => {
    const startX = direction === 'left' ? 400 : -400;
    translateX.value = startX;
    rotate.value = direction === 'left' ? 15 : -15;
    opacity.value = 0;

    translateX.value = withSpring(0, SPRING_CONFIG);
    rotate.value = withSpring(0, SPRING_CONFIG);
    opacity.value = withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System });
  }, [direction]);

  const reset = useCallback(() => {
    translateX.value = 0;
    rotate.value = 0;
    opacity.value = 1;
  }, []);

  return {
    animatedStyle,
    slideOut,
    slideIn,
    reset,
  };
}

/**
 * Progress animation for smooth width transitions
 */
export function useProgressAnimation(initialProgress = 0) {
  const progress = useSharedValue(initialProgress);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const animateToProgress = useCallback((newProgress: number) => {
    progress.value = withSpring(newProgress, {
      damping: 20,
      stiffness: 100,
      reduceMotion: ReduceMotion.System,
    });
  }, []);

  return {
    animatedStyle,
    animateToProgress,
    progress,
  };
}

/**
 * Counter animation for number displays
 */
export function useCountAnimation(targetValue: number, duration = 1000) {
  const count = useSharedValue(0);

  const animateCount = useCallback(() => {
    count.value = withTiming(targetValue, {
      duration,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [targetValue, duration]);

  return {
    count,
    animateCount,
  };
}

/**
 * Stagger fade for list items
 */
export function useStaggerFade(index: number, baseDelay = 50) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animate = useCallback(() => {
    const delay = index * baseDelay;
    opacity.value = withDelay(delay, withTiming(1, TIMING_CONFIG));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, [index, baseDelay]);

  return {
    animatedStyle,
    animate,
  };
}

/**
 * Haptic feedback utilities
 */
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};
