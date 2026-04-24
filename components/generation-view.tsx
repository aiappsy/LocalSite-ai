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
        <div className="bg-blue-600/5 border-b border-white/5 p-1.5 flex items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
           <ThinkingIndicator
              thinkingOutput={thinkingOutput}
              isThinking={isThinking}
              position="top-right"
            />
            <span className="text-[10px] font-mono text-blue-400/60 uppercase tracking-[0.2em] ml-2 z-10">
              Architectural Reasoning Active
            </span>
        </div>
      )}

      {/* Tab-Navigation - Studio Style */}
      <div className="flex px-4 items-center bg-slate-950/20 backdrop-blur-md border-b border-white/5 h-10 sticky top-0 z-20">
        <div className="flex gap-1 h-full items-center">
          <button
            className={`px-4 py-1.5 text-[11px] font-bold tracking-widest transition-all rounded-lg ${activeTab === "code" 
              ? "text-blue-200 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("code")}
          >
            CODE
          </button>
          <button
            className={`px-4 py-1.5 text-[11px] font-bold tracking-widest transition-all rounded-lg ${activeTab === "preview" 
              ? "text-blue-200 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            PREVIEW
          </button>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          {generationComplete && (
            <Badge variant="outline" className="h-6 text-[10px] font-mono border-white/10 text-emerald-400 bg-emerald-500/5">
              COMPILED
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content - Unified Tabbed View */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === "code" ? (
          <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">
            <CodePanel {...codePanelProps} />
          </div>
        ) : (
          <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">
            <PreviewPanel {...previewPanelProps} />
          </div>
        )}
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
