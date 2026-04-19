"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Import only the icons that are actually used
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ProviderSelector } from "@/components/provider-selector"
import { AlertCircle, Key as KeyIcon, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LLMProvider } from "@/lib/providers/config"

interface Model {
  id: string
  name: string
}

interface WelcomeViewProps {
  prompt: string
  setPrompt: (value: string) => void
  onGenerate: () => void
  onOpenSettings: () => void
  hasApiKey: boolean
  providerName: string
}

export function WelcomeView({
  prompt,
  setPrompt,
  onGenerate,
  onOpenSettings,
  hasApiKey,
  providerName
}: WelcomeViewProps) {
  const [titleClass, setTitleClass] = useState("pre-animation")

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleClass("typing-animation")
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const TEMPLATES = [
    { title: "SaaS Landing Page", icon: "🚀", prompt: "A modern, high-converting SaaS landing page for a cloud-based project management tool. Use glassmorphism, GSAP animations, and a Bento grid for features." },
    { title: "Digital Portfolio", icon: "🎨", prompt: "An elite creative portfolio for a senior product designer. Minimalist, high contrast, smooth transitions, and premium typography." },
    { title: "Business Site", icon: "🏢", prompt: "A professional corporate website for a high-end law firm. Sophisticated serif typography, deep indigo accents, and a clean, trustworthy layout." },
    { title: "AI Startup", icon: "🤖", prompt: "A futuristic landing page for a new AI startup. Dynamic dark mode, neon accents, and interactive hero section using GSAP." }
  ]

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-y-auto custom-scrollbar bg-slate-950">
      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center py-12">
        <h1
          className={`text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 text-center ${titleClass}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          WHAT ARE WE BUILDING?
        </h1>
        <p className="text-slate-400 text-center mb-10 max-w-md text-sm">
          Aiappsy WebCrafter turns your vision into production-ready code using the world's most powerful AI models.
        </p>
        
        {!hasApiKey && (
          <Alert className="mb-8 bg-blue-600/10 border-blue-500/20 text-blue-200 py-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <div className="flex-1 ml-3">
              <AlertTitle className="text-sm font-semibold mb-0.5">Professional Control Enabled</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed opacity-80">
                To build with professional precision, you'll need to connect your own API Key. 
                <strong> This keeps your costs at industry-low rates and gives you 100% control over your data.</strong>
              </AlertDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenSettings}
              className="ml-4 h-8 text-[10px] bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 text-blue-400"
            >
              <Settings className="w-3 h-3 mr-1" /> Get Connected
            </Button>
          </Alert>
        )}

        <div className="relative w-full mb-8 group">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the website you want to create..."
            className="min-h-[160px] w-full bg-slate-900/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder:text-slate-500 pr-4 pb-16 transition-all duration-300 resize-none text-lg leading-relaxed rounded-2xl shadow-2xl"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest hidden sm:block">
               Cmd + Enter to generate
             </p>
            <Button
              onClick={onGenerate}
              disabled={!prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-12 text-base rounded-xl transition-all duration-200 shadow-xl shadow-blue-900/40 border-0 active:scale-95"
            >
              GENERATE
            </Button>
          </div>
        </div>

        <div className="w-full space-y-4 mb-12">
          <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] px-1">Quick Start Masterpieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.title}
                onClick={() => setPrompt(tpl.prompt)}
                className="flex flex-col items-start gap-2 p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/40 hover:border-blue-500/50 transition-all text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{tpl.icon}</span>
                <span className="text-[11px] font-semibold text-slate-300 leading-tight">{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4 border-t border-slate-900 pt-12 opacity-80">
           <div className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/20">01</div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Vision</p>
              <p className="text-[10px] text-slate-500 px-2">Describe your site in plain language. No code required.</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/20">02</div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Precision</p>
              <p className="text-[10px] text-slate-500 px-2">Choose models like DeepSeek-V3 for elite design accuracy.</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2 p-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/20">03</div>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">Control</p>
              <p className="text-[10px] text-slate-500 px-2">Sync to GitHub and deploy to your own servers in one click.</p>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        .pre-animation {
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          border-right: 4px solid transparent;
        }

        .typing-animation {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 4px solid #3b82f6;
          animation:
            typing 1.5s steps(40, end),
            blink-caret 0.75s step-end infinite;
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #3b82f6 }
        }
      `}</style>
    </div>
  )
}
