import { MaterialIcons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  SlideInLeft,
  SlideInRight,
  ReduceMotion,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { audioService } from '../services/AudioService';
import { contentRegistry } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import AnimatedButton from '../components/AnimatedButton';
import { SPRING_CONFIG } from '../hooks/useAnimations';
import { ProgressBar } from '../components/ProgressBar';

type ConversationPracticeRouteProp = RouteProp<{
  params: {
    categoryId: string;
    conversationId: string;
    title: string;
  };
}, 'params'>;

const { width } = Dimensions.get('window');

export const ConversationPractice: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ConversationPracticeRouteProp>();
  const { categoryId, conversationId, title } = route.params;
  const { selectedLanguage } = useLanguage();
  const categories = contentRegistry[selectedLanguage].conversations.categories;
  const category = categories.find(cat => cat.id === categoryId);
  const conversation = category?.conversations.find(conv => conv.id === conversationId);
  const exchanges = conversation ? conversation.exchanges : [];

  const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'both' | 'english' | 'dz'>('both');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation values
  const speakerAScale = useSharedValue(1);
  const speakerBScale = useSharedValue(0.9);
  const speakingRingScale = useSharedValue(1);
  const speakingRingOpacity = useSharedValue(0);

  const scrollViewRef = useRef<ScrollView>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Conversation Practice',
    });
  }, [navigation, title]);

  // Auto-play first message audio when conversation starts
  useEffect(() => {
    if (currentExchangeIndex === 0) {
      const ex = exchanges[0];
      if (ex) {
        if (__DEV__) console.log('🎵 Auto-playing first message for conversation:', conversationId);
        audioService.playConversationAudio(conversationId, 1, 'A').catch((error) => {
          if (__DEV__) console.error('❌ First message audio failed:', error);
        });
      }
    }
  }, []);

  useEffect(() => {
    const currentExchange = exchanges[currentExchangeIndex];
    const isSpeakerA = currentExchange?.speaker === 'A';

    // Animate speaker scales
    if (isSpeakerA) {
      speakerAScale.value = withSpring(1.1, SPRING_CONFIG);
      speakerBScale.value = withSpring(0.9, SPRING_CONFIG);
    } else {
      speakerAScale.value = withSpring(0.9, SPRING_CONFIG);
      speakerBScale.value = withSpring(1.1, SPRING_CONFIG);
    }

    // Speaking ring animation
    speakingRingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 500, reduceMotion: ReduceMotion.System }),
        withTiming(0, { duration: 500, reduceMotion: ReduceMotion.System })
      ),
      4,
      false
    );
    speakingRingScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0, reduceMotion: ReduceMotion.System }),
        withTiming(1.5, { duration: 1000, reduceMotion: ReduceMotion.System })
      ),
      4,
      false
    );

    // Scroll to bottom when changing exchanges
    if (scrollViewRef.current) {
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch { }
      }, 0);
    }

    // Auto-play audio for new messages when advancing
    if (currentExchangeIndex > 0) {
      const ex = exchanges[currentExchangeIndex];
      if (ex) {
        const exchangeNumber = currentExchangeIndex + 1;
        if (__DEV__) console.log('🎵 Auto-playing message:', conversationId, exchangeNumber, ex.speaker);
        audioService.playConversationAudio(conversationId, exchangeNumber, ex.speaker).catch((error) => {
          if (__DEV__) console.error('❌ New message audio failed:', error);
        });
      }
    }

    // Clean up sound when component unmounts or exchange changes
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentExchangeIndex]);

  const handleNext = () => {
    if (currentExchangeIndex < exchanges.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentExchangeIndex(currentExchangeIndex + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentExchangeIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentExchangeIndex(currentExchangeIndex - 1);
    }
  };

  const cycleViewMode = () => {
    Haptics.selectionAsync();
    setViewMode(prev => (prev === 'both' ? 'english' : prev === 'english' ? 'dz' : 'both'));
  };

  const handleReplay = (idx: number, speaker: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const exchangeNumber = idx + 1;
    if (__DEV__) console.log('🎵 Playing conversation audio:', conversationId, exchangeNumber, speaker);
    audioService.playConversationAudio(conversationId, exchangeNumber, speaker).catch((error) => {
      if (__DEV__) console.error('❌ Failed to play audio:', error);
    });
  };

  const currentExchange = exchanges[currentExchangeIndex];
  const isSpeakerA = currentExchange?.speaker === 'A';

  const speakerAStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerAScale.value }],
    opacity: speakerAScale.value > 1 ? 1 : 0.6,
  }));

  const speakerBStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerBScale.value }],
    opacity: speakerBScale.value > 1 ? 1 : 0.6,
  }));

  const speakingRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakingRingScale.value }],
    opacity: speakingRingOpacity.value,
  }));

  const progress = (currentExchangeIndex + 1) / exchanges.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentExchangeIndex + 1} / {exchanges.length}
          </Text>
          <ProgressBar progress={progress} showMilestones={false} />
        </View>

        <View style={styles.characterContainer}>
          {/* Speaker A */}
          <Animated.View style={[styles.character, speakerAStyle]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarImage, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              {isSpeakerA && (
                <Animated.View style={[styles.speakingRing, speakingRingStyle]} />
              )}
            </View>
            <Text style={styles.speakerLabel}>Speaker A</Text>
          </Animated.View>

          {/* Speaker B */}
          <Animated.View style={[styles.character, speakerBStyle]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarImage, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.avatarText}>B</Text>
              </View>
              {!isSpeakerA && (
                <Animated.View style={[styles.speakingRing, speakingRingStyle]} />
              )}
            </View>
            <Text style={styles.speakerLabel}>Speaker B</Text>
          </Animated.View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={styles.contentInner}
        >
          {exchanges.slice(0, currentExchangeIndex + 1).map((ex, idx) => {
            const left = ex.speaker === 'A';
            return (
              <Animated.View
                key={`${ex.speaker}-${idx}`}
                entering={left
                  ? SlideInLeft.duration(300).reduceMotion(ReduceMotion.System)
                  : SlideInRight.duration(300).reduceMotion(ReduceMotion.System)
                }
                style={styles.bubbleContainer}
              >
                <View style={[styles.bubble, left ? styles.bubbleLeft : styles.bubbleRight]}>
                  {viewMode !== 'dz' && (
                    <Text style={styles.bubbleText}>{ex.english}</Text>
                  )}
                  {viewMode === 'both' && <View style={{ height: 6 }} />}
                  {viewMode !== 'english' && (
                    <Text style={[styles.bubbleText, styles.translationText]}>{ex.dzardzongke}</Text>
                  )}
                  {/* Replay button */}
                  <AnimatedButton
                    onPress={() => handleReplay(idx, ex.speaker)}
                    style={{ marginTop: 8, alignSelf: left ? 'flex-start' : 'flex-end' }}
                    hapticFeedback="light"
                  >
                    <MaterialIcons name="volume-up" size={20} color="#0f172a" />
                  </AnimatedButton>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>

        <View style={styles.controlsContainer}>
          <AnimatedButton
            style={[styles.controlButton, currentExchangeIndex === 0 ? styles.disabledButton : {}]}
            onPress={handlePrevious}
            disabled={currentExchangeIndex === 0}
            hapticFeedback="light"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={currentExchangeIndex === 0 ? '#ccc' : '#007AFF'}
            />
            <Text style={[
              styles.controlText,
              currentExchangeIndex === 0 ? styles.disabledText : {}
            ]}>Previous</Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.translationButton}
            onPress={cycleViewMode}
            hapticFeedback="light"
          >
            <MaterialIcons
              name={'visibility'}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.controlText}>
              {viewMode === 'both' ? 'English only' : viewMode === 'english' ? 'Dzardzongke' : 'Show Both'}
            </Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.controlButton}
            onPress={handleNext}
            hapticFeedback="light"
          >
            <Text style={styles.controlText}>
              {currentExchangeIndex < exchanges.length - 1 ? 'Next' : 'Finish'}
            </Text>
            <MaterialIcons
              name={currentExchangeIndex < exchanges.length - 1 ? 'arrow-forward' : 'check'}
              size={24}
              color="#007AFF"
            />
          </AnimatedButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    marginBottom: 16,
    marginLeft: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  characterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingLeft: 36,
    paddingRight: 16,
  },
  character: {
    alignItems: 'center',
    width: width / 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  speakingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 16,
  },
  contentInner: {
    paddingBottom: 16,
  },
  bubbleContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bubble: {
    padding: 16,
    borderRadius: 16,
    maxWidth: '80%',
  },
  bubbleLeft: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#E2F0FE',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    color: '#333',
  },
  translationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlText: {
    fontSize: 14,
    color: '#007AFF',
    marginHorizontal: 4,
  },
  disabledText: {
    color: '#ccc',
  },
  translationButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
  },
});
