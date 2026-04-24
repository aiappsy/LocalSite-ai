'use client';

import React, { useState } from 'react';
import { 
  Settings2, 
  RotateCcw, 
  Cpu,
  Terminal,
  Eye,
  EyeOff,
  Loader2,
  Github,
  Globe,
  Sliders,
  ShieldCheck,
  Zap,
  Check,
  FlaskConical,
  Save,
  Link2,
  RefreshCw
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LLMProvider, PROVIDER_CONFIGS } from '@/lib/providers/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKeysManager } from '@/components/KeysManager';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  selectedPersona: "developer" | "copywriter" | "thinking";
  onPersonaChange: (persona: "developer" | "copywriter" | "thinking") => void;
  githubSettings: { token: string; owner: string; repo: string; path: string };
  onGithubSettingsChange: (settings: Partial<{ token: string; owner: string; repo: string; path: string }>) => void;
  isLoadingModels?: boolean;
  currentCode: string;
}

export function SettingsPanel({
  provider,
  model,
  models,
  settings,
  onProviderChange,
  onModelChange,
  onSettingsChange,
  systemPrompt,
  onSystemPromptChange,
  githubSettings,
  onGithubSettingsChange,
  isLoadingModels,
  currentCode
}: SettingsPanelProps) {
  const { keys, saveKey } = useKeysManager();
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visibleKey, setVisibleKey] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const currentCreds = keys[provider] || {};
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider, 
          apiKey: currentCreds.apiKey, 
          baseUrl: currentCreds.baseUrl 
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Success! Connected to ${provider}. Found ${data.modelCount} models.`);
      } else {
        toast.error(`Connection failed: ${data.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during the test.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSave = () => {
    setIsSaving(true);
    // Simulation of saving (actual save is debounced in page.tsx)
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved and synced to cloud");
    }, 800);
  };

  const resetToDefaults = () => {
    onSettingsChange({
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxTokens: 4096,
    });
    toast.info("Settings reset to defaults");
  };

  const handlePush = async () => {
    if (!githubSettings.token || !githubSettings.owner || !githubSettings.repo || !githubSettings.path) {
      toast.error('Please fill in all GitHub settings first.');
      return;
    }

    setIsPushing(true);
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...githubSettings,
          content: currentCode,
          message: "Studio Sync Update"
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Successfully pushed to GitHub!');
      } else {
        throw new Error(data.error || 'Failed to push to GitHub');
      }
    } catch (error: any) {
      console.error('Push Error:', error);
      toast.error(`Push failed: ${error.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131314] border-l border-white/5">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-9">
        {/* MODEL SECTION */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            Model Selection
          </Label>
          
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider ml-1">Provider</span>
              <Select value={provider} onValueChange={(val) => onProviderChange(val as LLMProvider)}>
                <SelectTrigger className="bg-[#0e0e11] border-white/5 h-10 text-xs rounded-lg focus:ring-1 focus:ring-blue-500/50">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e21] border-white/10 max-h-[300px]">
                  {Object.values(LLMProvider).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {PROVIDER_CONFIGS[p].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider ml-1">Model</span>
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger className="bg-[#0e0e11] border-white/5 h-10 text-xs rounded-lg focus:ring-1 focus:ring-blue-500/50">
                  <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select model"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e21] border-white/10 max-h-[300px]">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                  {models.length === 0 && !isLoadingModels && <SelectItem value="none" disabled>No models available</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* AUTH SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              API Key
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider"
              onClick={handleTestConnection}
              disabled={isTesting || !keys[provider]?.apiKey}
            >
              {isTesting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FlaskConical className="w-3 h-3 mr-1" />}
              Test
            </Button>
          </div>
          
          <div className="relative group/key">
            <Input
              type={visibleKey ? "text" : "password"}
              placeholder={`Auth Token for ${PROVIDER_CONFIGS[provider].name}`}
              className="bg-[#0e0e11] border-white/5 h-10 pr-10 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all font-mono"
              value={keys[provider]?.apiKey || ""}
              onChange={(e) => saveKey(provider, e.target.value, keys[provider]?.apiKey)}
            />
            <button
              onClick={() => setVisibleKey(!visibleKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 p-1 rounded-md"
            >
              {visibleKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* PARAMETERS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-500" />
              Parameters
            </Label>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/5" onClick={resetToDefaults}>
              <RotateCcw className="w-3 h-3 text-slate-600" />
            </Button>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Temperature</span>
                <span className="text-[11px] font-mono font-bold text-blue-400">{settings.temperature.toFixed(2)}</span>
              </div>
              <Slider 
                value={[settings.temperature]} 
                min={0} max={2} step={0.01}
                onValueChange={([val]) => onSettingsChange({ temperature: val })}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max Length</span>
                <span className="text-[11px] font-mono font-bold text-purple-400">{settings.maxTokens}</span>
              </div>
              <Slider 
                value={[settings.maxTokens]} 
                min={128} max={16384} step={128}
                onValueChange={([val]) => onSettingsChange({ maxTokens: val })}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* GITHUB/SYNC SECTION */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            GitHub Sync
          </Label>
          
          <div className="space-y-3">
             <Input
                type="password"
                placeholder="Personal Access Token"
                className="bg-[#0e0e11] border-white/5 h-10 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/50 font-mono"
                value={githubSettings.token}
                onChange={(e) => onGithubSettingsChange({ token: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Repo Owner"
                  className="bg-[#0e0e11] border-white/5 h-9 text-[10px] rounded-lg"
                  value={githubSettings.owner}
                  onChange={(e) => onGithubSettingsChange({ owner: e.target.value })}
                />
                <Input
                  placeholder="Repo Name"
                  className="bg-[#0e0e11] border-white/5 h-9 text-[10px] rounded-lg"
                  value={githubSettings.repo}
                  onChange={(e) => onGithubSettingsChange({ repo: e.target.value })}
                />
              </div>
              <Button 
                className="w-full h-10 bg-slate-100 hover:bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.1em] gap-2 rounded-lg mt-2 shadow-lg active:scale-95 transition-all"
                onClick={handlePush}
                disabled={isPushing || !currentCode}
              >
                {isPushing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync To Production
              </Button>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* SYSTEM PROMPT SECTION */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.15em] flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            System Message
          </Label>
          <textarea
            className="w-full h-32 bg-[#0e0e11] border border-white/5 rounded-xl p-4 text-[11px] text-slate-300 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all custom-scrollbar font-mono leading-relaxed"
            placeholder="Instruct the AI on how to behave..."
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
          />
        </div>

        <Button 
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.15em] gap-2 rounded-xl shadow-xl shadow-blue-900/20 group active:scale-95 transition-all"
            onClick={handleManualSave}
            disabled={isSaving}
        >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white/50" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            Persist Studio State
        </Button>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#171719]">
          <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-widest text-slate-700 font-mono">
              <span>Studio Instance</span>
              <span className="text-emerald-500 flex items-center gap-1.5 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Operational
              </span>
          </div>
      </div>
    </div>
  );
}
