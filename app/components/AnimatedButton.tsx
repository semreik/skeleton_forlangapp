import React, { ReactNode, useCallback } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SPRING_CONFIG } from '../hooks/useAnimations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  scaleValue?: number;
  testID?: string;
}

export default function AnimatedButton({
  children,
  onPress,
  onLongPress,
  onLayout,
  style,
  disabled = false,
  hapticFeedback = 'light',
  scaleValue = 0.95,
  testID,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback === 'none') return;

    switch (hapticFeedback) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }, [hapticFeedback]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, SPRING_CONFIG);
    runOnJS(triggerHaptic)();
  }, [scaleValue, triggerHaptic]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={onLayout}
      disabled={disabled}
      style={[
        styles.button,
        animatedStyle,
        style,
        disabled && styles.disabled,
      ]}
      testID={testID}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
