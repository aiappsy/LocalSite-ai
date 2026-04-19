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
  ShieldCheck
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
    <div className="flex flex-col h-full bg-slate-950 w-full overflow-hidden border-l border-slate-800 shadow-2xl">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900 h-9 p-1">
            <TabsTrigger value="setup" className="text-[10px] h-7 uppercase font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Zap className="w-3 h-3 mr-1.5" /> Setup
            </TabsTrigger>
            <TabsTrigger value="system" className="text-[10px] h-7 uppercase font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Terminal className="w-3 h-3 mr-1.5" /> System
            </TabsTrigger>
            <TabsTrigger value="model" className="text-[10px] h-7 uppercase font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Cpu className="w-3 h-3 mr-1.5" /> Model
            </TabsTrigger>
            <TabsTrigger value="params" className="text-[10px] h-7 uppercase font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <Wand2 className="w-3 h-3 mr-1.5" /> Build
            </TabsTrigger>
            <TabsTrigger value="github" className="text-[10px] h-7 uppercase font-bold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> 
              GitHub
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          
          {/* STEP 1: CREDENTIALS & API */}
          <TabsContent value="setup" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-900/30 bg-blue-900/5 space-y-3 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  Optimal Setup Advice
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For the best code generation, high-speed vision, and reasoning, we recommend using 
                  <span className="text-blue-300 font-bold mx-1">Google AI (Gemini 1.5 Pro)</span>.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-blue-900/50 hover:bg-blue-900/20 text-blue-300 h-8 text-[10px] font-bold uppercase tracking-wider"
                  onClick={applyOptimalSettings}
                >
                  Apply Optimal Configuration
                </Button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configure Provider</Label>
                </div>
                
                <Select value={provider} onValueChange={(val) => onProviderChange(val as LLMProvider)}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-10 shadow-inner">
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

                <div className="space-y-4 pt-4 border-t border-slate-900">
                   <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">API Key</Label>
                        <a 
                          href={provider === LLMProvider.GOOGLE ? "https://aistudio.google.com/app/apikey" : "https://openrouter.ai/keys"} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Get Key <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <div className="relative">
                        <Input
                          type={visibleKeys[provider] ? "text" : "password"}
                          placeholder={`Enter ${PROVIDER_CONFIGS[provider].name} Key...`}
                          className="bg-slate-900 border-slate-800 h-10 pr-10 text-xs focus-visible:ring-blue-500"
                          value={keys[provider]?.apiKey || ""}
                          onChange={(e) => saveKey(provider, e.target.value, keys[provider]?.baseUrl)}
                        />
                        <button
                          onClick={() => toggleKeyVisibility(provider)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {visibleKeys[provider] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                   </div>

                   {provider === LLMProvider.OPENAI_COMPATIBLE && (
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Base URL</Label>
                        <Input
                          placeholder="https://api.example.com/v1"
                          className="bg-slate-900 border-slate-800 h-10 text-xs focus-visible:ring-blue-500"
                          value={keys[provider]?.baseUrl || ""}
                          onChange={(e) => saveKey(provider, keys[provider]?.apiKey, e.target.value)}
                        />
                      </div>
                   )}

                   <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleTestConnection} 
                        disabled={isTesting || !keys[provider]?.apiKey}
                        className="flex-1 bg-slate-900 border-slate-800 hover:bg-slate-800 text-xs h-10 gap-2 font-semibold"
                        variant="outline"
                      >
                        {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5 text-blue-400" />}
                        Test Connection
                      </Button>
                      <Button 
                        onClick={() => toast.success("Configuration successfully saved locally.")}
                        className="bg-blue-600 hover:bg-blue-500 text-xs h-10 gap-2 px-4 shadow-lg shadow-blue-900/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </Button>
                   </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={() => setActiveTab("model")}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 h-12 text-xs font-bold uppercase tracking-wider gap-2 shadow-xl"
                >
                  Next Step: Choose Model
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* STEP 2: SYSTEM INSTRUCTIONS */}
          <TabsContent value="system" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-900/30 bg-blue-900/5 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <Terminal className="w-4 h-4" />
                  System Instructions
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guide the model's behavior, tone, and technical constraints. This prompt is sent with every message.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                    Agent Persona
                  </Label>
                </div>
                <Select value={selectedPersona} onValueChange={(val) => onPersonaChange(val as any)}>
                  <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-10 shadow-inner">
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 border-blue-900/20">
                    <SelectItem value="developer" className="text-xs cursor-pointer focus:bg-blue-600/10">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-medium">Innovative Developer</span>
                        <Badge variant="outline" className="text-[8px] h-3 px-1 border-blue-900/50 text-blue-500 uppercase">Default</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="copywriter" className="text-xs cursor-pointer focus:bg-purple-600/10">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-medium">Expert Copywriter</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="thinking" className="text-xs cursor-pointer focus:bg-amber-600/10">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium">Deep Reasoning</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-500 italic">
                  Switching personas changes the AI's core logic and creative focus.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                    System Instructions
                  </Label>
                </div>
                <textarea
                  className="w-full h-64 bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none custom-scrollbar"
                  placeholder="e.g. You are an expert web developer specializing in clean, minimalist design..."
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 italic">
                  Tip: Be specific about the desired tech stack (e.g. "Use Tailwind CSS and Lucide icons").
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setActiveTab("model")}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 h-12 text-xs font-bold uppercase tracking-wider gap-2 shadow-xl"
                >
                  Continue to Model Selection
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* STEP 3: MODEL SELECTION */}
          <TabsContent value="model" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Engine Selection
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {models.length > 0 ? (
                    models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModelChange(m.id);
                          toast.success(`Selected ${m.name}`);
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                          model === m.id 
                            ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                            : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-sm font-semibold",
                            model === m.id ? "text-blue-400" : "text-slate-200"
                          )}>
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {m.id}
                          </span>
                        </div>
                        {model === m.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-900 rounded-2xl">
                      <p className="text-xs text-slate-500">No models available for this provider.</p>
                      <Button variant="link" className="text-blue-400 h-auto p-0 mt-2 text-xs" onClick={() => setActiveTab("setup")}>
                        Check credentials →
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Button 
                  onClick={() => setActiveTab("params")}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 h-12 text-xs font-bold uppercase tracking-wider gap-2 shadow-xl"
                >
                  Next: Fine-tune Parameters
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setActiveTab("setup")}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs h-10"
                >
                  <ChevronDown className="w-4 h-4 rotate-90 mr-2" />
                  Back to Setup
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* STEP 3: ADVANCED PARAMETERS */}
          <TabsContent value="params" className="mt-0 space-y-10 animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fine-tuning</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-[10px] text-slate-400 hover:text-blue-400 gap-1.5"
                onClick={resetToDefaults}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </Button>
            </div>

            <div className="space-y-10">
              {/* Temperature */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Creativity</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-500" /></TooltipTrigger>
                        <TooltipContent side="right">Higher = more creative, Lower = more stable.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
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

              {/* Max Tokens */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Max Content Length</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-500" /></TooltipTrigger>
                        <TooltipContent side="right">Maximum tokens per generation.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                    {settings.maxTokens}
                  </span>
                </div>
                <Slider 
                  value={[settings.maxTokens]} 
                  min={1} 
                  max={16384} 
                  step={128}
                  onValueChange={([val]) => onSettingsChange({ maxTokens: val })}
                  className="py-2"
                />
              </div>

              {/* Safety */}
              <div className="pt-6 border-t border-slate-900 space-y-4">
                 <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> Content Safety
                  </Label>
                  <Select 
                    value={settings.safetySettings} 
                    onValueChange={(val) => onSettingsChange({ safetySettings: val as any })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-xs h-10 shadow-inner">
                      <SelectValue placeholder="Select filter level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800">
                      <SelectItem value="none" className="text-xs">Off</SelectItem>
                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-xs">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                    Filter level for harmful or sensitive topics in the generated code.
                  </p>
              </div>
            </div>

            <div className="pt-4">
               <Button 
                onClick={() => toast.success("Configuration updated and ready to build!")}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 text-sm font-bold uppercase tracking-wider gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
               >
                 Ready to Build
                 <Zap className="w-4 h-4 fill-white" />
               </Button>
            </div>
          </TabsContent>
          <TabsContent value="github" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-white font-bold text-sm mb-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-400"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub Configuration
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Personal Access Token</Label>
                    <div className="relative">
                      <Input 
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="bg-slate-950 border-slate-800 h-9 text-xs"
                        value={githubSettings.token}
                        onChange={(e) => onGithubSettingsChange({ token: e.target.value })}
                      />
                      <Key className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-600">Requires 'repo' scope for push/pull.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Owner (User/Org)</Label>
                      <Input 
                        placeholder="e.g. facebook"
                        className="bg-slate-950 border-slate-800 h-9 text-xs"
                        value={githubSettings.owner}
                        onChange={(e) => onGithubSettingsChange({ owner: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Repository Name</Label>
                      <Input 
                        placeholder="e.g. react"
                        className="bg-slate-950 border-slate-800 h-9 text-xs"
                        value={githubSettings.repo}
                        onChange={(e) => onGithubSettingsChange({ repo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Target File Path</Label>
                    <Input 
                      placeholder="e.g. index.html or src/index.html"
                      className="bg-slate-950 border-slate-800 h-9 text-xs"
                      value={githubSettings.path}
                      onChange={(e) => onGithubSettingsChange({ path: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Two-way synchronization allows you to <span className="text-blue-400 font-bold">Push</span> current code to GitHub or <span className="text-blue-400 font-bold">Pull</span> existing code from a repository. This is great for version control and collaborating on designs.
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sync Operations</Label>
                <div className="space-y-3 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <Input
                    placeholder="Commit message..."
                    className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs h-8"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
                    onClick={handlePush}
                    disabled={isPushing || !currentCode}
                  >
                    {isPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Push Code to GitHub
                  </Button>
                </div>

                <Button 
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white flex items-center gap-2"
                  onClick={handlePull}
                  disabled={isPulling}
                >
                  {isPulling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify Repo Connection
                </Button>
              </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
