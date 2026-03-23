"use client"

import React from "react"
import { 
  X, 
  HelpCircle, 
  Info, 
  Settings2, 
  Key, 
  MessageSquare, 
  Terminal, 
  Home,
  ShieldCheck,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog"

interface HelpManualProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpManual({ isOpen, onClose }: HelpManualProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-slate-950 border-0 p-0 overflow-y-auto z-[100]">
        <div className="max-w-4xl mx-auto py-12 px-6 text-slate-200 relative">
          <DialogClose className="fixed top-8 right-8 p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors z-[110]">
            <X className="w-8 h-8 text-slate-400" />
          </DialogClose>

          <DialogHeader className="mb-12">
            <div className="flex items-center gap-4 mb-4 text-blue-400">
              <HelpCircle className="w-12 h-12" />
              <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent" />
            </div>
            <DialogTitle className="text-5xl font-bold tracking-tight text-white">
              Aiappsy WebCrafter <span className="text-blue-500 text-2xl ml-2">v0.6.0</span>
            </DialogTitle>
            <p className="text-xl text-slate-400 mt-4 leading-relaxed">
              Welcome to your professional AI workspace. This manual will guide you through the features and settings of WebCrafter.
            </p>
          </DialogHeader>

          <div className="grid gap-16 pb-24">
            {/* Section 1: Overview */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-400" />
                Quick Start
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-medium text-white mb-2 underline decoration-blue-500/50 underline-offset-4">1. Configure Your Keys</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Head to the **API Keys** tab. Add your Google, OpenRouter, or DeepSeek keys. We store these securely in your browser's local storage—they never touch our database.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-lg font-medium text-white mb-2 underline decoration-blue-500/50 underline-offset-4">2. Pick Your Model</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Use the right-side **Settings Panel** to choose your provider and model. Whether it's the speed of Gemini Flash or the reasoning of DeepSeek R1, the choice is yours.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Model Settings Explained */}
            <section className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-blue-400" />
                Advanced Model Parameters
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Temperature</h3>
                  <p className="text-slate-400 leading-relaxed italic">
                    Controls randomness. Lower values (e.g., 0.2) make the model more deterministic and focused, ideal for code. Higher values (e.g., 1.0) encourage creativity and diversity.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Top P (Nucleus Sampling)</h3>
                  <p className="text-slate-400 leading-relaxed italic">
                    An alternative to temperature. It limits the model's choices to the top "probability mass." Setting this to 0.9 means the model only considers the most likely 90% of outcomes.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-300 mb-2">Output Length (Max Tokens)</h3>
                  <p className="text-slate-400 leading-relaxed italic">
                    The maximum number of tokens (words/characters) the model can generate in one go. Useful for preventing unnecessarily long or truncated responses.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Pro Tips */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                Workspace Features
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                <li className="flex gap-4 p-4 rounded-xl hover:bg-slate-900 transition-colors">
                  <Terminal className="w-5 h-5 text-slate-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-medium block">System Instructions</span>
                    <span className="text-slate-500 text-sm">Fine-tune the AI's persona and coding style in the Chat tab.</span>
                  </div>
                </li>
                <li className="flex gap-4 p-4 rounded-xl hover:bg-slate-900 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-medium block">Safety Filters</span>
                    <span className="text-slate-500 text-sm">Adjust content safety thresholds for Google Gemini models.</span>
                  </div>
                </li>
                <li className="flex gap-4 p-4 rounded-xl hover:bg-slate-900 transition-colors">
                  <MessageSquare className="w-5 h-5 text-slate-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-medium block">Real-time Thinking</span>
                    <span className="text-slate-500 text-sm">Models like DeepSeek Reasoner show their internal monologue as they work.</span>
                  </div>
                </li>
                <li className="flex gap-4 p-4 rounded-xl hover:bg-slate-900 transition-colors">
                  <Home className="w-5 h-5 text-slate-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-medium block">Resizable Workflow</span>
                    <span className="text-slate-500 text-sm">Drag the handles between panes to customize your perfect view.</span>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-800 text-center text-slate-500 text-sm">
            &copy; 2026 Aiappsy WebCrafter. Designed for high-performance AI integration.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
