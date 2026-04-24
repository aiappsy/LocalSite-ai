"use client"

import React, { useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Globe, Paperclip, X, Image as ImageIcon, AlertTriangle, ArrowRight, Brain, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getModelCapabilities } from "@/lib/providers/capabilities"
import { WorkSteps } from "@/components/work-steps"

interface PromptSectionProps {
  newPrompt: string
  setNewPrompt: (value: string) => void
  handleSendNewPrompt: () => void
  isGenerating: boolean
  isSearchEnabled: boolean
  setIsSearchEnabled: (value: boolean) => void
  attachedFiles: File[]
  setAttachedFiles: (files: File[]) => void
  selectedPersona: "developer" | "copywriter" | "thinking"
  onPersonaChange: (persona: "developer" | "copywriter" | "thinking") => void
  previousPrompt: string
  generationComplete: boolean
  editedCode: string
  generatedCode: string
  isEditable: boolean
  model: string
}

export function PromptSection({
  newPrompt,
  setNewPrompt,
  handleSendNewPrompt,
  isGenerating,
  isSearchEnabled,
  setIsSearchEnabled,
  attachedFiles,
  setAttachedFiles,
  selectedPersona,
  onPersonaChange,
  previousPrompt,
  generationComplete,
  editedCode,
  generatedCode,
  isEditable,
  model
}: PromptSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const capabilities = getModelCapabilities(model)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles([...attachedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...attachedFiles]
    newFiles.splice(index, 1)
    setAttachedFiles(newFiles)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendNewPrompt()
    }
  }

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {attachedFiles.map((file, i) => (
            <div key={i} className="relative group w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5">
              <div className="w-full h-full flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <button 
                onClick={() => removeFile(i)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative group transition-all duration-300 flex-1 flex flex-col">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
        <div className="relative bg-[#0e0e11] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col flex-1 ring-1 ring-white/5">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-md transition-all",
                      isSearchEnabled ? "text-blue-400 bg-blue-400/10" : "text-slate-500 hover:text-slate-300"
                    )}
                    onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                  >
                    <Globe className={cn("h-3.5 h-3.5", isSearchEnabled && "animate-pulse")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Web Search</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-md transition-all",
                      selectedPersona === 'thinking' ? "text-purple-400 bg-purple-400/10" : "text-slate-500 hover:text-slate-300"
                    )}
                    onClick={() => onPersonaChange(selectedPersona === 'thinking' ? 'developer' : 'thinking')}
                  >
                    <Brain className={cn("h-3.5 h-3.5", selectedPersona === 'thinking' && "animate-pulse")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Thinking Mode</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-500 hover:text-slate-300 rounded-md gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Attach</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Images for Vision</TooltipContent>
              </Tooltip>
              
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />

              <div className="ml-auto flex items-center gap-3">
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                <div className="h-4 w-px bg-white/5 mx-1" />
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest hidden sm:block">
                  {model || "Ready"}
                </span>
              </div>
            </TooltipProvider>
          </div>

          <Textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Type instructions to refine your code..."
            className="flex-1 min-h-[60px] w-full bg-transparent border-0 p-3 text-sm text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none transition-all scrollbar-hide"
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />
          
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <Button
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all shadow-lg active:scale-95",
                newPrompt.trim() 
                  ? "bg-blue-600 hover:bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              )}
              onClick={handleSendNewPrompt}
              disabled={!newPrompt.trim() || isGenerating}
            >
              <ArrowRight className="h-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mini Process Feedback Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {isGenerating ? "Processing Draft" : "Architecture Ready"}
                </span>
            </div>
                <div className="hidden md:flex items-center gap-2 border-l border-white/5 pl-4 overflow-hidden max-w-[400px]">
                    <span className="text-[9px] font-mono text-slate-600 uppercase">Last:</span>
                    <span className="text-[10px] text-slate-400 truncate italic">"{previousPrompt}"</span>
                </div>
        </div>
        
        <WorkSteps
          isGenerating={isGenerating}
          generationComplete={generationComplete}
          generatedCode={isEditable ? editedCode : generatedCode}
          compact={true}
        />
      </div>
    </div>
  )
}
