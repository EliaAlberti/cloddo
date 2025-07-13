import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';
import { invoke } from '@tauri-apps/api/core';

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: AppSettings = {
  general: {
    language: 'en',
    autoSave: true,
    autoSaveInterval: 5,
    defaultChatFolder: '',
    showWelcomeMessage: true,
    checkForUpdates: true,
    sendAnalytics: false,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
    fontFamily: 'Inter',
    density: 'comfortable',
    sidebarPosition: 'left',
    showStatusBar: true,
  },
  api: {
    authMethod: 'api_key',
    anthropicApiKey: undefined,
    anthropicOAuthToken: undefined,
    anthropicRefreshToken: undefined,
    anthropicBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    requestTimeout: 30,
    maxRetries: 3,
    rateLimit: {
      enabled: true,
      requestsPerMinute: 50,
    },
  },
  privacy: {
    storeChatHistory: true,
    encryptLocalData: true,
    clearDataOnExit: false,
    shareErrorReports: false,
    allowTelemetry: false,
    dataRetentionDays: 90,
  },
  performance: {
    maxChatHistory: 1000,
    enableVirtualScrolling: true,
    preloadMessages: 50,
    cacheSize: 100,
    enableBackgroundSync: true,
    lowPowerMode: false,
  },
  shortcuts: {
    newChat: 'CmdOrCtrl+N',
    searchChats: 'CmdOrCtrl+F',
    toggleSidebar: 'CmdOrCtrl+B',
    toggleDarkMode: 'CmdOrCtrl+D',
    focusInput: 'CmdOrCtrl+L',
    sendMessage: 'CmdOrCtrl+Enter',
    clearChat: 'CmdOrCtrl+Shift+C',
    exportChat: 'CmdOrCtrl+E',
    settings: 'CmdOrCtrl+,',
    quit: 'CmdOrCtrl+Q',
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      loadSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const settingsData = await invoke('get_settings') as Record<string, any>;
          
          // Merge with defaults to ensure all settings exist
          const settings: AppSettings = {
            ...defaultSettings,
            ...settingsData,
          };
          
          set({ settings });
        } catch (error) {
          console.warn('Failed to load settings, using defaults:', error);
          set({ settings: defaultSettings, error: error as string });
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (updates: Partial<AppSettings>) => {
        try {
          set({ isLoading: true, error: null });
          
          const currentSettings = get().settings || defaultSettings;
          const newSettings = { ...currentSettings, ...updates };
          
          // Flatten settings for storage
          const flatSettings: Record<string, any> = {};
          
          // Convert nested settings to flat structure for backend
          Object.entries(newSettings).forEach(([category, values]) => {
            if (typeof values === 'object' && values !== null) {
              Object.entries(values).forEach(([key, value]) => {
                flatSettings[`${category}.${key}`] = value;
              });
            } else {
              flatSettings[category] = values;
            }
          });

          await invoke('update_settings', { settings: flatSettings });
          set({ settings: newSettings });
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          await get().updateSettings(defaultSettings);
        } catch (error) {
          set({ error: error as string });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);