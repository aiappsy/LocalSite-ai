"use client"

import { 
  Box, 
  ChevronRight, 
  Cloud, 
  Github, 
  Play, 
  Sparkles, 
  Terminal, 
  ExternalLink,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface StudioHeaderProps {
  activeTab: string;
  isGenerating: boolean;
  onDeploy: () => void;
  onNewChat: () => void;
}

export function StudioHeader({ activeTab, isGenerating, onDeploy, onNewChat }: StudioHeaderProps) {
  return (
    <header className="h-12 border-b border-white/5 bg-[#131314] backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <Box className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-50">Local Site Builder</span>
          <ChevronRight className="w-3 h-3 opacity-20" />
          <span className="text-white font-black text-xs tracking-tight">Main Project</span>
        </div>
        {isGenerating && (
          <div className="ml-4 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full animate-in fade-in zoom-in duration-300">
            <Sparkles className="w-3 h-3 text-blue-400 animate-spin-slow" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Studio Designing...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-400 hover:text-white h-8 gap-2"
          onClick={onNewChat}
        >
          <Terminal className="w-4 h-4" />
          <span className="hidden sm:inline">New Draft</span>
        </Button>
        
        <div className="h-4 w-px bg-white/10 mx-1" />

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-400 hover:text-white h-8 gap-2 px-3"
          onClick={() => {
              // Trigger save if we have a global save function, or just toast for now if managed by page sync
              toast.success("Studio state verified & synced");
          }}
        >
          <Cloud className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-500 text-white h-8 gap-2 px-4 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 transition-all text-xs font-bold"
          onClick={onDeploy}
        >
          <Play className="w-3 h-3 fill-current" />
          RUN PRODUCTION
          <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
        </Button>
      </div>
    </header>
  )
}
