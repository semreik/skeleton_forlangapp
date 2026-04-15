import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { ConversationCategory } from '../types/conversation';
import { useLanguage } from '../stores/useLanguage';
import { contentRegistry } from '../services/contentRegistry';

export const ConversationCategories: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { selectedLanguage } = useLanguage();
  const categories = contentRegistry[selectedLanguage].conversations.categories;

  const renderItem = ({ item }: { item: ConversationCategory }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('ConversationList', { categoryId: item.id, title: item.title })}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={getCategoryIcon(item.id)} size={28} color="#007AFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.count}>{item.conversations.length} conversation{item.conversations.length !== 1 ? 's' : ''}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'greetings': return 'emoji-emotions';
      case 'age-birthday': return 'cake';
      case 'family': return 'people';
      case 'home': return 'home';
      case 'weather': return 'cloud';
      case 'school': return 'school';
      case 'leisure': return 'sports-basketball';
      case 'clothing': return 'style';
      case 'health': return 'healing';
      case 'directions': return 'directions';
      case 'festivals': return 'celebration';
      case 'food': return 'restaurant';
      default: return 'chat';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conversation Practice</Text>
      <Text style={styles.subheader}>Select a category to practice real-life conversations</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginLeft: 36,
    marginRight: 16,
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    marginLeft: 36,
    marginRight: 16,
    marginBottom: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  categoryItem: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#999',
  },
});
