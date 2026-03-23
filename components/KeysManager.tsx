'use client';

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LLMProvider, PROVIDER_CONFIGS } from '@/lib/providers/config';
import { toast } from 'sonner';

// Custom hook for managing local storage keys
export function useKeysManager() {
  const [keys, setKeys] = useState<Record<string, { apiKey?: string; baseUrl?: string }>>({});

  useEffect(() => {
    const stored = localStorage.getItem('localsite-ai-keys');
    if (stored) {
      try {
        setKeys(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored keys', e);
      }
    }
  }, []);

  const saveKey = (provider: string, apiKey?: string, baseUrl?: string) => {
    const newKeys = {
      ...keys,
      [provider]: { apiKey, baseUrl }
    };
    setKeys(newKeys);
    localStorage.setItem('localsite-ai-keys', JSON.stringify(newKeys));
    toast.success(`${provider} credentials saved locally.`);
  };

  const removeKey = (provider: string) => {
    const newKeys = { ...keys };
    delete newKeys[provider];
    setKeys(newKeys);
    localStorage.setItem('localsite-ai-keys', JSON.stringify(newKeys));
    toast.info(`${provider} credentials removed.`);
  };

  return { keys, saveKey, removeKey };
}

export function KeysManager() {
  const { keys, saveKey, removeKey } = useKeysManager();
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleVisibility = (provider: string) => {
    setVisibleKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const renderProviderKey = (providerId: LLMProvider) => {
    const config = PROVIDER_CONFIGS[providerId];
    if (!config || (config.isLocal && providerId !== LLMProvider.OPENAI_COMPATIBLE)) return null;

    const currentKey = keys[providerId]?.apiKey || '';
    const currentBaseUrl = keys[providerId]?.baseUrl || '';

    return (
      <Card key={providerId} className="border-slate-800 bg-slate-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                <Key className="w-3.5 h-3.5 text-blue-400" />
              </div>
              {config.name}
            </CardTitle>
            <div className="flex gap-2">
              <a 
                href={providerId === LLMProvider.GOOGLE ? "https://aistudio.google.com/app/apikey" : 
                      providerId === LLMProvider.OPENROUTER ? "https://openrouter.ai/keys" : "#"}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <CardDescription className="text-xs">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">API Key</label>
            <div className="relative">
              <Input
                type={visibleKeys[providerId] ? "text" : "password"}
                placeholder="Enter your API key..."
                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 pr-10 text-xs"
                value={currentKey}
                onChange={(e) => saveKey(providerId, e.target.value, currentBaseUrl)}
              />
              <button
                onClick={() => toggleVisibility(providerId)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {visibleKeys[providerId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {providerId === LLMProvider.OPENAI_COMPATIBLE && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Base URL</label>
              <Input
                placeholder="https://api.example.com/v1"
                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs"
                value={currentBaseUrl}
                onChange={(e) => saveKey(providerId, currentKey, e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Stored locally in browser
          </p>
          {currentKey && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-900/10"
              onClick={() => removeKey(providerId)}
            >
              <Trash2 className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Key className="w-6 h-6 text-blue-500" /> API Keys Management
        </h1>
        <p className="text-slate-400 text-sm">
          Connect your favorite AI providers. For security, your API keys are stored only in your browser's local storage and are never sent to our database.
        </p>
        <div className="mt-4 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200/80 leading-relaxed">
            <p className="font-semibold text-blue-300 mb-1">How it works:</p>
            Keys provided here will override the environment variables set on the server. If a field is empty, the application will attempt to use the server-side default key.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
        {Object.values(LLMProvider).map(p => renderProviderKey(p as LLMProvider))}
      </div>
    </div>
  );
}
