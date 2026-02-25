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
