// App Constants
export const APP_NAME = 'Cloddo';
export const APP_VERSION = '1.0.0';

// Database Constants
export const DATABASE_NAME = 'cloddo.db';
export const DATABASE_VERSION = 1;

// API Constants
export const ANTHROPIC_API_BASE_URL = 'https://api.anthropic.com/v1';
export const DEFAULT_MODEL = 'claude-3-sonnet-20240229';
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.7;

export const SUPPORTED_MODELS = [
  'claude-3-5-sonnet-20241022',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
] as const;

// UI Constants
export const SIDEBAR_WIDTH = 256; // 16rem
export const HEADER_HEIGHT = 64; // 4rem
export const STATUS_BAR_HEIGHT = 32; // 2rem

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  API_KEY: 'api_key',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  CHAT_VIEW_MODE: 'chat_view_mode',
  RECENT_CHATS: 'recent_chats',
} as const;

// Event Names
export const EVENTS = {
  CHAT_MESSAGE_SENT: 'chat:message:sent',
  CHAT_MESSAGE_RECEIVED: 'chat:message:received',
  CHAT_CREATED: 'chat:created',
  CHAT_DELETED: 'chat:deleted',
  AGENT_RUN_STARTED: 'agent:run:started',
  AGENT_RUN_COMPLETED: 'agent:run:completed',
  HOOK_TRIGGERED: 'hook:triggered',
  SETTINGS_UPDATED: 'settings:updated',
  THEME_CHANGED: 'theme:changed',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key. Please check your API key and try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait before making more requests.',
  INTERNAL_ERROR: 'An internal error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'Unauthorized. Please check your credentials.',
} as const;

// File Constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['text/plain', 'text/markdown', 'application/pdf'],
} as const;

// Chat Constraints
export const CHAT_CONSTRAINTS = {
  MAX_MESSAGE_LENGTH: 100000,
  MAX_MESSAGES_PER_CHAT: 1000,
  MAX_CHAT_TITLE_LENGTH: 100,
  MAX_FOLDER_DEPTH: 10,
} as const;

// Agent Constraints
export const AGENT_CONSTRAINTS = {
  MAX_SYSTEM_PROMPT_LENGTH: 10000,
  MAX_AGENT_NAME_LENGTH: 50,
  MAX_CONCURRENT_RUNS: 5,
  MAX_RUN_DURATION: 300000, // 5 minutes
} as const;

// Hook Constraints
export const HOOK_CONSTRAINTS = {
  MAX_HOOK_NAME_LENGTH: 50,
  MAX_SCRIPT_LENGTH: 50000,
  MAX_CONCURRENT_EXECUTIONS: 10,
  MAX_EXECUTION_DURATION: 60000, // 1 minute
} as const;

// Performance Constants
export const PERFORMANCE = {
  VIRTUAL_SCROLL_ITEM_HEIGHT: 80,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_UNDO_HISTORY: 50,
} as const;

// URL Patterns
export const URL_PATTERNS = {
  HTTP_URL: /^https?:\/\/.+/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  GITHUB_REPO: /^https?:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+/,
} as const;

// Keyboard Shortcuts
export const DEFAULT_SHORTCUTS = {
  NEW_CHAT: 'CmdOrCtrl+N',
  SEARCH_CHATS: 'CmdOrCtrl+F',
  TOGGLE_SIDEBAR: 'CmdOrCtrl+B',
  TOGGLE_DARK_MODE: 'CmdOrCtrl+D',
  FOCUS_INPUT: 'CmdOrCtrl+L',
  SEND_MESSAGE: 'CmdOrCtrl+Enter',
  CLEAR_CHAT: 'CmdOrCtrl+Shift+C',
  EXPORT_CHAT: 'CmdOrCtrl+E',
  SETTINGS: 'CmdOrCtrl+,',
  QUIT: 'CmdOrCtrl+Q',
} as const;