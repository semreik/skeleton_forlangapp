import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { hasDictionaryAudio } from '../../assets/audio';
import { audioService } from '../services/AudioService';
import AnimatedButton from './AnimatedButton';
import { SPRING_CONFIG } from '../hooks/useAnimations';

interface DictEntry {
  dz: string;
  en: string;
  example?: string;
  exampleEn?: string;
  audio?: string; // Optional explicit audio key override
}

interface Props {
  entry: DictEntry;
}

export const DictEntryCard: React.FC<Props> = ({ entry }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  // Cancel infinite pulse animations on unmount
  useEffect(() => {
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, []);

  // Check if audio exists for this word
  const hasAudio = Boolean(entry.audio) || hasDictionaryAudio(entry.dz);
  const iconColor = hasAudio ? '#2196F3' : '#9ca3af';

  // Debug logging
  if (__DEV__) console.log('📖 DictEntryCard:', { word: entry.dz, hasAudio, explicitAudio: entry.audio });

  const handlePlayAudio = async () => {
    if (isPlaying || !hasAudio) return;

    try {
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Start pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300, reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System })
        ),
        -1, // infinite
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 300, reduceMotion: ReduceMotion.System }),
          withTiming(1, { duration: 300, reduceMotion: ReduceMotion.System })
        ),
        -1,
        false
      );

      if (entry.audio) {
        await audioService.playAudio(entry.audio);
      } else {
        await audioService.playDictionaryAudio(entry.dz);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      // Stop animation
      pulseScale.value = withSpring(1, SPRING_CONFIG);
      pulseOpacity.value = withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System });
      setIsPlaying(false);
    }
  };

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.wordContainer}>
            <Text variant="headlineMedium" style={styles.dzText}>
              {entry.dz}
            </Text>
            <AnimatedButton
              onPress={handlePlayAudio}
              style={[styles.audioButton, !hasAudio && styles.audioButtonDisabled]}
              disabled={isPlaying || !hasAudio}
              hapticFeedback="none"
            >
              <Animated.View style={pulseAnimatedStyle}>
                <MaterialIcons
                  name={isPlaying ? 'graphic-eq' : 'volume-up'}
                  size={24}
                  color={iconColor}
                />
              </Animated.View>
            </AnimatedButton>
          </View>
          <Text variant="titleMedium" style={styles.enText}>
            {entry.en}
          </Text>
        </View>
        {entry.example && (
          <View style={styles.example}>
            <Text variant="bodyMedium" style={styles.dzExample}>
              {entry.example}
            </Text>
            {entry.exampleEn && (
              <Text variant="bodySmall" style={styles.enExample}>
                {entry.exampleEn}
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 10,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: '#f0f0f0',
    borderWidth: 1,
  },
  header: {
    marginBottom: 10,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dzText: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: 22,
  },
  enText: {
    color: '#16213e',
    fontSize: 16,
    marginTop: 2,
  },
  audioButton: {
    marginLeft: 12,
    padding: 6,
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  example: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  dzExample: {
    color: '#16213e',
    marginBottom: 6,
  },
  enExample: {
    color: '#555',
    fontStyle: 'italic',
  },
});
