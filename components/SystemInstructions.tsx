'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Sparkles,
  Info,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SystemInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function SystemInstructions({
  value,
  onChange,
  isOpen,
  onToggle
}: SystemInstructionsProps) {
  return (
    <div className={cn(
      "border-b border-slate-800 transition-all duration-300 ease-in-out",
      isOpen ? "bg-slate-900/40" : "bg-transparent"
    )}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded flex items-center justify-center transition-colors",
            isOpen ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-400"
          )}>
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">System Instructions</h3>
            {!isOpen && (
              <p className="text-xs text-slate-500 truncate max-w-[400px]">
                {value || "Add instructions to guide the model's behavior..."}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-400">
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Pro tip: Use system instructions to set the persona and constraints of the AI.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. You are a helpful assistant that writes clean, modern React code using Tailwind CSS..."
              className="min-h-[120px] bg-slate-950 border-slate-700 focus-visible:ring-blue-600 text-sm py-3 px-4 leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1 text-[10px] text-slate-500">
              <Sparkles className="w-3 h-3 text-blue-500/50" />
              <span>Model behavior controller</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
             <div className="p-1 px-2 rounded bg-slate-800/50 text-[10px] font-medium text-slate-400 flex items-center gap-1.5 hover:text-slate-300 cursor-help border border-slate-700/50 transition-colors">
               <Info className="w-3 h-3" />
               Markdown support enabled
             </div>
             <Button 
                variant="link" 
                className="text-[10px] text-blue-500 h-auto p-0 hover:text-blue-400"
                onClick={() => onChange("")}
             >
               Clear all instructions
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
