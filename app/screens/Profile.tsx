import React, { useEffect } from 'react';
import { Alert, Platform, View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSaved } from '../stores/useSaved';
import AnimatedButton from '../components/AnimatedButton';

const Profile: React.FC = () => {
  const { items, loadSaved, removeItem, clearAll } = useSaved();

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('This will permanently remove all your saved words. This cannot be undone.')) clearAll();
    } else {
      Alert.alert('Clear all saved items', 'This will permanently remove all your saved words. This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearAll() },
      ]);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bookmark-outline" size={48} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No saved items yet</Text>
      <Text style={styles.emptySubtitle}>
        Save words during study or in the dictionary.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Saved Items</Text>
        {items.length > 0 && (
          <AnimatedButton onPress={handleClearAll} hapticFeedback="light">
            <Text style={styles.clearAllText}>Clear All</Text>
          </AnimatedButton>
        )}
      </View>

      {items.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Language badge */}
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>
                  {item.language === 'qu' ? 'Quechua' : 'Dzardzongke'}
                </Text>
              </View>

              {/* Content */}
              <Text style={styles.prompt}>English: {item.prompt}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

              {/* Explanation box */}
              {item.explanation ? (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>{item.explanation}</Text>
                </View>
              ) : null}

              {/* Bottom row: metadata + remove */}
              <View style={styles.bottomRow}>
                <View style={styles.metaContainer}>
                  <Text style={styles.meta}>{item.source}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <AnimatedButton onPress={() => removeItem(item.id)} hapticFeedback="light">
                  <Text style={styles.removeText}>Remove</Text>
                </AnimatedButton>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  langBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  langBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  prompt: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  answer: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  explanationBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  explanationText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  metaDot: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default Profile;
