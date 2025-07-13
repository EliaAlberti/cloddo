// Re-export all types for easy importing
export * from './chat';
export * from './agent';
export * from './workflow';
export * from './settings';
export * from './api';

// Common utility types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface DatabaseMigration {
  version: number;
  name: string;
  up: string;
  down: string;
  appliedAt?: string;
}

export interface AppMetadata {
  version: string;
  buildDate: string;
  commitHash: string;
  environment: 'development' | 'production' | 'test';
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  totalMemory: number;
  freeMemory: number;
  cpuCount: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  chats: any[];
  sessions: any[];
  agents: any[];
  hooks: any[];
  settings: any;
}

export interface ImportResult {
  success: boolean;
  imported: {
    chats: number;
    sessions: number;
    agents: number;
    hooks: number;
  };
  errors: string[];
}

export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'grid' | 'list' | 'compact';
export type SortOrder = 'asc' | 'desc';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  createdAt: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}