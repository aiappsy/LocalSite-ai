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
  Settings,
  LogOut,
  User as UserIcon,
  Github
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type SidebarTab = 'chat' | 'prompts' | 'home' | 'github';

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
  { id: 'github', icon: Github, label: 'Source Control' },
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
  const { user, logout } = useAuth();

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-[#020617]/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header/Logo */}
      <div className={cn(
        "p-6 flex items-center mb-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-white uppercase opacity-90">Web Crafter</span>
              <span className="text-[10px] font-mono text-blue-400 font-bold tracking-[0.2em]">S T U D I O</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
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
                  "w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
                  isCollapsed ? "px-0 justify-center" : "px-4"
                )}
              >
                <PlusCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="text-sm">New Production Draft</span>}
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Start Fresh</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1.5">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onTabChange(item.id as SidebarTab)}
                  className={cn(
                    "w-full flex items-center rounded-xl px-3 py-2.5 transition-all relative group",
                    activeTab === item.id 
                      ? "bg-blue-600/10 text-white" 
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                    isCollapsed ? "justify-center" : "gap-3"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    activeTab === item.id ? "text-blue-400" : "text-slate-400"
                  )} />
                  {!isCollapsed && <span className="text-sm font-medium tracking-wide">{item.label}</span>}
                  {activeTab === item.id && (
                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer / Help & User & Collapse Toggle */}
      <div className="p-3 border-t border-white/5 bg-black/20 space-y-1.5">
        <TooltipProvider delayDuration={0}>
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 mb-2",
                  isCollapsed ? "justify-center" : "px-3"
                )}>
                  <Avatar className="w-7 h-7 border border-white/10 ring-1 ring-blue-500/20">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="bg-blue-600/20 text-blue-400 text-[10px] font-bold">
                      {user.displayName?.charAt(0) || <UserIcon className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate tracking-tight">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-tighter">Pro Studio Plan</p>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Studio Authorized
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenHelp}
                className={cn(
                  "w-full flex items-center rounded-xl px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all",
                  isCollapsed ? "justify-center" : "gap-3"
                )}
              >
                <HelpCircle className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-12" />
                {!isCollapsed && <span className="text-[13px] font-medium tracking-tight">Studio Guide</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              View User Manual
            </TooltipContent>
          </Tooltip>

          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                   className={cn(
                    "w-full flex items-center rounded-xl px-3 py-2 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all",
                    isCollapsed ? "justify-center" : "gap-3"
                  )}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="text-[13px] font-medium tracking-tight">Eject Session</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center rounded-xl py-2 mt-1 text-slate-500 hover:text-slate-300 transition-all bg-white/[0.02] border border-white/5"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-2 w-full px-3">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-40">Compact UI</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
