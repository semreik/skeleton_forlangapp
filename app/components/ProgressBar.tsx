import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  ReduceMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Props {
  progress: number; // 0 to 1
  showMilestones?: boolean;
}

const MILESTONES = [0.25, 0.5, 0.75, 1.0];

export const ProgressBar: React.FC<Props> = ({ progress, showMilestones = true }) => {
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const lastMilestone = useRef(-1);

  useEffect(() => {
    // Animate progress change
    animatedProgress.value = withSpring(progress, {
      damping: 20,
      stiffness: 100,
      reduceMotion: ReduceMotion.System,
    });

    // Check for milestone achievements
    if (showMilestones) {
      const currentMilestone = MILESTONES.findIndex(m => progress >= m && lastMilestone.current < MILESTONES.indexOf(m));
      if (currentMilestone !== -1 && progress >= MILESTONES[currentMilestone]) {
        const milestoneIndex = MILESTONES.findIndex(m => progress >= m);
        if (milestoneIndex > lastMilestone.current) {
          lastMilestone.current = milestoneIndex;
          // Trigger milestone pulse
          pulseScale.value = withSequence(
            withSpring(1.1, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.System }),
            withSpring(1, { damping: 15, stiffness: 150, reduceMotion: ReduceMotion.System })
          );
          // Haptic feedback for milestone
          if (progress === 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      }
    }
  }, [progress, showMilestones]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.fillContainer, fillStyle]}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
      {showMilestones && (
        <View style={styles.milestonesContainer}>
          {MILESTONES.slice(0, -1).map((milestone, index) => (
            <View
              key={milestone}
              style={[
                styles.milestone,
                { left: `${milestone * 100}%` },
                progress >= milestone && styles.milestoneReached,
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  milestonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  milestone: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -1 }],
  },
  milestoneReached: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
