'use client';

import React from 'react';
import { 
  MessageSquare, 
  Terminal, 
  Settings2, 
  Key, 
  Home,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  PlusCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SidebarTab = 'chat' | 'prompts' | 'home';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenHelp: () => void;
  onNewChat: () => void;
  onToggleSettings: () => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'prompts', icon: Terminal, label: 'Prompts' },
] as const;

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  setIsCollapsed,
  onOpenHelp,
  onNewChat,
  onToggleSettings
}: SidebarProps) {
  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header/Logo */}
      <div className={cn(
        "p-4 flex items-center mb-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg tracking-tight">Aiappsy WebCrafter</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-6">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onNewChat}
                className={cn(
                  "w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95",
                  isCollapsed ? "px-0 justify-center" : "px-4"
                )}
              >
                <PlusCircle className="w-5 h-5" />
                {!isCollapsed && <span>New Chat</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Start Fresh</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 space-y-2">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onTabChange(item.id as SidebarTab)}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-2 transition-colors",
                    activeTab === item.id 
                      ? "bg-blue-600/10 text-blue-400 group" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                    isCollapsed ? "justify-center" : "gap-3"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    activeTab === item.id ? "text-blue-400" : "text-slate-400 transition-colors"
                  )} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer / Help & Collapse Toggle */}
      <div className="p-2 border-t border-slate-800 space-y-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSettings}
                className={cn(
                  "w-full flex items-center rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">Model Settings</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Configure Model
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenHelp}
                className={cn(
                  "w-full flex items-center rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <HelpCircle className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">Help & Manual</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              View User Manual
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
            <div className="flex items-center gap-3 w-full px-1">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium italic">Collapse sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
