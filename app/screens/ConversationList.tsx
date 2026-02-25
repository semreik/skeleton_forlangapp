import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ConversationCategory, Conversation } from '../types/conversation';
import { useLanguage } from '../stores/useLanguage';
import { contentRegistry } from '../services/contentRegistry';

type ConversationListRouteProp = RouteProp<{
  params: {
    categoryId: string;
    title: string;
  };
}, 'params'>;

export const ConversationList: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ConversationListRouteProp>();
  const { categoryId, title } = route.params;
  const { selectedLanguage } = useLanguage();
  const categories = contentRegistry[selectedLanguage].conversations.categories;
  const category = categories.find(cat => cat.id === categoryId);
  const conversations = category ? category.conversations : [];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Conversations',
    });
  }, [navigation, title]);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('ConversationPractice', { 
        categoryId, 
        conversationId: item.id,
        title: item.title
      })}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.count}>{item.exchanges.length} exchanges</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {category && (
        <Text style={styles.description}>{category.description}</Text>
      )}
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  description: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 36,
    marginRight: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
