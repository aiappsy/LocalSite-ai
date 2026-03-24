'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileJson, 
  FileCode, 
  Cloud, 
  Settings, 
  Rocket, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  ShieldCheck,
  Server,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface DeployDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  githubSettings: { token: string; owner: string; repo: string; path: string };
  onPullCode: (code: string) => void;
}

export function DeployDialog({ isOpen, onClose, code, githubSettings, onPullCode }: DeployDialogProps) {
  const [activeTab, setActiveTab] = useState("export");
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Coolify State (Pre-filled from user screenshot)
  const [coolifyUrl, setCoolifyUrl] = useState("https://coolify.aiappsy.com");
  const [coolifyToken, setCoolifyToken] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("WebCrafter Project");
  const [isValidating, setIsValidating] = useState(false);
  const [isUsingServerToken, setIsUsingServerToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence: Load settings on mount
  React.useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('coolify-url');
      const savedToken = localStorage.getItem('coolify-token');
      
      if (savedUrl) setCoolifyUrl(savedUrl);
      if (savedToken) setCoolifyToken(savedToken);
      
      // Auto-validate if have enough info or if we should check server secrets
      if (!projects.length) {
        validateConnection(savedUrl || coolifyUrl, savedToken || "");
      }
    }
  }, [isOpen]);

  // Persistence: Save settings when they change
  React.useEffect(() => {
    if (coolifyUrl) localStorage.setItem('coolify-url', coolifyUrl);
    if (coolifyToken) localStorage.setItem('coolify-token', coolifyToken);
    if (selectedProjectId) localStorage.setItem('coolify-last-project', selectedProjectId);
  }, [coolifyUrl, coolifyToken, selectedProjectId]);

  const validateConnection = async (overrideUrl?: string, overrideToken?: string) => {
    const url = overrideUrl || coolifyUrl;
    const token = overrideToken || coolifyToken;

    if (!url) {
      if (!overrideUrl) toast.error("Please provide an Instance URL.");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/deploy/coolify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceUrl: url,
          token: token,
          endpoint: '/projects'
        })
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to connect');

      const { data, usingServerToken } = responseData;
      setProjects(data);
      setIsUsingServerToken(usingServerToken);

      if (data.length > 0) {
        const lastProject = localStorage.getItem('coolify-last-project');
        const exists = data.find((p: any) => p.uuid === lastProject);
        setSelectedProjectId(exists ? lastProject! : data[0].uuid);
      }
      
      if (!overrideUrl) toast.success(`Connected! Found ${data.length} projects.`);
    } catch (error: any) {
      if (!overrideUrl) toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded successfully.");
  };

  const handleExportZip = () => {
    toast.info("ZIP export feature requires jszip. Downloading as HTML instead.");
    handleDownloadHTML();
  };

  const handleCoolifyDeploy = async () => {
    if (!coolifyToken && projects.length === 0) {
      toast.error("Please connect your Coolify instance first.");
      return;
    }

    setIsDeploying(true);
    try {
      // 1. Download the file for the user (since API v4 expects Git/Docker but we have local code)
      handleDownloadHTML();
      
      // 2. Open the specific project page in Coolify
      const baseUrl = coolifyUrl.replace(/\/$/, '');
      const projectPath = selectedProjectId ? `/project/${selectedProjectId}` : '/projects';
      window.open(`${baseUrl}${projectPath}`, '_blank');
      
      toast.success("Project page opened! Please create a 'Static' resource and paste/upload the downloaded code.");
    } catch (error: any) {
      toast.error(`Deployment guide failed: ${error.message}`);
    } finally {
      setIsDeploying(false);
      onClose();
    }
  };

  const handleGitHubPush = async () => {
    if (!githubSettings.token || !githubSettings.owner || !githubSettings.repo) {
      toast.error("Please configure your GitHub settings in the System panel first.");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...githubSettings,
          content: code,
          message: `Update from WebCrafter: ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to push to GitHub');

      toast.success("Successfully pushed to GitHub!");
    } catch (error: any) {
      toast.error(`GitHub Push failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGitHubPull = async () => {
    if (!githubSettings.token || !githubSettings.owner || !githubSettings.repo) {
      toast.error("Please configure your GitHub settings in the System panel first.");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(githubSettings)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to pull from GitHub');

      onPullCode(data.content);
      toast.success("Successfully pulled code from GitHub!");
    } catch (error: any) {
      toast.error(`GitHub Pull failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-6 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-xl">
              <Rocket className="w-6 h-6 text-blue-400" />
              Deploy & Export
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Transform your generated code into a live website or a shareable file.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800 p-1 mb-6">
              <TabsTrigger value="export" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Download className="w-4 h-4" /> Export
              </TabsTrigger>
              <TabsTrigger value="coolify" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Cloud className="w-4 h-4" /> Coolify
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <FileCode className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Download as HTML</h3>
                    <p className="text-xs text-slate-500">A single-file portable version of your site.</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 ml-auto text-slate-800 group-hover:text-blue-500 transition-colors" />
                </button>

                <button 
                  onClick={handleExportZip}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all text-left group opacity-70"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <FileJson className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Export as ZIP</h3>
                    <p className="text-xs text-slate-500">Full project bundle (HTML, CSS, Assets).</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 ml-auto text-slate-800 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>
            </TabsContent>

            <TabsContent value="coolify" className="space-y-6 mt-0">
              <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-900/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-[12px] font-bold text-blue-300 uppercase tracking-wider">Direct Deployment</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Enter your Coolify credentials to deploy this code instantly as a new static resource.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coolify-url" className="text-[10px] uppercase font-bold text-slate-500">Instance URL</Label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <Input 
                      id="coolify-url" 
                      placeholder="https://coolify.yourdomain.com" 
                      className="bg-slate-900 border-slate-800 h-10 pl-9 text-xs"
                      value={coolifyUrl}
                      onChange={(e) => setCoolifyUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coolify-token" className="text-[10px] uppercase font-bold text-slate-500">API Token</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="coolify-token" 
                      type="password" 
                      placeholder="Enter token (or leave blank for server secret)..." 
                      className="bg-slate-900 border-slate-800 h-10 text-xs flex-1 placeholder:text-slate-600"
                      value={coolifyToken}
                      onChange={(e) => setCoolifyToken(e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-xs"
                      onClick={() => validateConnection()}
                      disabled={isValidating}
                    >
                      {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Connect"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-600 italic">Found in Settings &gt; API Tokens</p>
                    <a href="#" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                      Help <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  {isUsingServerToken && !coolifyToken && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <ShieldCheck className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-blue-400 font-medium tracking-tight">Active: Secure Server-Side Token</span>
                    </div>
                  )}
                </div>

                {projects.length > 0 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Target Project</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <select 
                        className="w-full h-10 bg-slate-900 border border-slate-800 rounded-md px-3 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                      >
                        {projects.map((p: any) => (
                          <option key={p.uuid} value={p.uuid}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-[10px] uppercase font-bold text-slate-500">Project Name</Label>
                  <Input 
                    id="project-name" 
                    placeholder="e.g. My Awesome Site" 
                    className="bg-slate-900 border-slate-800 h-10 text-xs"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="github" className="space-y-6 mt-0 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-900/30 flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-blue-400 mt-0.5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                <div>
                  <h4 className="text-[12px] font-bold text-blue-300 uppercase tracking-wider">GitHub Synchronization</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Push your code to a repository or pull the latest version from GitHub.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleGitHubPush}
                  disabled={isSyncing}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    {isSyncing ? <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /> : <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-emerald-400"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Push to GitHub</h3>
                    <p className="text-xs text-slate-500">Upload current code to {githubSettings.owner}/{githubSettings.repo}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-800 group-hover:text-emerald-500 transition-colors" />
                </button>

                <button 
                  onClick={handleGitHubPull}
                  disabled={isSyncing}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    {isSyncing ? <Loader2 className="w-6 h-6 text-orange-400 animate-spin" /> : <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-orange-400"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.5l-3.5-3.5 1.4-1.4 1.1 1.1V7h2v6.2l1.1-1.1 1.4 1.4-3.5 3.5z"/></svg>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Pull from GitHub</h3>
                    <p className="text-xs text-slate-500">Fetch code from {githubSettings.owner}/{githubSettings.repo}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-800 group-hover:text-orange-500 transition-colors" />
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 bg-slate-900/50 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
          {activeTab === 'coolify' ? (
            <Button 
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 px-6"
              disabled={isDeploying}
              onClick={handleCoolifyDeploy}
            >
              {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Launch Deployment
            </Button>
          ) : activeTab === 'github' ? (
             <Button variant="ghost" onClick={onClose} className="text-slate-400 border border-slate-800">Done</Button>
          ) : (
             <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-300">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
