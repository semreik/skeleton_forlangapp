// Auto-import all conversation files dynamically
// Any .json file (except specific patterns) in this folder will be automatically loaded

export interface Exchange {
  speaker: string;
  english: string;
  dzardzongke: string;
}

export interface Conversation {
  id: string;
  title: string;
  exchanges: Exchange[];
}

export interface ConversationCategory {
  id: string;
  title: string;
  description: string;
  conversations: Conversation[];
}

export interface ConversationsData {
  categories: ConversationCategory[];
}

// Use require.context to dynamically load all conversation JSON files
const conversationContext = require.context('./', false, /\.json$/);

// Get all conversation files and merge categories by language code
const allConversations: Record<string, ConversationsData> = {};

conversationContext.keys().forEach(key => {
  // Extract language code from filename (e.g., "conversations.json" -> "dz", "qu-conversations.json" -> "qu")
  const filename = key.replace('./', '').replace('.json', '');
  
  // Determine language code
  let langCode: string;
  if (filename.startsWith('qu')) {
    langCode = 'qu';
  } else if (filename.includes('conversation')) {
    // Default conversation files are for Dzardzongke
    langCode = 'dz';
  } else {
    // For other files, use the filename itself as lang code
    langCode = filename;
  }
  
  const convData = conversationContext(key) as ConversationsData;
  
  // Merge categories if language code already exists
  if (allConversations[langCode]) {
    allConversations[langCode].categories = [
      ...allConversations[langCode].categories,
      ...convData.categories
    ];
  } else {
    allConversations[langCode] = convData;
  }
});

// Export conversations by language code
export const dzConversations: ConversationsData = allConversations['dz'] || { categories: [] };
export const quConversations: ConversationsData = allConversations['qu'] || { categories: [] };

// Export all conversations for advanced usage
export const conversations = allConversations;
