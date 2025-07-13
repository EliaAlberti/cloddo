import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MessageSquare, Plus, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainContentProps {
  onNewChat: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({ onNewChat }) => {
  const { currentChat, messages, fetchMessages, sendClaudeMessage, isLoading, error, setError } = useChatStore();
  const { settings } = useSettingsStore();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat && currentChat.id) {
      // Clear any existing errors when switching chats
      setError(null);
      fetchMessages(currentChat.id);
    }
  }, [currentChat, fetchMessages, setError]);

  // Clear errors when settings change (API key configured)
  useEffect(() => {
    if (settings?.api?.anthropicApiKey) {
      setError(null);
    }
  }, [settings?.api?.anthropicApiKey, setError]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChat || isSending) return;

    const apiKey = settings?.api?.anthropicApiKey;
    if (!apiKey) {
      setError('Please configure your Claude API key in settings first.');
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    setError(null);

    try {
      await sendClaudeMessage(currentChat.id, content, apiKey);
    } catch (err) {
      setError(err as string);
      // Restore the message if sending failed
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentChat) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Welcome to Cloddo</h2>
            <p className="text-muted-foreground">
              Start a conversation with Claude to get assistance with your projects and tasks.
            </p>
          </div>

          <Button onClick={onNewChat} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Chat header */}
      <div className="h-14 border-b border-border flex items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">{currentChat.title}</h1>
            <p className="text-sm text-muted-foreground">
              {messages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-muted-foreground">
                  Send your first message to start the conversation.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input area */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setError(null)}
                    className="mt-2 h-auto p-1 text-destructive hover:text-destructive/80"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full min-h-[80px] resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                rows={3}
                disabled={isSending || isLoading}
              />
            </div>
            <div className="flex flex-col justify-end">
              <Button 
                size="lg" 
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending || isLoading}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <span>Press Ctrl+Enter to send</span>
            <span>Powered by Claude</span>
          </div>
        </div>
      </div>
    </main>
  );
};