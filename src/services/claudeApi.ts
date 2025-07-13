import type { Message } from '@/types';

export interface ClaudeApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeApiMessage[];
  stream?: boolean;
}

export interface ClaudeApiResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeApiService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: ClaudeApiMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ClaudeApiResponse> {
    const {
      model = 'claude-3-5-sonnet-20241022',
      maxTokens = 4096,
      stream = false,
    } = options;

    const requestBody: ClaudeApiRequest = {
      model,
      max_tokens: maxTokens,
      messages,
      stream,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async* streamMessage(
    messages: ClaudeApiMessage[],
    options: {
      model?: string;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      model = 'claude-3-5-sonnet-20241022',
      maxTokens = 4096,
    } = options;

    const requestBody: ClaudeApiRequest = {
      model,
      max_tokens: maxTokens,
      messages,
      stream: true,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield parsed.delta.text;
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  convertMessagesToClaudeFormat(messages: Message[]): ClaudeApiMessage[] {
    return messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }
}

// Singleton instance
let claudeApiInstance: ClaudeApiService | null = null;

export function getClaudeApiService(apiKey?: string): ClaudeApiService {
  if (!claudeApiInstance) {
    if (!apiKey) {
      throw new Error('Claude API key is required to initialize the service');
    }
    claudeApiInstance = new ClaudeApiService(apiKey);
  }
  return claudeApiInstance;
}

export function setClaudeApiKey(apiKey: string): void {
  claudeApiInstance = new ClaudeApiService(apiKey);
}