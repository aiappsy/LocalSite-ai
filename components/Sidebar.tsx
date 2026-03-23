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
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SidebarTab = 'chat' | 'prompts' | 'keys' | 'home';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'prompts', icon: Terminal, label: 'Prompts' },
  { id: 'keys', icon: Key, label: 'API Keys' },
] as const;

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  setIsCollapsed 
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
            <span className="text-lg tracking-tight">AI Studio</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
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
              {isCollapsed && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-slate-800">
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
