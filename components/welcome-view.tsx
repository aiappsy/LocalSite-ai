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

interface Model {
  id: string
  name: string
}

interface WelcomeViewProps {
  prompt: string
  setPrompt: (value: string) => void
  onGenerate: () => void
}

export function WelcomeView({
  prompt,
  setPrompt,
  onGenerate
}: WelcomeViewProps) {
  const [titleClass, setTitleClass] = useState("pre-animation")

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleClass("typing-animation")
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-slate-950">
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1
          className={`text-4xl md:text-5xl font-bold tracking-tight text-white mb-12 text-center ${titleClass}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          WHAT ARE WE BUILDING?
        </h1>

        <div className="relative w-full mb-6 group">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the website you want to create..."
            className="min-h-[180px] w-full bg-slate-900/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-white placeholder:text-slate-500 pr-4 pb-16 transition-all duration-300 resize-none text-lg leading-relaxed rounded-xl"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest hidden sm:block">
               Press Cmd + Enter to generate
             </p>
            <Button
              onClick={onGenerate}
              disabled={!prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 px-10 text-base rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20 border-0"
            >
              GENERATE
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-8 opacity-60">
           <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">1</div>
              <p className="text-xs font-medium text-slate-300">Describe your idea</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">2</div>
              <p className="text-xs font-medium text-slate-300">Choose your model</p>
           </div>
           <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-slate-800/50 bg-slate-900/20">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">3</div>
              <p className="text-xs font-medium text-slate-300">Preview & Iterative</p>
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
