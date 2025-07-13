export interface Chat {
  id: string;
  sessionId: string;
  projectId?: string;
  title: string;
  folderPath?: string;
  isFavorite: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  folderPath?: string;
  tags?: string[];
  isFavorite: boolean;
  totalMessages: number;
  tokenUsage: number;
  lastActivity: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatFolder {
  path: string;
  name: string;
  children: ChatFolder[];
  chats: Chat[];
}

export type ChatViewMode = 'grid' | 'list' | 'compact';

export interface ChatFilters {
  search?: string;
  tags?: string[];
  projectId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  favorites?: boolean;
}

export interface CreateChatRequest {
  session_id: string;
  project_id?: string;
  title: string;
  folder_path?: string;
}

export interface CreateMessageRequest {
  chat_id: string;
  role: string;
  content: string;
}