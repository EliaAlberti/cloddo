import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message, Session, CreateChatRequest, CreateMessageRequest } from '@/types';
import { invoke } from '@tauri-apps/api/core';

interface ChatState {
  // Current state
  currentChat: Chat | null;
  currentSession: Session | null;
  chats: Chat[];
  messages: Message[];
  sessions: Session[];
  
  // UI state
  viewMode: 'grid' | 'list' | 'compact';
  selectedFolder: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentChat: (chat: Chat | null) => void;
  setCurrentSession: (session: Session | null) => void;
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  setSelectedFolder: (folder: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Chat operations
  fetchChats: (sessionId?: string, projectId?: string) => Promise<void>;
  fetchChatById: (chatId: string) => Promise<Chat | null>;
  createChat: (request: CreateChatRequest) => Promise<Chat>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<Chat>;
  deleteChat: (chatId: string) => Promise<boolean>;

  // Message operations
  fetchMessages: (chatId: string, limit?: number, offset?: number) => Promise<void>;
  sendMessage: (request: CreateMessageRequest) => Promise<Message>;
  sendClaudeMessage: (chatId: string, content: string, apiKey: string) => Promise<Message>;

  // Session operations
  fetchSessions: () => Promise<void>;
  createSession: (title: string) => Promise<Session>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChat: null,
      currentSession: null,
      chats: [],
      messages: [],
      sessions: [],
      
      // UI state
      viewMode: 'grid',
      selectedFolder: null,
      searchQuery: '',
      isLoading: false,
      error: null,

      // Actions
      setCurrentChat: (chat) => set({ currentChat: chat }),
      setCurrentSession: (session) => set({ currentSession: session }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedFolder: (folder) => set({ selectedFolder: folder }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Chat operations
      fetchChats: async (sessionId?: string, projectId?: string) => {
        try {
          set({ isLoading: true, error: null });
          const chats = await invoke('get_chats', {
            session_id: sessionId,
            project_id: projectId,
            folder_path: get().selectedFolder,
            limit: 100,
          }) as Chat[];
          set({ chats });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchChatById: async (chatId: string) => {
        try {
          const chat = await invoke('get_chat_by_id', { chat_id: chatId }) as Chat | null;
          return chat;
        } catch (error) {
          set({ error: error as string });
          return null;
        }
      },

      createChat: async (request: CreateChatRequest) => {
        try {
          set({ isLoading: true, error: null });
          const chat = await invoke('create_chat', { request }) as Chat;
          set((state) => ({ chats: [chat, ...state.chats], error: null }));
          return chat;
        } catch (error) {
          const errorMessage = typeof error === 'string' ? error : 'Failed to create chat. Please try again.';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateChat: async (chatId: string, updates: Partial<Chat>) => {
        try {
          set({ isLoading: true, error: null });
          const chat = await invoke('update_chat', { chat_id: chatId, request: updates }) as Chat;
          set((state) => ({
            chats: state.chats.map((c) => (c.id === chatId ? chat : c)),
            currentChat: state.currentChat?.id === chatId ? chat : state.currentChat,
          }));
          return chat;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteChat: async (chatId: string) => {
        try {
          set({ isLoading: true, error: null });
          const success = await invoke('delete_chat', { chat_id: chatId }) as boolean;
          if (success) {
            set((state) => ({
              chats: state.chats.filter((c) => c.id !== chatId),
              currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
            }));
          }
          return success;
        } catch (error) {
          set({ error: error as string });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Message operations
      fetchMessages: async (chatId: string, limit?: number, offset?: number) => {
        try {
          set({ isLoading: true, error: null });
          const messages = await invoke('get_messages', {
            chat_id: chatId,
            limit,
            offset,
          }) as Message[];
          set({ messages });
        } catch (error) {
          // Handle Tauri-specific error format
          let errorMessage = 'Failed to load messages';
          if (typeof error === 'string') {
            if (error.includes('missing required key')) {
              errorMessage = 'Please select a valid chat to view messages.';
            } else if (error.includes('chatId')) {
              errorMessage = 'Invalid chat selected. Please try creating a new chat.';
            } else {
              errorMessage = error;
            }
          }
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      sendMessage: async (request: CreateMessageRequest) => {
        try {
          set({ isLoading: true, error: null });
          const message = await invoke('send_message', { request }) as Message;
          set((state) => ({ messages: [...state.messages, message] }));
          return message;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      sendClaudeMessage: async (chatId: string, content: string, _apiKey: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // First add the user message to the UI
          const userMessage: Message = {
            id: `msg_user_${Date.now()}`,
            chatId: chatId,
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
            metadata: undefined,
          };
          
          set((state) => ({ 
            messages: [...state.messages, userMessage] 
          }));
          
          // Then send to Claude API and get response
          const assistantMessage = await invoke('send_claude_message', {
            request: {
              chat_id: chatId,
              role: 'user',
              content,
            },
          }) as Message;
          
          // Add the assistant response to the UI
          set((state) => ({ 
            messages: [...state.messages, assistantMessage] 
          }));
          
          // Clear error on successful message send
          set({ error: null });
          return assistantMessage;
        } catch (error) {
          const errorMessage = typeof error === 'string' ? error : 'Failed to send message. Please check your API configuration.';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Session operations
      fetchSessions: async () => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement session fetch command
          const sessions: Session[] = [];
          set({ sessions });
        } catch (error) {
          set({ error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      createSession: async (title: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Implement session creation command
          const session: Session = {
            id: Date.now().toString(),
            userId: 'user-1',
            title,
            folderPath: undefined,
            tags: [],
            isFavorite: false,
            totalMessages: 0,
            tokenUsage: 0,
            lastActivity: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            metadata: {},
          };
          set((state) => ({ sessions: [session, ...state.sessions] }));
          return session;
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        viewMode: state.viewMode,
        selectedFolder: state.selectedFolder,
        searchQuery: state.searchQuery,
      }),
    }
  )
);