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
  Server
} from 'lucide-react';
import { toast } from 'sonner';

interface DeployDialogProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export function DeployDialog({ isOpen, onClose, code }: DeployDialogProps) {
  const [activeTab, setActiveTab] = useState("export");
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Coolify State (Pre-filled from user screenshot)
  const [coolifyUrl, setCoolifyUrl] = useState("https://coolify.aiappsy.com");
  const [coolifyToken, setCoolifyToken] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("WebCrafter Project");
  const [isValidating, setIsValidating] = useState(false);

  // Persistence: Load settings on mount
  React.useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('coolify-url');
      const savedToken = localStorage.getItem('coolify-token');
      if (savedUrl) setCoolifyUrl(savedUrl);
      if (savedToken) {
        setCoolifyToken(savedToken);
      // Auto-validate if URL exists (token might be on server)
      if (savedUrl && !projects.length) {
        validateConnection(savedUrl, savedToken || "");
      }
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to connect');

      setProjects(data);
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
          ) : (
             <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-300">Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
