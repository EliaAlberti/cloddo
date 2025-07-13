import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettingsStore();
  const [authMethod, setAuthMethod] = useState<'api_key' | 'oauth'>('api_key');
  const [apiKey, setApiKey] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [maxTokens, setMaxTokens] = useState(4096);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (settings?.api) {
      setAuthMethod(settings.api.authMethod || 'api_key');
      if (settings.api.anthropicApiKey) {
        setApiKey(settings.api.anthropicApiKey);
      }
      if (settings.api.anthropicOAuthToken) {
        setOauthToken(settings.api.anthropicOAuthToken);
      }
      if (settings.api.defaultModel) {
        setSelectedModel(settings.api.defaultModel);
      }
    }
    // Reset save success when modal opens
    setSaveSuccess(false);
  }, [settings, isOpen]);

  const handleOAuthLogin = async () => {
    setIsAuthenticating(true);
    try {
      // Initiate OAuth flow
      const authUrl = await invoke<string>('initiate_oauth_flow');
      
      // Open the OAuth URL in the default browser
      await invoke('open_url', { url: authUrl });
      
      // Note: In a full implementation, you'd handle the callback
      // For now, we'll show a message to the user
      alert('OAuth authentication initiated. Please complete the process in your browser and return here.');
      
    } catch (error) {
      console.error('OAuth authentication failed:', error);
      alert('OAuth authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettings({
        api: {
          authMethod,
          anthropicApiKey: authMethod === 'api_key' ? apiKey.trim() : undefined,
          anthropicOAuthToken: authMethod === 'oauth' ? oauthToken.trim() : undefined,
          defaultModel: selectedModel,
          requestTimeout: settings?.api?.requestTimeout || 30,
          maxRetries: settings?.api?.maxRetries || 3,
          rateLimit: settings?.api?.rateLimit || {
            enabled: false,
            requestsPerMinute: 60,
          },
          ...settings?.api,
        },
      });
      setSaveSuccess(true);
      // Auto-close after a brief success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-300 text-sm flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Settings saved successfully! Closing in a moment...
            </div>
          )}
          {/* Authentication Method */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Authentication Method</label>
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="radio" 
                  name="authMethod" 
                  value="api_key" 
                  checked={authMethod === 'api_key'}
                  onChange={(e) => setAuthMethod(e.target.value as 'api_key')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">API Key</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="radio" 
                  name="authMethod" 
                  value="oauth" 
                  checked={authMethod === 'oauth'}
                  onChange={(e) => setAuthMethod(e.target.value as 'oauth')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">OAuth Credentials (Recommended)</span>
              </label>
            </div>
          </div>

          {/* API Key Section */}
          {authMethod === 'api_key' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Claude API Key</label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                  >
                    Anthropic Console
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
              
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {!apiKey && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ An API key is required to send messages to Claude.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* OAuth Section */}
          {authMethod === 'oauth' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">OAuth Authentication</label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Secure authentication via Anthropic's OAuth system. No API keys needed.
                </p>
              </div>
              
              {oauthToken ? (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-300 flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    OAuth authentication active
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleOAuthLogin}
                    disabled={isAuthenticating}
                    className="w-full"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect with Anthropic
                      </>
                    )}
                  </Button>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      💡 OAuth provides secure access without exposing your API key. You'll be redirected to Anthropic to authorize this application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Default Model</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest Available)</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast & Efficient)</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus (Most Powerful)</option>
            </select>
            <div className="text-xs space-y-1">
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Current:</strong> Claude 3.5 Sonnet offers the best balance of speed and capability.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Models are automatically updated as new versions become available.
              </p>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Max Tokens</label>
            <input
              type="number"
              min="1"
              max="8192"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Maximum number of tokens to generate in the response (1-8192).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={saveSuccess ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};