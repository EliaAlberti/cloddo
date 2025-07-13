export interface Workflow {
  id: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig: string;
  actionType: ActionType;
  actionConfig: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TriggerType = 
  | 'chat_message_sent'
  | 'chat_message_received'
  | 'chat_created'
  | 'agent_run_completed'
  | 'file_changed'
  | 'schedule'
  | 'api_call'
  | 'custom_event';

export type ActionType = 
  | 'send_api_request'
  | 'create_file'
  | 'modify_file'
  | 'send_notification'
  | 'run_script'
  | 'trigger_agent'
  | 'send_chat_message'
  | 'custom_action';

export interface TriggerConfig {
  chatMessage?: {
    pattern?: string;
    chatId?: string;
    role?: 'user' | 'assistant' | 'system';
  };
  fileWatcher?: {
    path: string;
    pattern?: string;
    recursive?: boolean;
  };
  schedule?: {
    cron: string;
    timezone?: string;
  };
  apiCall?: {
    endpoint: string;
    method: string;
    headers?: Record<string, string>;
  };
}

export interface ActionConfig {
  apiRequest?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
  };
  file?: {
    path: string;
    content?: string;
    operation: 'create' | 'modify' | 'delete';
  };
  notification?: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  };
  script?: {
    language: 'javascript' | 'typescript' | 'python' | 'shell';
    code: string;
    timeout?: number;
  };
  agent?: {
    agentId: string;
    inputData?: Record<string, any>;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggerData?: Record<string, any>;
  resultData?: Record<string, any>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: TriggerType;
  actionType: ActionType;
  defaultConfig: {
    trigger: Record<string, any>;
    action: Record<string, any>;
  };
  variables?: WorkflowVariable[];
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description?: string;
  defaultValue?: any;
  required: boolean;
  options?: string[];
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  config: Record<string, any>;
  next?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig: Record<string, any>;
  actionType: ActionType;
  actionConfig: Record<string, any>;
}