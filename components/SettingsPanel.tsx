'use client';

import React from 'react';
import { 
  Settings2, 
  Info, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Zap,
  Shield
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LLMProvider, PROVIDER_CONFIGS } from '@/lib/providers/config';
import { Button } from '@/components/ui/button';

export interface ModelSettings {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  stopSequences: string[];
  safetySettings: 'none' | 'low' | 'medium' | 'high';
}

interface SettingsPanelProps {
  provider: LLMProvider;
  model: string;
  models: { id: string; name: string }[];
  settings: ModelSettings;
  onProviderChange: (provider: LLMProvider) => void;
  onModelChange: (model: string) => void;
  onSettingsChange: (settings: Partial<ModelSettings>) => void;
  isLoadingModels?: boolean;
}

export function SettingsPanel({
  provider,
  model,
  models,
  settings,
  onProviderChange,
  onModelChange,
  onSettingsChange,
  isLoadingModels
}: SettingsPanelProps) {
  
  const resetToDefaults = () => {
    onSettingsChange({
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxTokens: 4096,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-400" />
          Model Settings
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-500 hover:text-slate-200"
          onClick={resetToDefaults}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-5 space-y-8">
        {/* Provider & Model Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Provider
            </Label>
            <Select value={provider} onValueChange={(val) => onProviderChange(val as LLMProvider)}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-xs h-9">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {Object.values(LLMProvider).map((p) => (
                  <SelectItem key={p} value={p} className="text-xs">
                    {PROVIDER_CONFIGS[p].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> Model
            </Label>
            <Select value={model} onValueChange={onModelChange} disabled={isLoadingModels}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-xs h-9">
                <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select model"} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-6">
          {/* Temperature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                Temperature
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      Controls randomness. Lower values are more deterministic, higher values are more creative.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-blue-400">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <Slider 
              value={[settings.temperature]} 
              min={0} 
              max={2} 
              step={0.01}
              onValueChange={([val]) => onSettingsChange({ temperature: val })}
              className="py-2"
            />
          </div>

          {/* Top P */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                Top P
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      Nucleus sampling: limits the model to a subset of tokens whose cumulative probability exceeds P.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-blue-400">
                {settings.topP.toFixed(2)}
              </span>
            </div>
            <Slider 
              value={[settings.topP]} 
              min={0} 
              max={1} 
              step={0.01}
              onValueChange={([val]) => onSettingsChange({ topP: val })}
              className="py-2"
            />
          </div>

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                Output Length
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-slate-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">
                      Maximum number of tokens the model can generate in a single response.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-blue-400">
                {settings.maxTokens}
              </span>
            </div>
            <Slider 
              value={[settings.maxTokens]} 
              min={1} 
              max={8192} 
              step={128}
              onValueChange={([val]) => onSettingsChange({ maxTokens: val })}
              className="py-2"
            />
          </div>
        </div>

        {/* Safety Settings Section (Google AI Studio specific vibe) */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
           <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Safety Settings
            </Label>
            <div className="space-y-3">
               <Select 
                value={settings.safetySettings} 
                onValueChange={(val) => onSettingsChange({ safetySettings: val as any })}
               >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-xs h-9">
                  <SelectValue placeholder="Select filter level" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="none" className="text-xs">Off</SelectItem>
                  <SelectItem value="low" className="text-xs">Low</SelectItem>
                  <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                  <SelectItem value="high" className="text-xs">High</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 leading-normal italic">
                Safety settings help prevent the model from generating harmful content.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
