"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { debounce } from "lodash"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw, Terminal } from "lucide-react"
import { ThinkingIndicator } from "@/components/thinking-indicator"
import { SystemInstructions } from "@/components/SystemInstructions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

import { CodePanel, PreviewPanel } from "@/components/generation-panels"
import { PromptSection } from "@/components/PromptSection"

interface GenerationViewProps {
  prompt: string
  setPrompt: (value: string) => void
  model: string
  provider?: string
  generatedCode: string
  isGenerating: boolean
  generationComplete: boolean
  onRegenerateWithNewPrompt: (newPrompt: string) => void
  thinkingOutput?: string
  isThinking?: boolean
  isSearchEnabled: boolean
  setIsSearchEnabled: (value: boolean) => void
  attachedFiles: File[]
  setAttachedFiles: (files: File[]) => void
  onDeploy: () => void
  selectedPersona: "developer" | "copywriter" | "thinking"
  onPersonaChange: (persona: "developer" | "copywriter" | "thinking") => void
  systemPrompt: string
  setSystemPrompt: (value: string) => void
}

export function GenerationView({
  prompt,
  setPrompt,
  model,
  provider = 'deepseek',
  generatedCode,
  isGenerating,
  generationComplete,
  onRegenerateWithNewPrompt,
  thinkingOutput = "",
  isThinking = false,
  isSearchEnabled,
  setIsSearchEnabled,
  attachedFiles,
  setAttachedFiles,
  onDeploy,
  selectedPersona,
  onPersonaChange,
  systemPrompt,
  setSystemPrompt
}: GenerationViewProps) {
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [copySuccess, setCopySuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [isEditable, setIsEditable] = useState(false)
  const [editedCode, setEditedCode] = useState(generatedCode)
  const [originalCode, setOriginalCode] = useState(generatedCode)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [previewContent, setPreviewContent] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newPrompt, setNewPrompt] = useState("")
  const [isLiveEditEnabled, setIsLiveEditEnabled] = useState(false)
  const [isSystemInstructionsOpen, setIsSystemInstructionsOpen] = useState(false)

  const prevContentRef = useRef<string>("");

  const prepareHtmlContent = (code: string): string => {
    const darkModeStyle = `
      <style>
        :root {
          color-scheme: dark;
        }
        html, body {
          background-color: #121212;
          color: #ffffff;
          min-height: 100%;
        }
        body {
          margin: 0;
          padding: 0;
        }
        /* Smooth transition for body background */
        body {
          transition: background-color 0.2s ease;
        }
      </style>
    `;

    let result = "";

    if (code.includes('<head>')) {
      result = code.replace('<head>', `<head>${darkModeStyle}`);
    } else if (code.includes('<html>')) {
      result = code.replace('<html>', `<html><head>${darkModeStyle}</head>`);
    } else {
      result = `
        <!DOCTYPE html>
        <html>
          <head>
            ${darkModeStyle}
          </head>
          <body>
            ${code}
          </body>
        </html>
      `;
    }

    return result;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdatePreview = useCallback(
    debounce((code: string) => {
      const preparedHtml = prepareHtmlContent(code);
      prevContentRef.current = preparedHtml;
      setPreviewContent(preparedHtml);
    }, 50),
    []
  );

  useEffect(() => {
    setEditedCode(generatedCode)
    setOriginalCode(generatedCode)
    setHasChanges(false)

    if (generatedCode) {
      debouncedUpdatePreview(generatedCode);
    }
  }, [generatedCode, debouncedUpdatePreview])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'LIVE_EDIT_CHANGE') {
        const newCode = event.data.content;
        if (newCode && newCode !== editedCode) {
          setIsEditable(true); // Automatically enable edit mode if a live change occurs
          setEditedCode(newCode);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [editedCode]);

  useEffect(() => {
    if (editedCode !== originalCode) {
      setHasChanges(true)
    } else {
      setHasChanges(false)
    }

    if (editedCode) {
      debouncedUpdatePreview(editedCode);
    }
  }, [editedCode, originalCode, debouncedUpdatePreview])

  const saveChanges = () => {
    setOriginalCode(editedCode)
    setHasChanges(false)
  }

  const copyToClipboard = () => {
    const currentCode = isEditable ? editedCode : originalCode
    navigator.clipboard.writeText(currentCode)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch(err => {
        console.error('Error copying:', err)
      })
  }

  const refreshPreview = () => {
    const currentCode = isEditable ? editedCode : originalCode;
    debouncedUpdatePreview.flush();
    const preparedHtml = prepareHtmlContent(currentCode);
    setPreviewContent(preparedHtml);
    setPreviewKey(prevKey => prevKey + 1);
  }

  const downloadCode = () => {
    const currentCode = isEditable ? editedCode : originalCode
    const element = document.createElement("a")
    const file = new Blob([currentCode], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = "generated-website.html"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSendNewPrompt = () => {
    if (!newPrompt.trim() || isGenerating) return
    onRegenerateWithNewPrompt(newPrompt)
    setNewPrompt("")
  }

  // Props bundles for subcomponents
  const codePanelProps = {
    isGenerating,
    generationComplete,
    isEditable,
    setIsEditable,
    hasChanges,
    saveChanges,
    copyToClipboard,
    copySuccess,
    generatedCode,
    editedCode,
    originalCode,
    setEditedCode,
    previousPrompt: prompt,
    newPrompt,
    setNewPrompt,
    handleSendNewPrompt,
    setShowSaveDialog,
    isSearchEnabled,
    setIsSearchEnabled,
    attachedFiles,
    setAttachedFiles,
    model,
    onDeploy,
    selectedPersona,
    onPersonaChange,
    systemPrompt,
    setSystemPrompt,
    isSystemInstructionsOpen,
    setIsSystemInstructionsOpen
  }

  const previewPanelProps = {
    generationComplete,
    refreshPreview,
    viewportSize,
    setViewportSize,
    originalCode,
    editedCode,
    isGenerating,
    previewKey,
    previewContent,
    onDeploy,
    isLiveEditEnabled,
    setIsLiveEditEnabled
  }

  return (
    <div className="h-full bg-transparent text-white flex flex-col overflow-hidden">
      {/* Reasoning/Thinking Indicator if active */}
      {thinkingOutput && (
        <div className="bg-[#1e1e21]/80 backdrop-blur-md border-b border-white/5 py-1 flex items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
           <ThinkingIndicator
              thinkingOutput={thinkingOutput}
              isThinking={isThinking}
              position="top-right"
            />
            <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-[0.3em] font-bold ml-2 z-10">
              Thinking
            </span>
        </div>
      )}

      {/* Main Content - Side-by-Side Studio View and Bottom Prompt */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* TOP AREA: Code & Preview Side-by-Side */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* CODE EDITOR PANEL */}
              <ResizablePanel defaultSize={50} minSize={30} className="relative flex flex-col bg-[#131314]">
                <div className="flex items-center justify-between px-3 h-8 border-b border-white/5 bg-[#171719]">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Editor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {generationComplete && (
                      <Badge variant="outline" className="h-4 text-[9px] font-mono border-emerald-500/20 text-emerald-400 bg-emerald-500/10 px-1">
                        SYNC
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                  <CodePanel {...codePanelProps} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-white/5 w-1 hover:bg-blue-500/30 transition-colors" />

              {/* PREVIEW PANEL */}
              <ResizablePanel defaultSize={50} minSize={30} className="bg-black/20">
                <div className="flex items-center justify-between px-3 h-8 border-b border-white/5 bg-[#171719]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3 h-3 text-slate-500 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Preview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-5 text-[9px] gap-1 px-1.5 border border-white/5 font-mono uppercase text-slate-500 hover:text-white" onClick={refreshPreview}>
                      <RefreshCw className="w-2.5 h-2.5" />
                      Reload
                    </Button>
                  </div>
                </div>
                <div className="h-full w-full overflow-hidden">
                  <PreviewPanel {...previewPanelProps} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-white/5 h-1 hover:bg-blue-500/30 transition-colors" />

          {/* BOTTOM AREA: Prompt Input (spanning full width) */}
          <ResizablePanel defaultSize={25} minSize={15} className="bg-[#131314] border-t border-white/5">
            <div className="h-full flex flex-col p-4 max-w-5xl mx-auto w-full">
               <PromptSection 
                 newPrompt={newPrompt}
                 setNewPrompt={setNewPrompt}
                 handleSendNewPrompt={handleSendNewPrompt}
                 isGenerating={isGenerating}
                 isSearchEnabled={isSearchEnabled}
                 setIsSearchEnabled={setIsSearchEnabled}
                 attachedFiles={attachedFiles}
                 setAttachedFiles={setAttachedFiles}
                 selectedPersona={selectedPersona}
                 onPersonaChange={onPersonaChange}
                 previousPrompt={prompt}
                 generationComplete={generationComplete}
                 editedCode={editedCode}
                 generatedCode={generatedCode}
                 isEditable={isEditable}
                 model={model}
               />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Speichern-Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Save changes?</DialogTitle>
            <DialogDescription className="text-gray-400">
              Do you want to save your changes before switching to read-only mode?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setEditedCode(originalCode);
                setIsEditable(false);
                setShowSaveDialog(false);
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Don't save
            </Button>
            <Button
              onClick={() => {
                saveChanges();
                setIsEditable(false);
                setShowSaveDialog(false);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
