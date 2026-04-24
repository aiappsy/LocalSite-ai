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

interface StudioHeaderProps {
  activeTab: string;
  isGenerating: boolean;
  onDeploy: () => void;
  onNewChat: () => void;
}

export function StudioHeader({ activeTab, isGenerating, onDeploy, onNewChat }: StudioHeaderProps) {
  return (
    <header className="h-12 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Box className="w-4 h-4" />
          <span>Projects</span>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-slate-200">New Website Masterpiece</span>
        </div>
        {isGenerating && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse ml-4 gap-1.5 h-6">
            <Sparkles className="w-3 h-3" />
            Studio is Designing...
          </Badge>
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
          New Draft
        </Button>
        
        <div className="h-4 w-px bg-white/10 mx-1" />

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-400 hover:text-white h-8 gap-2"
        >
          <Github className="w-4 h-4" />
          Sync
        </Button>

        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-500 text-white h-8 gap-2 px-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          onClick={onDeploy}
        >
          <Play className="w-3 h-3 fill-current" />
          Run in Production
          <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
        </Button>
      </div>
    </header>
  )
}
