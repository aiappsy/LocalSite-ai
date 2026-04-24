import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { CodeEditor } from "@/components/code-editor"
import { WorkSteps } from "@/components/work-steps"
import { getModelCapabilities } from "@/lib/providers/capabilities"
import { SystemInstructions } from "@/components/SystemInstructions"
import { useRef, useState } from "react"
import { 
    Maximize2,
    ExternalLink,
    Smartphone,
    Tablet,
    Laptop,
    Copy,
    RefreshCw,
    Loader2,
    Save,
    ArrowRight,
    Globe,
    Paperclip,
    X,
    Image as ImageIcon,
    AlertTriangle,
    Share2,
    Brain
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
    systemPrompt: string
    setSystemPrompt: (value: string) => void
    isSystemInstructionsOpen: boolean
    setIsSystemInstructionsOpen: (value: boolean) => void
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
    onPersonaChange,
    systemPrompt,
    setSystemPrompt,
    isSystemInstructionsOpen,
    setIsSystemInstructionsOpen
}: CodePanelProps) {

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
        <div className="h-full flex flex-col">
        {/* System Instructions Section */}
            <SystemInstructions 
                value={systemPrompt}
                onChange={setSystemPrompt}
                isOpen={isSystemInstructionsOpen}
                onToggle={() => setIsSystemInstructionsOpen(!isSystemInstructionsOpen)}
            />

            {/* 
        CODE EDITOR SECTION 
        Focus purely on the code editor in the new Studio layout.
      */}
            <div className="flex-1 flex flex-col bg-[#0b0b0d]">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-[#131314]">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Buffer</span>
                        {generationComplete && (
                            <div className="flex items-center gap-2 ml-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-mono text-slate-600 uppercase">
                                    {isEditable ? 'Write' : 'Read'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (Save, Copy) */}
                    <div className="flex items-center gap-1">
                        {generationComplete && (
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
                              className="scale-75 data-[state=checked]:bg-blue-600"
                          />
                        )}
                        <div className="h-3 w-px bg-white/5 mx-1" />
                        {isEditable && hasChanges && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-emerald-500 hover:text-emerald-400 font-mono text-[9px]"
                                onClick={saveChanges}
                            >
                                SAVE
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-slate-500 hover:text-white font-mono text-[9px]"
                            onClick={copyToClipboard}
                            disabled={!generatedCode || isGenerating}
                        >
                            {copySuccess ? "COPIED" : "COPY"}
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
    const [isMaximized, setIsMaximized] = useState(false);

    // -----------------------------------------------------------------------------
    // Helper: Open in New Tab
    // -----------------------------------------------------------------------------
    const openInNewTab = () => {
        const blob = new Blob([previewContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

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
            <div className="px-3 py-1.5 border-b border-white/5 bg-[#131314] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Viewport</span>
                    <div className="flex items-center gap-0.5">
                        {/* Viewport Toggles */}
                        <Button
                            variant={viewportSize === "desktop" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md"
                            onClick={() => setViewportSize("desktop")}
                        >
                            <Laptop className="w-3 h-3" />
                        </Button>
                        <Button
                            variant={viewportSize === "tablet" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md"
                            onClick={() => setViewportSize("tablet")}
                        >
                            <Tablet className="w-3 h-3" />
                        </Button>
                        <Button
                            variant={viewportSize === "mobile" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-6 w-6 p-0 rounded-md"
                            onClick={() => setViewportSize("mobile")}
                        >
                            <Smartphone className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 mr-2">
                        <span className={cn("text-[9px] font-mono uppercase tracking-wider transition-colors", isLiveEditEnabled ? "text-blue-400" : "text-slate-600")}>
                            Live Edit
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
                        className="h-6 px-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[9px] tracking-wider"
                        onClick={onDeploy}
                        disabled={!originalCode && !editedCode}
                    >
                        DEPLOY
                    </Button>
                    <div className="h-3 w-px bg-white/5 mx-1" />
                    <TooltipProvider>
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-md hover:bg-white/5"
                                        onClick={() => setIsMaximized(true)}
                                        disabled={!originalCode && !editedCode}
                                    >
                                        <Maximize2 className="w-3 h-3 text-slate-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Maximize Preview</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 rounded-md hover:bg-white/5"
                                        onClick={openInNewTab}
                                        disabled={!originalCode && !editedCode}
                                    >
                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Open in New Tab</TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            {/* Maximized Modal */}
            <Dialog open={isMaximized} onOpenChange={setIsMaximized}>
                <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] bg-[#1c1c1f] border-white/5 p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="px-4 py-2 border-b border-white/5 flex flex-row items-center justify-between">
                        <DialogTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Studio Masterpiece Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full relative bg-white">
                        <iframe
                            key={`fs-${previewKey}`}
                            srcDoc={finalContent}
                            className="w-full h-full border-none"
                            title="Full Screen Preview"
                            sandbox="allow-scripts allow-same-origin"
                        />
                    </div>
                </DialogContent>
            </Dialog>

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
