export interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  modelConfig: ModelConfig;
  scheduleConfig?: ScheduleConfig;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ScheduleConfig {
  type: 'cron' | 'interval' | 'manual';
  expression?: string; // cron expression
  interval?: number; // milliseconds for interval
  timezone?: string;
  enabled: boolean;
}

export interface AgentRun {
  id: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  modelConfig: ModelConfig;
  variables?: AgentVariable[];
  tags: string[];
}

export interface AgentVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description?: string;
  defaultValue?: any;
  required: boolean;
  options?: string[]; // for select type
}

export interface AgentMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRuntime: number;
  lastRun?: string;
  nextRun?: string;
}

export type AgentStatus = 'idle' | 'running' | 'scheduled' | 'disabled' | 'error';

export interface CreateAgentRequest {
  name: string;
  description?: string;
  systemPrompt: string;
  modelConfig: ModelConfig;
  scheduleConfig?: ScheduleConfig;
  enabled?: boolean;
}