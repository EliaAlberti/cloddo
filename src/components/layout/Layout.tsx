import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { StatusBar } from './StatusBar';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useChatStore } from '@/stores/chatStore';
import { useSettingsStore } from '@/stores/settingsStore';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { createChat, fetchChats, setCurrentChat, messages } = useChatStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
    fetchChats();
  }, [loadSettings, fetchChats]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createChat({
        sessionId: 'default-session',
        title: 'New Chat',
        folderPath: undefined,
        tags: [],
        metadata: {},
      });
      // Automatically select the newly created chat
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const totalMessages = messages.length;
  const tokenUsage = messages.reduce((total, msg) => total + (msg.tokenCount || 0), 0);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Header
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={handleOpenSettings}
        onNewChat={handleNewChat}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <MainContent onNewChat={handleNewChat} />
      </div>
      
      <StatusBar
        isConnected={true}
        lastSync={new Date()}
        messageCount={totalMessages}
        tokenUsage={tokenUsage}
      />

      {/* Settings modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};