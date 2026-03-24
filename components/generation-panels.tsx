import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Laptop, Smartphone, Tablet, Copy, RefreshCw, Loader2, Save, ArrowRight, Globe, Paperclip, X, Image as ImageIcon, AlertTriangle, Share2, Brain } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { CodeEditor } from "@/components/code-editor"
import { WorkSteps } from "@/components/work-steps"
import { MODEL_CAPABILITIES } from "@/lib/providers/capabilities"
import { useRef } from "react"
import { 
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

interface CodePanelProps {
    isGenerating: boolean
    generationComplete: boolean
    isEditable: boolean
    setIsEditable: (value: boolean) => void
    hasChanges: boolean
    saveChanges: () => void
    copyToClipboard: () => void
    copySuccess: boolean
    generatedCode: string
    editedCode: string
    originalCode: string
    setEditedCode: (value: string) => void
    previousPrompt: string
    newPrompt: string
    setNewPrompt: (value: string) => void
    handleSendNewPrompt: () => void
    setShowSaveDialog: (value: boolean) => void
    isSearchEnabled: boolean
    setIsSearchEnabled: (value: boolean) => void
    attachedFiles: File[]
    setAttachedFiles: (files: File[]) => void
    model: string
    onDeploy?: () => void
    selectedPersona: "developer" | "copywriter" | "thinking"
    onPersonaChange: (persona: "developer" | "copywriter" | "thinking") => void
}

interface PreviewPanelProps {
    generationComplete: boolean
    refreshPreview: () => void
    viewportSize: "desktop" | "tablet" | "mobile"
    setViewportSize: (size: "desktop" | "tablet" | "mobile") => void
    originalCode: string
    editedCode: string
    isGenerating: boolean
    previewKey: number
    previewContent: string
    onDeploy?: () => void
    isLiveEditEnabled: boolean
    setIsLiveEditEnabled: (value: boolean) => void
}

// -----------------------------------------------------------------------------
// Code Panel Component
// -----------------------------------------------------------------------------

export function CodePanel({
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
    previousPrompt,
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
    onPersonaChange
}: CodePanelProps) {

    const fileInputRef = useRef<HTMLInputElement>(null)
    const capabilities = MODEL_CAPABILITIES[model] || { vision: false, search: false }

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
        <div className="h-full flex flex-col">
            {/* 
        CODE EDITOR SECTION 
        Takes up 65% of the vertical space
      */}
            <div className="h-[65%] border-b border-gray-800 flex flex-col">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium">GENERATED HTML</h2>
                        {generationComplete && (
                            <div className="ml-3 flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                    {isEditable ? 'Edit' : 'Read Only'}
                                </span>
                                <Switch
                                    checked={isEditable}
                                    onCheckedChange={(checked) => {
                                        if (!checked && hasChanges) {
                                            setShowSaveDialog(true);
                                        } else {
                                            setIsEditable(checked);
                                        }
                                    }}
                                    disabled={isGenerating}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (Save, Copy) */}
                    <div className="flex items-center gap-2">
                        {isEditable && hasChanges && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                                onClick={saveChanges}
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-white"
                            onClick={copyToClipboard}
                            disabled={!generatedCode || isGenerating}
                        >
                            <Copy className="w-4 h-4 mr-1" />
                            {copySuccess ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-lg shadow-blue-900/20"
                            onClick={onDeploy}
                            disabled={!generatedCode || isGenerating}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            Deploy
                        </Button>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-hidden">
                    {isGenerating && !generatedCode ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-950">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 mb-4 mx-auto animate-spin text-white" />
                                <p className="text-gray-400">Generating code...</p>
                            </div>
                        </div>
                    ) : (
                        <CodeEditor
                            code={isEditable ? editedCode : originalCode}
                            isEditable={isEditable && generationComplete}
                            onChange={(newCode) => setEditedCode(newCode)}
                        />
                    )}
                </div>
            </div>

            {/* 
        BOTTOM SECTION 
        Takes up 35% of the vertical space. Contains Prompt Input & Work Steps.
      */}
            {/* 
        BOTTOM SECTION - HIGH FOCUS PROMPT INPUT
        Redesigned to be the central engine of the interaction.
      */}
            <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full space-y-6">
                {/* New Prompt Input - The Core Interaction */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="relative group transition-all duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 p-2 border-b border-slate-800 bg-slate-900/80">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 w-8 p-0 rounded-lg transition-all",
                                                    isSearchEnabled ? "text-blue-400 bg-blue-400/10" : "text-slate-500 hover:text-slate-300"
                                                )}
                                                onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                                            >
                                                <Globe className={cn("h-4 w-4", isSearchEnabled && "animate-pulse")} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Web Search {isSearchEnabled ? 'Enabled' : 'Disabled'}</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 w-8 p-0 rounded-lg transition-all ml-1",
                                                    selectedPersona === 'thinking' ? "text-purple-400 bg-purple-400/10" : "text-slate-500 hover:text-slate-300"
                                                )}
                                                onClick={() => onPersonaChange(selectedPersona === 'thinking' ? 'developer' : 'thinking')}
                                            >
                                                <Brain className={cn("h-4 w-4", selectedPersona === 'thinking' && "animate-pulse")} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Deep Reasoning (Thinking) {selectedPersona === 'thinking' ? 'ON' : 'OFF'}</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="px-3 text-slate-500 hover:text-slate-300 rounded-lg gap-2"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                <span className="text-xs font-semibold">Upload Files</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Attach Images for Vision Tasks</TooltipContent>
                                    </Tooltip>
                                    
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                    />

                                    {!capabilities.vision && attachedFiles.length > 0 && (
                                        <div className="flex items-center gap-2 ml-auto px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Model lacks Vision</span>
                                        </div>
                                    )}
                                    {!capabilities.search && isSearchEnabled && (
                                        <div className="flex items-center gap-2 ml-auto px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Search Unsupported</span>
                                        </div>
                                    )}
                                </TooltipProvider>
                            </div>

                            {/* Attached Files Preview */}
                            {attachedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-900/30 border-b border-slate-800">
                                    {attachedFiles.map((file, i) => (
                                        <div key={i} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                                            <div className="w-full h-full flex items-center justify-center">
                                              {file.type.startsWith('image/') ? (
                                                <img 
                                                  src={URL.createObjectURL(file)} 
                                                  alt="preview" 
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <ImageIcon className="w-5 h-5 text-slate-500" />
                                              )}
                                            </div>
                                            <button 
                                                onClick={() => removeFile(i)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Textarea
                                value={newPrompt}
                                onChange={(e) => setNewPrompt(e.target.value)}
                                placeholder="Refine your design or add new features..."
                                className="min-h-[100px] w-full bg-slate-900/50 border-0 p-4 pb-12 text-base text-slate-100 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none transition-all"
                                onKeyDown={handleKeyDown}
                                disabled={isGenerating}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-3">
                                {isGenerating && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                                <Button
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all shadow-lg active:scale-95",
                                        newPrompt.trim() 
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40" 
                                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    )}
                                    onClick={handleSendNewPrompt}
                                    disabled={!newPrompt.trim() || isGenerating}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                    <span className="sr-only">Send prompt</span>
                                </Button>
                            </div>
                        </div>
                        <p className="mt-3 text-center text-xs text-slate-500 italic">
                            Press Enter to send. Use Shift+Enter for new line.
                        </p>
                    </div>
                </div>

                {/* Info & Work Steps Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {/* Previous Prompt Context */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Last Instruction</h3>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 h-20 overflow-y-auto">
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                {previousPrompt || "No instructions provided yet."}
                            </p>
                        </div>
                    </div>

                    {/* AI Work Steps */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Generation Process</h3>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 h-20 overflow-hidden">
                            <WorkSteps
                                isGenerating={isGenerating}
                                generationComplete={generationComplete}
                                generatedCode={isEditable ? editedCode : generatedCode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function PreviewPanel({
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
}: PreviewPanelProps) {

    // -----------------------------------------------------------------------------
    // Inline Edit Script Injection
    // -----------------------------------------------------------------------------
    const getEnhancedPreviewContent = () => {
        const navBlockerScript = `
            <script id="nav-blocker">
                (function() {
                    document.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link) {
                            const href = link.getAttribute('href');
                            if (href && (href.startsWith('/') || href === '#' || (!href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel')))) {
                                e.preventDefault();
                                console.log('Navigation blocked in preview:', href);
                            }
                        }
                    }, true);
                    document.addEventListener('submit', (e) => {
                        e.preventDefault();
                        console.log('Form submission blocked in preview');
                    }, true);
                })();
            <\/script>
        `;

        let content = previewContent;
        if (content.includes('</body>')) {
            content = content.replace('</body>', `${navBlockerScript}</body>`);
        } else {
            content = `${content}${navBlockerScript}`;
        }

        if (!isLiveEditEnabled) return content;

        const liveEditScript = `
            <style id="live-edit-style">
                .live-edit-active { outline: 2px dashed #3b82f6 !important; outline-offset: 4px; border-radius: 4px; transition: outline 0.2s ease; cursor: text !important; }
                [contenteditable="true"]:focus { outline: 2px solid #3b82f6 !important; }
            </style>
            <script id="live-edit-script">
                (function() {
                    let activeElement = null;
                    document.body.addEventListener('click', (e) => {
                        const target = e.target.closest('p, h1, h2, h3, h4, h5, h6, span, button, a, li');
                        if (target) {
                            if (activeElement === target) return;
                            if (activeElement) {
                                activeElement.contentEditable = "false";
                                activeElement.classList.remove('live-edit-active');
                            }
                            activeElement = target;
                            target.contentEditable = "true";
                            target.classList.add('live-edit-active');
                            target.focus();
                        }
                    });
                    document.body.addEventListener('input', (e) => {
                        const cleanHtml = document.documentElement.outerHTML
                            .replace(/ contenteditable="true"/g, '')
                            .replace(/ live-edit-active/g, '')
                            .replace(/<style id="live-edit-style">.*?<\\/style>/s, '')
                            .replace(/<script id="live-edit-script">.*?<\\/script>/s, '')
                            .replace(/<script id="nav-blocker">.*?<\\/script>/s, '');
                        
                        window.parent.postMessage({
                            type: 'LIVE_EDIT_CHANGE',
                            content: cleanHtml
                        }, '*');
                    });
                })();
            <\/script>
        `;

        if (content.includes('</body>')) {
            return content.replace('</body>', `${liveEditScript}</body>`);
        }
        return `${content}${liveEditScript}`;
    };

    const finalContent = getEnhancedPreviewContent();

    // Calculate responsive width for the iframe container
    const iframeWidthClass =
        viewportSize === "desktop" ? "w-full h-full" :
            viewportSize === "tablet" ? "w-[768px] max-h-full" :
                "w-[375px] max-h-full";

    return (
        <div className="h-full flex flex-col">
            {/* Preview Toolbar */}
            <div className="p-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <h2 className="text-sm font-medium">LIVE PREVIEW</h2>
                <div className="flex items-center gap-1">
                    {generationComplete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 mr-2 text-gray-400 hover:text-white"
                            onClick={refreshPreview}
                            title="Refresh preview"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            <span className="text-xs hidden sm:inline">Refresh</span>
                        </Button>
                    )}
                    {/* Viewport Toggles */}
                    <Button
                        variant={viewportSize === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("desktop")}
                    >
                        <Laptop className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewportSize === "tablet" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("tablet")}
                    >
                        <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewportSize === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("mobile")}
                    >
                        <Smartphone className="w-4 h-4" />
                    </Button>
                    <div className="mx-2 w-[1px] h-4 bg-gray-800" />
                    <div className="flex items-center space-x-2 mr-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", isLiveEditEnabled ? "text-blue-400" : "text-slate-500")}>
                            {isLiveEditEnabled ? "Live Edit ON" : "Live Edit"}
                        </span>
                        <Switch
                            checked={isLiveEditEnabled}
                            onCheckedChange={setIsLiveEditEnabled}
                            disabled={!generationComplete || isGenerating}
                            className="scale-75 data-[state=checked]:bg-blue-600"
                        />
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-lg shadow-blue-900/20"
                        onClick={onDeploy}
                        disabled={!originalCode && !editedCode}
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Deploy
                    </Button>
                </div>
            </div>

            {/* Iframe Viewport Area */}
            <div className="flex-1 p-3 flex items-center justify-center overflow-hidden">
                <div className={`bg-gray-900 rounded-md border border-gray-800 overflow-hidden transition-all duration-300 ${iframeWidthClass}`}>
                    {!originalCode && !editedCode ? (
                        // Empty State
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
                            {isGenerating ? (
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 mb-2 mx-auto animate-spin" />
                                    <p>Generating preview...</p>
                                </div>
                            ) : (
                                <p>No preview available yet</p>
                            )}
                        </div>
                    ) : (
                        // Active Preview State
                        <div className="w-full h-full relative">
                            <iframe
                                key={previewKey}
                                srcDoc={finalContent}
                                className="w-full h-full absolute inset-0 z-10"
                                title="Preview"
                                sandbox="allow-scripts allow-same-origin"
                                style={{
                                    backgroundColor: '#121212',
                                    opacity: 1,
                                    transition: 'opacity 0.15s ease-in-out'
                                }}
                            />

                            {/* Updating Indicator Overlay */}
                            {isGenerating && (
                                <div className="absolute bottom-4 right-4 z-20 bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Updating preview...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
