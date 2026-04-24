'use client';

import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Settings2, 
  Info, 
  RotateCcw, 
  ChevronDown, 
  Cpu,
  Zap,
  Shield,
  Key,
  Terminal,
  Send,
  Download,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
  Wand2,
  FlaskConical,
  TestTube2,
  Loader2,
  Github
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
  selectedPersona,
  onPersonaChange,
  githubSettings,
  onGithubSettingsChange,
  isLoadingModels,
  currentCode
}: SettingsPanelProps) {
  const { keys, saveKey } = useKeysManager();
  const [activeTab, setActiveTab] = useState("setup");
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Sync from Aiappsy WebCrafter');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (pId: string) => {
    setVisibleKeys(prev => ({ ...prev, [pId]: !prev[pId] }));
  };

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

  const applyOptimalSettings = () => {
    onProviderChange(LLMProvider.GOOGLE);
    toast.info("Applied Google AI - Gemini 1.5 Pro (Optimal Experience)");
    onSettingsChange({
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxTokens: 8192
    });
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
          message: commitMessage
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

  const handlePull = async () => {
    if (!githubSettings.token || !githubSettings.owner || !githubSettings.repo || !githubSettings.path) {
      toast.error('Please fill in all GitHub settings first.');
      return;
    }

    setIsPulling(true);
    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(githubSettings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Successfully connected to GitHub! Use the GitHub sync tab to import code.');
      } else {
        throw new Error(data.error || 'Failed to connect to GitHub');
      }
    } catch (error: any) {
      console.error('Connection Error:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131314] w-full overflow-hidden border-l border-white/5">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#131314]">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Control Plane</h2>
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 rounded-md hover:bg-white/5 transition-colors"
                        onClick={resetToDefaults}
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Reset to Defaults</TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
        
        {/* SECTION: SYSTEM INSTRUCTIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
              <Label className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.1em] flex items-center gap-2">
                <Terminal className="w-3 h-3 text-blue-500/80" />
                System Instructions
              </Label>
              <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.02] border-white/5 text-slate-600 font-mono">CORE</Badge>
          </div>
          <div className="relative group">
              <div className="absolute -inset-px bg-gradient-to-b from-blue-600/20 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                className="relative w-full h-32 bg-[#0e0e11] border border-white/5 rounded-lg p-3 text-[11px] text-slate-300 focus:border-blue-500/30 outline-none resize-none transition-all scrollbar-hide font-mono leading-relaxed"
                placeholder="Direct the AI's behavior and personality..."
                value={systemPrompt}
                onChange={(e) => onSystemPromptChange(e.target.value)}
              />
          </div>
        </div>

        {/* SECTION: MODEL SELECTION */}
        <div className="space-y-4 pt-2">
          <Label className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.1em] px-1 flex items-center gap-2">
            <Cpu className="w-3 h-3 text-emerald-500/80" />
            Model Configuration
          </Label>
          
          <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="space-y-2">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider ml-1">Provider</span>
              <Select value={provider} onValueChange={(val) => onProviderChange(val as LLMProvider)}>
                <SelectTrigger className="bg-[#0e0e11]/50 border-white/5 h-9 text-xs rounded-lg focus:ring-1 focus:ring-blue-500/30">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e21] border-white/10">
                  {Object.values(LLMProvider).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {PROVIDER_CONFIGS[p].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider ml-1">Model ID</span>
              <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger className="bg-[#0e0e11]/50 border-white/5 h-9 text-xs rounded-lg focus:ring-1 focus:ring-blue-500/30">
                  <SelectValue placeholder={isLoadingModels ? "Loading..." : "Select model"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e21] border-white/10">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                  {models.length === 0 && !isLoadingModels && <SelectItem value="none" disabled>No models found</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* API Key Inline */}
            <div className="space-y-2 pt-2">
               <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider ml-1">API Key</span>
               <div className="relative group">
                <Input
                  type={visibleKeys[provider] ? "text" : "password"}
                  placeholder={`Secret Key...`}
                  className="bg-[#0e0e11]/50 border-white/5 h-9 pr-10 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/30"
                  value={keys[provider]?.apiKey || ""}
                  onChange={(e) => saveKey(provider, e.target.value, keys[provider]?.baseUrl)}
                />
                <button
                  onClick={() => toggleKeyVisibility(provider)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {visibleKeys[provider] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: PARAMETERS */}
        <div className="space-y-6 pt-2">
          <Label className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.1em] px-1 flex items-center gap-2">
            <Settings2 className="w-3 h-3 text-purple-500/80" />
            Execution Parameters
          </Label>

          <div className="space-y-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            {/* Temperature */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</span>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{settings.temperature.toFixed(2)}</span>
              </div>
              <Slider 
                value={[settings.temperature]} 
                min={0} max={2} step={0.01}
                onValueChange={([val]) => onSettingsChange({ temperature: val })}
                className="py-1 cursor-pointer"
              />
            </div>

            {/* Top P */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top P</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{settings.topP.toFixed(2)}</span>
              </div>
              <Slider 
                value={[settings.topP]} 
                min={0} max={1} step={0.01}
                onValueChange={([val]) => onSettingsChange({ topP: val })}
                className="py-1 cursor-pointer"
              />
            </div>

             {/* Max Output Tokens */}
             <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max tokens</span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">{settings.maxTokens}</span>
              </div>
              <Slider 
                value={[settings.maxTokens]} 
                min={1} max={16384} step={1}
                onValueChange={([val]) => onSettingsChange({ maxTokens: val })}
                className="py-1 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECTION: GITHUB SYNC */}
        <div className="space-y-4 pt-2">
          <Label className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.1em] px-1 flex items-center gap-2">
            <Github className="w-3 h-3 text-slate-400" />
            GitHub Persistence
          </Label>
          
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider ml-1">Access Token</span>
                  <Input
                    type="password"
                    placeholder="ghp_..."
                    className="bg-[#0e0e11]/50 border-white/5 h-9 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/30"
                    value={githubSettings.token}
                    onChange={(e) => onGithubSettingsChange({ token: e.target.value })}
                  />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider ml-1">Owner</span>
                    <Input
                      placeholder="Username"
                      className="bg-[#0e0e11]/50 border-white/5 h-9 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/30"
                      value={githubSettings.owner}
                      onChange={(e) => onGithubSettingsChange({ owner: e.target.value })}
                    />
                </div>
                <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider ml-1">Repository</span>
                    <Input
                      placeholder="repo-name"
                      className="bg-[#0e0e11]/50 border-white/5 h-9 text-[11px] rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500/30"
                      value={githubSettings.repo}
                      onChange={(e) => onGithubSettingsChange({ repo: e.target.value })}
                    />
                </div>
              </div>
            </div>

            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-500 h-9 text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg shadow-lg active:scale-95 transition-all"
              onClick={handlePush}
              disabled={isPushing || !currentCode}
            >
              {isPushing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sync to Production"}
            </Button>
          </div>
        </div>

        <div className="h-20" /> {/* Extra scroll space */}

      </div>
    </div>
  );
}
