"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable"
import { Toaster, toast } from "sonner"
import { Sidebar, SidebarTab } from "@/components/Sidebar"
import { SettingsPanel, ModelSettings } from "@/components/SettingsPanel"
import { KeysManager, useKeysManager } from "@/components/KeysManager"
import { SystemInstructions } from "@/components/SystemInstructions"
import { WelcomeView } from "@/components/welcome-view"
import { GenerationView } from "@/components/generation-view"
import { LoadingScreen } from "@/components/loading-screen"
import { useCodeGeneration } from "@/hooks/use-code-generation"
import { LLMProvider, getAvailableProviders } from "@/lib/providers/config"
import { HelpManual } from "@/components/HelpManual"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet"
import { PlusCircle, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTab>('home')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)
  const [isHelpManualOpen, setIsHelpManualOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
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

  // Initial Loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

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

  const handleGenerate = async (overridePrompt?: string) => {
    const targetPrompt = overridePrompt || prompt
    if (!targetPrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setActiveTab('chat')
    
    await generateCode({
      prompt: targetPrompt,
      model: selectedModel,
      provider: selectedProvider,
      systemPromptType: systemPrompt ? 'custom' : 'default',
      customSystemPrompt: systemPrompt,
      temperature: modelSettings.temperature,
      topP: modelSettings.topP,
      topK: modelSettings.topK,
      maxTokens: modelSettings.maxTokens,
      customCredentials: keys
    })
  }
  
  const handleNewChat = () => {
    setPrompt("")
    setGeneratedCode("")
    setActiveTab('home')
    toast.success("Started a new chat")
  }

  if (isLoading) return <LoadingScreen />

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-200">
      <Toaster position="top-right" theme="dark" />
      
      {/* Help Manual Modal */}
      <HelpManual isOpen={isHelpManualOpen} onClose={() => setIsHelpManualOpen(false)} />
      
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar */}
        <ResizablePanel 
          defaultSize={isSidebarCollapsed ? 4 : 16} 
          minSize={4} 
          maxSize={20}
          collapsible={true}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className="transition-all duration-300"
        >
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            onOpenHelp={() => setIsHelpManualOpen(true)}
            onNewChat={handleNewChat}
            onToggleSettings={() => setIsSettingsOpen(true)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-800" />

        {/* Middle Content Area */}
        <ResizablePanel defaultSize={84} minSize={30}>
          <div className="flex flex-col h-full overflow-hidden bg-slate-950">
            {activeTab === 'home' && (
              <WelcomeView 
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={() => handleGenerate()}
              />
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <SystemInstructions 
                  value={systemPrompt}
                  onChange={setSystemPrompt}
                  isOpen={isSystemPromptOpen}
                  onToggle={() => setIsSystemPromptOpen(!isSystemPromptOpen)}
                />
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
                  />
                </div>
              </div>
            )}

            {activeTab === 'keys' && <KeysManager />}
            
            {activeTab === 'prompts' && (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>Prompt Library coming soon...</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Model Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-slate-950 border-slate-800 p-0 overflow-y-auto">
          <SheetHeader className="p-6 border-b border-slate-800">
            <SheetTitle className="text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-400" />
              Model Configuration
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Fine-tune the AI model parameters for your project.
            </SheetDescription>
          </SheetHeader>
          <div className="p-0">
            <SettingsPanel 
              provider={selectedProvider}
              model={selectedModel}
              models={availableModels}
              settings={modelSettings}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              onSettingsChange={(newSettings) => setModelSettings(prev => ({ ...prev, ...newSettings }))}
              isLoadingModels={isLoadingModels}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
