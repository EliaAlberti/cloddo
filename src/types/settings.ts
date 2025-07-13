export interface AppSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  api: APISettings;
  privacy: PrivacySettings;
  performance: PerformanceSettings;
  shortcuts: ShortcutSettings;
}

export interface GeneralSettings {
  language: string;
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  defaultChatFolder: string;
  showWelcomeMessage: boolean;
  checkForUpdates: boolean;
  sendAnalytics: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  customTheme?: CustomTheme;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition: 'left' | 'right';
  showStatusBar: boolean;
  customCSS?: string;
}

export interface CustomTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  borderRadius: number;
  shadows: boolean;
}

export interface APISettings {
  // Authentication
  authMethod: 'api_key' | 'oauth';
  anthropicApiKey?: string;
  anthropicOAuthToken?: string;
  anthropicRefreshToken?: string;
  anthropicBaseUrl?: string;
  
  // Model Configuration
  defaultModel: string;
  requestTimeout: number; // seconds
  maxRetries: number;
  
  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
  };
  
  // Network Configuration
  proxy?: {
    enabled: boolean;
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
}

export interface PrivacySettings {
  storeChatHistory: boolean;
  encryptLocalData: boolean;
  clearDataOnExit: boolean;
  shareErrorReports: boolean;
  allowTelemetry: boolean;
  dataRetentionDays: number;
}

export interface PerformanceSettings {
  maxChatHistory: number;
  enableVirtualScrolling: boolean;
  preloadMessages: number;
  cacheSize: number; // MB
  enableBackgroundSync: boolean;
  lowPowerMode: boolean;
}

export interface ShortcutSettings {
  newChat: string;
  searchChats: string;
  toggleSidebar: string;
  toggleDarkMode: string;
  focusInput: string;
  sendMessage: string;
  clearChat: string;
  exportChat: string;
  settings: string;
  quit: string;
}

export interface UserProfile {
  id: string;
  authType: 'anthropic_oauth' | 'api_key';
  anthropicUserId?: string;
  subscriptionTier?: string;
  apiKeyHash?: string;
  preferences: AppSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SettingDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'shortcut';
  label: string;
  description?: string;
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  validation?: (value: any) => boolean | string;
  category: string;
  subcategory?: string;
}