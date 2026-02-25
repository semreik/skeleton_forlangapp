import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { contentRegistry, nsDeckId } from '../services/contentRegistry';
import { useLanguage } from '../stores/useLanguage';
import { useProgress } from '../stores/useProgress';
import type { Deck } from '../types/deck';

export const Stats: React.FC = () => {
  const { getDeckProgress, getSessionsByDeck, loadProgress } = useProgress();
  const { selectedLanguage } = useLanguage();
  const decks: Deck[] = contentRegistry[selectedLanguage].decks;

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const renderItem = ({ item: deck }: { item: Deck }) => {
    const namespacedId = nsDeckId(selectedLanguage, deck.id);
    const masteredCount = getDeckProgress(namespacedId, deck.cards);
    const progress = deck.cards.length ? masteredCount / deck.cards.length : 0;

    const sessions = getSessionsByDeck(namespacedId);
    const lastSession = sessions[sessions.length - 1];
    
    return (
      <View style={styles.deckItem}>
        <Text style={styles.title}>{deck.title}</Text>
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>
            {masteredCount} / {deck.cards.length} mastered
          </Text>
        </View>
        
        {lastSession && (
          <View style={styles.sessionStats}>
            <Text style={styles.statsTitle}>Last Session</Text>
            <Text style={styles.statsText}>
              Date: {new Date(lastSession.endTime).toLocaleDateString()}
            </Text>
            <Text style={styles.statsText}>
              Time spent: {Math.round(lastSession.timeSpentMs / 1000)}s
            </Text>
            <Text style={styles.statsText}>
              Mastered: {lastSession.masteredCards} cards
            </Text>
            <Text style={styles.statsText}>
              Learning: {lastSession.learningCards} cards
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {decks.map((deck) => {
          const namespacedId = nsDeckId(selectedLanguage, deck.id);
          const masteredCount = getDeckProgress(namespacedId, deck.cards);
          const progress = deck.cards.length ? masteredCount / deck.cards.length : 0;
          const sessions = getSessionsByDeck(namespacedId);
          const lastSession = sessions[sessions.length - 1];
          
          return (
            <View key={deck.id} style={styles.deckItem}>
              <Text style={styles.title}>{deck.title}</Text>
              <View style={styles.progressContainer}>
                <ProgressBar progress={progress} />
                <Text style={styles.progressText}>
                  {masteredCount} / {deck.cards.length} mastered
                </Text>
              </View>
              
              {lastSession && (
                <View style={styles.sessionStats}>
                  <Text style={styles.statsTitle}>Last Session</Text>
                  <Text style={styles.statsText}>
                    Date: {new Date(lastSession.endTime).toLocaleDateString()}
                  </Text>
                  <Text style={styles.statsText}>
                    Time spent: {Math.round(lastSession.timeSpentMs / 1000)}s
                  </Text>
                  <Text style={styles.statsText}>
                    Mastered: {lastSession.masteredCards} cards
                  </Text>
                  <Text style={styles.statsText}>
                    Learning: {lastSession.learningCards} cards
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionStats: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#6366f1',
  },
  statsText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  deckItem: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  progressContainer: {
    gap: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
});
