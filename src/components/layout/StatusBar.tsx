import React from 'react';
import { Wifi, WifiOff, Database, Activity, Clock } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

interface StatusBarProps {
  isConnected: boolean;
  lastSync?: Date;
  messageCount?: number;
  tokenUsage?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isConnected = true,
  lastSync,
  messageCount = 0,
  tokenUsage = 0,
}) => {
  const { settings } = useSettingsStore();

  if (!settings?.appearance.showStatusBar) {
    return null;
  }

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTokens = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <footer className="h-6 bg-muted/50 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center space-x-4">
        {/* Connection status */}
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
          <span>{isConnected ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Database status */}
        <div className="flex items-center space-x-1">
          <Database className="h-3 w-3" />
          <span>{messageCount} messages</span>
        </div>

        {/* Token usage */}
        <div className="flex items-center space-x-1">
          <Activity className="h-3 w-3" />
          <span>{formatTokens(tokenUsage)} tokens</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Last sync */}
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Synced {formatLastSync(lastSync)}</span>
        </div>

        {/* Current model */}
        <div>
          Model: {settings?.api.defaultModel?.split('-').slice(-1)[0] || 'claude'}
        </div>
      </div>
    </footer>
  );
};