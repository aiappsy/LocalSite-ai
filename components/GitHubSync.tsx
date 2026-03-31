'use client';

import React, { useState, useEffect } from 'react';
import { Github, Send, Download, RefreshCw, Key, ShieldCheck, AlertCircle, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  path: string;
}

interface GitHubSyncProps {
  currentCode: string;
  onCodePulled: (code: string) => void;
}

export function GitHubSync({ currentCode, onCodePulled }: GitHubSyncProps) {
  const [settings, setSettings] = useState<GitHubSettings>({
    token: '',
    owner: '',
    repo: '',
    path: 'index.html'
  });
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Sync from Aiappsy WebCrafter');

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('webcrafter-github-settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse GitHub settings', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: GitHubSettings) => {
    setSettings(newSettings);
    localStorage.setItem('webcrafter-github-settings', JSON.stringify(newSettings));
  };

  const handlePush = async () => {
    if (!settings.token || !settings.owner || !settings.repo || !settings.path) {
      toast.error('Please fill in all GitHub settings first.');
      return;
    }

    setIsPushing(true);
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
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
    if (!settings.token || !settings.owner || !settings.repo || !settings.path) {
      toast.error('Please fill in all GitHub settings first.');
      return;
    }

    setIsPulling(true);
    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        onCodePulled(data.content);
        toast.success('Successfully pulled from GitHub!');
      } else {
        throw new Error(data.error || 'Failed to pull from GitHub');
      }
    } catch (error: any) {
      console.error('Pull Error:', error);
      toast.error(`Pull failed: ${error.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Github className="w-6 h-6 text-blue-500" /> GitHub Sync
        </h1>
        <p className="text-slate-400 text-sm">
          Connect your project to GitHub for version control and easy deployment. We recommend using a GitHub Classic PAT with 'repo' scope.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {/* Settings Card */}
        <Card className="border-slate-800 bg-slate-900/50 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
               <Key className="w-4 h-4 text-blue-400" /> Connection Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Configure your repository details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Personal Access Token</label>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs"
                value={settings.token}
                onChange={(e) => saveSettings({ ...settings, token: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Owner (User/Org)</label>
                <Input
                  placeholder="username"
                  className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs"
                  value={settings.owner}
                  onChange={(e) => saveSettings({ ...settings, owner: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Repository</label>
                <Input
                  placeholder="my-project"
                  className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs"
                  value={settings.repo}
                  onChange={(e) => saveSettings({ ...settings, repo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">File Path in Repo</label>
              <Input
                placeholder="index.html"
                className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500 text-xs"
                value={settings.path}
                onChange={(e) => saveSettings({ ...settings, path: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
             <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Encrypted in local storage
            </p>
          </CardFooter>
        </Card>

        {/* Sync Actions Card */}
        <Card className="border-slate-800 bg-slate-900/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
               <RefreshCw className="w-4 h-4 text-green-400" /> Sync Operations
            </CardTitle>
            <CardDescription className="text-xs">
              Push your generated code or pull from GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Push to GitHub</label>
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
                  {isPushing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Push Changes
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pull from GitHub</label>
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                 <Button 
                  variant="outline"
                  className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  onClick={handlePull}
                  disabled={isPulling}
                >
                  {isPulling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Import from Repo
                </Button>
                <p className="mt-2 text-[10px] text-slate-500 text-center">
                  Warning: This will overwrite your current code!
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-blue-900/10 p-4 border-t border-slate-800">
             <div className="flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-200/70 leading-relaxed">
                Connect this project to a GitHub repository to enable CI/CD pipelines. For example, you can point Coolify to this repository for automatic production deployments.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
