"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable"
import { Sidebar, SidebarTab } from "@/components/Sidebar"
import { SettingsPanel, ModelSettings } from "@/components/SettingsPanel"
import { KeysManager, useKeysManager } from "@/components/KeysManager"
import { WelcomeView } from "@/components/welcome-view"
import { SystemInstructions } from "@/components/SystemInstructions"
import { GitHubSync } from "@/components/GitHubSync"
import { GenerationView } from "@/components/generation-view"
import { DeployDialog } from "@/components/DeployDialog"
import { PromptLibrary } from "@/components/PromptLibrary"
import { LoadingScreen } from "@/components/loading-screen"
import { useCodeGeneration } from "@/hooks/use-code-generation"
import { LLMProvider, getAvailableProviders, getProviderConfig } from "@/lib/providers/config"
import { HelpManual } from "@/components/HelpManual"
import { useAuth } from "@/hooks/use-auth"
import { LoginPanel } from "@/components/LoginPanel"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { PlusCircle, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { debounce } from "lodash"
import { Toaster, toast } from "sonner"
import { StudioHeader } from "@/components/StudioHeader"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  
  // UI State
  const [guestMode, setGuestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTab>('home')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isHelpManualOpen, setIsHelpManualOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  
  // Model & Provider State
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(LLMProvider.DEEPSEEK)
  const [selectedModel, setSelectedModel] = useState("")
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  
  // Prompt & Settings State
  const [prompt, setPrompt] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxTokens: 4096,
    stopSequences: [],
    safetySettings: 'medium'
  })
  
  // New Feature State
  const [isSearchEnabled, setIsSearchEnabled] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [selectedPersona, setSelectedPersona] = useState<"developer" | "copywriter" | "thinking">("developer")
  const [githubSettings, setGithubSettings] = useState({
    token: "",
    owner: "",
    repo: "",
    path: "index.html"
  })

  const { keys } = useKeysManager()
  const {
    generatedCode,
    isGenerating,
    generationComplete,
    thinkingOutput,
    isThinking,
    generateCode,
    setGeneratedCode
  } = useCodeGeneration()

  // 1. Initial Loading & Auth Data Fetch
  useEffect(() => {
    if (user && db) {
      // Sync settings from Firestore
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'models');
      getDoc(settingsRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.modelSettings) setModelSettings(data.modelSettings);
          if (data.systemPrompt) setSystemPrompt(data.systemPrompt);
          if (data.selectedProvider) setSelectedProvider(data.selectedProvider);
          if (data.selectedPersona) setSelectedPersona(data.selectedPersona);
          if (data.githubSettings) setGithubSettings(data.githubSettings);
        }
      });

      // Sync latest generation from Firestore
      const genRef = doc(db, 'users', user.uid, 'generations', 'latest');
      getDoc(genRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.generatedCode) setGeneratedCode(data.generatedCode);
        }
      });
    }
    
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [user])

  // 2. Cloud Persistence (Settings)
  useEffect(() => {
    if (!user || !db || isLoading) return;

    const syncToCloud = debounce(async () => {
      if (!db) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'models');
        await setDoc(docRef, {
          modelSettings,
          systemPrompt,
          selectedProvider,
          selectedPersona,
          githubSettings,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("Settings synced to cloud");
      } catch (e) {
        console.error("Cloud Sync Error:", e);
      }
    }, 2000);

    syncToCloud();
    return () => syncToCloud.cancel();
  }, [user, modelSettings, systemPrompt, selectedProvider, selectedPersona, isLoading]);

  // 3. Cloud Persistence (Latest Generation)
  useEffect(() => {
    if (!user || !db || !generationComplete || !generatedCode) return;

    const syncGenToCloud = async () => {
      if (!db) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'generations', 'latest');
        await setDoc(docRef, {
          generatedCode,
          updatedAt: new Date().toISOString()
        });
        console.log("Generation synced to cloud");
      } catch (e) {
        console.error("Gen Cloud Sync Error:", e);
      }
    };

    syncGenToCloud();
  }, [user, generationComplete, generatedCode]);

  // Fetch models whenever provider changes
  useEffect(() => {
    // Clear current models immediately when switching providers to prevent stale UI
    setAvailableModels([])
    setSelectedModel("")
    
    const fetchModels = async () => {
      setIsLoadingModels(true)
      try {
        const customApiKey = keys[selectedProvider]?.apiKey
        const customBaseUrl = keys[selectedProvider]?.baseUrl

        const response = await fetch(`/api/get-models`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: selectedProvider, customApiKey, customBaseUrl })
        })
        
        if (!response.ok) throw new Error("Failed to fetch models")
        const data = await response.json()
        
        const models = data.models || []
        setAvailableModels(models)
        
        // If the fetch returned models, select the first one if the current selection is invalid
        if (models.length > 0) {
          const currentValid = models.find((m: any) => m.id === selectedModel)
          if (!currentValid) {
            setSelectedModel(models[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error)
        toast.error("Could not load models for this provider.")
      } finally {
        setIsLoadingModels(false)
      }
    }

    if (selectedProvider) {
      fetchModels()
    }
  }, [selectedProvider, keys])

  const handleGenerate = async (overridePrompt?: string, overridePersona?: string) => {
    if (overridePrompt) setPrompt(overridePrompt)
    if (overridePersona) setSelectedPersona(overridePersona as any)
    
    const targetPrompt = overridePrompt || prompt
    const targetPersona = overridePersona || selectedPersona

    if (!targetPrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    // Basic client-side check for configuration
    const config = getProviderConfig(selectedProvider);
    const hasLocalKey = !!keys[selectedProvider]?.apiKey;
    
    // If it's a cloud provider and no local key is set, we warn but allow trying 
    // (it might be in server-side env vars)
    if (!config.isLocal && !hasLocalKey) {
      console.log(`No local key for ${selectedProvider}, relying on server environment.`);
    }

    // Prepare the final prompt with a clear instruction for HTML output
    const finalPrompt = targetPrompt; // DESIGN_EXCELLENCE_SUFFIX is added in the hook

    setActiveTab('chat')
    
    try {
      await generateCode({
        prompt: finalPrompt,
        model: selectedModel || (availableModels.length > 0 ? availableModels[0].id : ""),
        provider: selectedProvider,
        systemPromptType: systemPrompt ? 'custom' : targetPersona === 'copywriter' ? 'copywriting' : targetPersona === 'thinking' ? 'thinking' : 'default',
        customSystemPrompt: systemPrompt,
        temperature: modelSettings.temperature,
        topP: modelSettings.topP,
        topK: modelSettings.topK,
        maxTokens: modelSettings.maxTokens,
        customCredentials: keys,
        isSearchEnabled,
        attachedFiles,
        previousCode: generatedCode
      })
    } catch (err: any) {
      // Errors are mostly handled in the hook via toasts, but we catch here just in case
      console.error("Generation failed:", err);
    }
  }
  
  const handleNewChat = () => {
    setPrompt("")
    setGeneratedCode("")
    setActiveTab('home')
    toast.success("Started a new chat")
  }

  if (isLoading || authLoading) return <LoadingScreen />
  // if (!user && !guestMode) return <LoginPanel onSkip={() => setGuestMode(true)} />

  return (
    <div className="flex h-screen w-full bg-[#020617] overflow-hidden text-slate-200 mesh-gradient">
      <Toaster position="top-right" theme="dark" />
      
      {/* Help Manual Modal */}
      <HelpManual isOpen={isHelpManualOpen} onClose={() => setIsHelpManualOpen(false)} />
      
      <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
        {/* PANE 1: Left Navigation Sidebar */}
        <ResizablePanel 
          defaultSize={5} 
          minSize={4} 
          maxSize={18}
          collapsible={true}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className="studio-sidebar z-50 glass"
        >
          <div className="flex flex-col h-full">
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              onOpenHelp={() => setIsHelpManualOpen(true)}
              onNewChat={handleNewChat}
              onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-white/5 w-1 hover:bg-blue-500/30 transition-colors" />

        {/* PANE 2: Main Workspace Content */}
        <ResizablePanel defaultSize={61} minSize={30}>
          <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Studio Header */}
            <StudioHeader 
              activeTab={activeTab}
              isGenerating={isGenerating}
              onDeploy={() => setIsDeployDialogOpen(true)}
              onNewChat={handleNewChat}
            />

            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'home' && (
                <WelcomeView 
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onGenerate={() => handleGenerate()}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  hasApiKey={!!keys[selectedProvider]?.apiKey}
                  providerName={selectedProvider.toUpperCase()}
                />
              )}

              {activeTab === 'github' && (
                <GitHubSync 
                  currentCode={generatedCode}
                  onCodePulled={(code) => {
                    setGeneratedCode(code);
                    setActiveTab('chat');
                  }}
                />
              )}

              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-hidden">
                    <GenerationView 
                      prompt={prompt}
                      setPrompt={setPrompt}
                      model={selectedModel}
                      provider={selectedProvider}
                      generatedCode={generatedCode}
                      isGenerating={isGenerating}
                      generationComplete={generationComplete}
                      onRegenerateWithNewPrompt={handleGenerate}
                      thinkingOutput={thinkingOutput}
                      isThinking={isThinking}
                      isSearchEnabled={isSearchEnabled}
                      setIsSearchEnabled={setIsSearchEnabled}
                      attachedFiles={attachedFiles}
                      setAttachedFiles={setAttachedFiles}
                      onDeploy={() => setIsDeployDialogOpen(true)}
                      selectedPersona={selectedPersona}
                      onPersonaChange={setSelectedPersona}
                      systemPrompt={systemPrompt}
                      setSystemPrompt={setSystemPrompt}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'prompts' && (
                <PromptLibrary onSelect={handleGenerate} />
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-white/5 w-1 hover:bg-blue-500/30 transition-colors" />

        {/* PANE 3: Right Studio Parameters (Google AI Studio Style) */}
        <ResizablePanel 
          defaultSize={25} 
          minSize={20} 
          maxSize={35}
          className="studio-right-panel glass h-full"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="studio-panel-header flex justify-between items-center px-4 h-12 border-b border-white/5">
              <span className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" />
                Parameters
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono opacity-50 h-5 px-1.5 border-white/10">
                Studio Mode
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              <SettingsPanel 
                provider={selectedProvider}
                model={selectedModel}
                models={availableModels}
                settings={modelSettings}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                onSettingsChange={(newSettings) => setModelSettings(prev => ({ ...prev, ...newSettings }))}
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
                selectedPersona={selectedPersona}
                onPersonaChange={setSelectedPersona}
                githubSettings={githubSettings}
                onGithubSettingsChange={(newSettings) => setGithubSettings(prev => ({ ...prev, ...newSettings }))}
                isLoadingModels={isLoadingModels}
                currentCode={generatedCode}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Deploy Dialog */}
      <DeployDialog 
        isOpen={isDeployDialogOpen} 
        onClose={() => setIsDeployDialogOpen(false)} 
        code={generatedCode}
        githubSettings={githubSettings}
        onPullCode={setGeneratedCode}
      />

      {/* Version Footer */}
      <div className="fixed bottom-4 left-4 text-[10px] text-slate-500 font-mono pointer-events-none opacity-50 z-50">
        WEB CRAFTER STUDIO | v1.2.0-ELITE
      </div>
    </div>
  )
}
