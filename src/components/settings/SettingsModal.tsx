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
  const [authMethod] = useState<'api_key'>('api_key'); // OAuth disabled
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [maxTokens, setMaxTokens] = useState(4096);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<boolean | null>(null);

  useEffect(() => {
    // Always use API key method since OAuth is not supported
    
    if (settings?.api) {
      if (settings.api.anthropicApiKey) {
        setApiKey(settings.api.anthropicApiKey);
      }
      if (settings.api.defaultModel) {
        setSelectedModel(settings.api.defaultModel);
      }
    }
    // Reset save success when modal opens
    setSaveSuccess(false);
    setKeyValidationResult(null);
  }, [settings, isOpen]);

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      setKeyValidationResult(false);
      return;
    }

    setIsValidatingKey(true);
    setKeyValidationResult(null);
    
    try {
      // First, save the current API key to settings so validation uses the actual stored value
      const tempApiSettings = {
        authMethod,
        defaultModel: selectedModel,
        requestTimeout: 30,
        maxRetries: 3,
        rateLimit: {
          enabled: false,
          requestsPerMinute: 60,
        },
        anthropicApiKey: apiKey.trim(),
        // Preserve existing optional values if they exist
        ...(settings?.api?.anthropicBaseUrl && { anthropicBaseUrl: settings.api.anthropicBaseUrl }),
        ...(settings?.api?.proxy && { proxy: settings.api.proxy }),
      };
      
      const settingsUpdate = { api: tempApiSettings };
      await updateSettings(settingsUpdate);
      
      // Now validate the stored key (this will match what the chat functionality uses)
      const isValid = await invoke<boolean>('validate_api_key', { 
        api_key: apiKey.trim() 
      });
      
      console.log('🔑 Validation result:', isValid);
      setKeyValidationResult(isValid);
    } catch (error) {
      console.error('❌ API key validation error:', error);
      setKeyValidationResult(false);
    } finally {
      setIsValidatingKey(false);
    }
  };


  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      console.log('=== SAVE DEBUG START ===');
      console.log('Current apiKey state:', { length: apiKey.length, value: apiKey });
      console.log('Current authMethod:', authMethod);
      console.log('Current settings.api:', settings?.api);

      // Prepare API settings - preserve existing values and only update what's changed
      const apiSettings = {
        authMethod,
        defaultModel: selectedModel,
        requestTimeout: 30,
        maxRetries: 3,
        rateLimit: {
          enabled: false,
          requestsPerMinute: 60,
        },
        // Preserve existing optional values if they exist
        ...(settings?.api?.anthropicApiKey && { anthropicApiKey: settings.api.anthropicApiKey }),
        ...(settings?.api?.anthropicBaseUrl && { anthropicBaseUrl: settings.api.anthropicBaseUrl }),
        ...(settings?.api?.proxy && { proxy: settings.api.proxy }),
      };

      console.log('Base API settings prepared:', apiSettings);

      // Always save the API key if it's been entered (regardless of auth method)
      if (apiKey.trim()) {
        apiSettings.anthropicApiKey = apiKey.trim();
        console.log('✅ API key added to settings, length:', apiKey.trim().length);
        console.log('First 15 chars:', apiKey.trim().substring(0, 15));
      } else {
        console.log('❌ API key is empty or whitespace, not saving');
      }


      console.log('Final API settings before save:', { 
        authMethod: apiSettings.authMethod, 
        hasApiKey: !!apiSettings.anthropicApiKey,
        apiKeyLength: apiSettings.anthropicApiKey?.length || 0
      });

      const settingsUpdate = {
        api: apiSettings,
      };
      console.log('About to call updateSettings with:', settingsUpdate);

      await updateSettings(settingsUpdate);
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
                  checked={true}
                  disabled={true}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">API Key (Required)</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm opacity-50 cursor-not-allowed">
                <input 
                  type="radio" 
                  name="authMethod" 
                  value="oauth" 
                  checked={false}
                  disabled={true}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-500 dark:text-gray-500">OAuth (Not supported for third-party applications)</span>
              </label>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 Anthropic's Claude API only supports API key authentication for desktop applications. OAuth is reserved for MCP servers and internal tools.
              </p>
            </div>
          </div>

          {/* API Key Section */}
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
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setKeyValidationResult(null); // Reset validation when key changes
                    }}
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
                
                {apiKey && (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleValidateApiKey}
                      disabled={isValidatingKey || !apiKey.trim()}
                      className="text-xs"
                    >
                      {isValidatingKey ? (
                        <>
                          <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-gray-300 border-r-transparent" />
                          Validating...
                        </>
                      ) : (
                        'Validate Key'
                      )}
                    </Button>
                    
                    {keyValidationResult !== null && (
                      <div className={`text-xs flex items-center ${
                        keyValidationResult ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {keyValidationResult ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Valid
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Invalid
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!apiKey && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    ⚠️ An API key is required to send messages to Claude.
                  </p>
                </div>
              )}
            </div>


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