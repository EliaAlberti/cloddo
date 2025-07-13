// Anthropic API Types
export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'image';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  system?: string;
  stream?: boolean;
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AnthropicStreamChunk {
  type: 'message_start' | 'message_delta' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_stop';
  message?: Partial<AnthropicResponse>;
  delta?: {
    text?: string;
    stop_reason?: string;
  };
  content_block?: ContentBlock;
  index?: number;
}

// MCP Types
export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// API Client Types
export interface APIClient {
  sendMessage(request: AnthropicRequest): Promise<AnthropicResponse>;
  streamMessage(request: AnthropicRequest): AsyncGenerator<AnthropicStreamChunk>;
  listModels(): Promise<string[]>;
  validateApiKey(apiKey: string): Promise<boolean>;
}

export interface APIError {
  type: 'authentication_error' | 'permission_error' | 'not_found_error' | 'rate_limit_error' | 'api_error' | 'overloaded_error' | 'invalid_request_error';
  message: string;
  code?: string;
  statusCode?: number;
  retryAfter?: number;
}

// Request/Response Types
export interface ChatRequest {
  chatId: string;
  message: string;
  context?: {
    systemPrompt?: string;
    previousMessages?: Array<{
      id: string;
      chatId: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
      createdAt: string;
    }>;
    attachments?: FileAttachment[];
  };
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}

export interface ChatResponse {
  messageId: string;
  content: string;
  metadata: {
    model: string;
    tokenUsage: {
      input: number;
      output: number;
      total: number;
    };
    responseTime: number;
    finishReason: string;
  };
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // base64 encoded
  url?: string;
}

// Rate Limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Authentication
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: 'bearer';
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
}

// API Configuration
export interface APIConfiguration {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retryConfig: {
    maxRetries: number;
    backoffFactor: number;
    maxBackoffTime: number;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
  };
}