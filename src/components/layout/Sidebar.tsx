import React from 'react';
import { MessageSquare, Bot, Workflow, Folder, Archive, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { chats, currentChat, setCurrentChat, viewMode, setViewMode } = useChatStore();

  const navItems = [
    { icon: MessageSquare, label: 'Chats', active: true },
    { icon: Bot, label: 'Agents' },
    { icon: Workflow, label: 'Workflows' },
    { icon: Folder, label: 'Projects' },
  ];

  const folders = [
    { icon: Star, label: 'Favorites', count: 3 },
    { icon: Archive, label: 'Archived', count: 12 },
    { icon: Trash2, label: 'Trash', count: 5 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-background border-r border-border transform transition-transform z-50',
          'md:relative md:top-0 md:h-full md:transform-none md:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="p-4 border-b border-border">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant={item.active ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  size="sm"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>

          {/* View mode toggle */}
          <div className="p-4 border-b border-border">
            <div className="flex rounded-lg bg-muted p-1">
              {(['grid', 'list', 'compact'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    viewMode === mode
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Folders */}
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Folders</h3>
            <div className="space-y-1">
              {folders.map((folder) => (
                <Button
                  key={folder.label}
                  variant="ghost"
                  className="w-full justify-between"
                  size="sm"
                >
                  <div className="flex items-center">
                    <folder.icon className="h-4 w-4 mr-3" />
                    {folder.label}
                  </div>
                  <span className="text-xs text-muted-foreground">{folder.count}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Chats</h3>
            <div className="space-y-1">
              {chats.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No chats yet. Create your first chat to get started.
                </div>
              ) : (
                chats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChat?.id === chat.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setCurrentChat(chat)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="font-medium text-sm truncate w-full text-left">
                        {chat.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate w-full text-left">
                        {new Date(chat.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};