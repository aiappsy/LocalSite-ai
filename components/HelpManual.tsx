"use client"

import React from "react"
import { 
  X, 
  HelpCircle, 
  Zap, 
  Key, 
  Cpu, 
  Sliders, 
  Brain, 
  Palmtree, 
  Info,
  Rocket,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface HelpManualProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpManual({ isOpen, onClose }: HelpManualProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-slate-950 border-0 p-0 overflow-y-auto z-[100] custom-scrollbar">
        <div className="max-w-4xl mx-auto py-16 px-6 text-slate-200 relative">
          <DialogClose className="fixed top-8 right-8 p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors z-[110]">
            <X className="w-8 h-8 text-slate-400" />
          </DialogClose>

          <DialogHeader className="mb-16">
            <div className="flex items-center gap-4 mb-4 text-blue-400">
              <Rocket className="w-12 h-12" />
              <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent" />
            </div>
            <DialogTitle className="text-5xl font-extrabold tracking-tight text-white mb-2">
              🚀 Aiappsy WebCrafter: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">User Guide & AI Mastery</span>
            </DialogTitle>
            <p className="text-xl text-slate-400 font-medium">Version 0.6.0 Redesign</p>
            <p className="text-lg text-slate-400 mt-6 leading-relaxed max-w-2xl">
              Welcome to the future of web development. **Aiappsy WebCrafter** isn't just a code generator; it's your collaborative design partner.
            </p>
          </DialogHeader>

          <div className="grid gap-20 pb-32">
            
            {/* Step 1 */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-7xl font-black text-slate-900 select-none">01</div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Key className="w-8 h-8 text-blue-400" />
                Step 1: Unlocking the Engine (API Keys)
              </h2>
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <p className="text-slate-300">To start building, you need to connect your engine. WebCrafter uses **OpenRouter** to access the world's best AI models securely.</p>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">1</span>
                    <p><span className="text-white font-medium text-lg">Get Your Key:</span> Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenRouter.ai</a> and create an account.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">2</span>
                    <p><span className="text-white font-medium text-lg">Copy Your Key:</span> Generate a new API key.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">3</span>
                    <p><span className="text-white font-medium text-lg">Connect:</span> In WebCrafter, click the **⚙️ Settings** icon → **API Keys** → Paste your key.</p>
                  </li>
                </ol>
                <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    <span className="text-blue-300 font-bold uppercase text-[10px] tracking-widest block mb-1">Security Note</span>
                    Your key is stored **locally in your browser**. It never leaves your device except to communicate directly with the AI provider.
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-7xl font-black text-slate-900 select-none">02</div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-indigo-400" />
                Step 2: Choose Your AI Partner
              </h2>
              <p className="text-slate-400 mb-8 max-w-2xl">Not all AIs are created equal. Depending on what you're building, choose the model that fits your needs.</p>
              
              <div className="grid gap-6">
                {/* Gemini Flash */}
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <span className="text-2xl">🥉</span> The Sprinter: Gemini Flash
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded">💰 Very Low Cost</span>
                  </div>
                  <ul className="space-y-3 text-slate-400 text-sm">
                    <li><span className="text-slate-200 font-medium">Best For:</span> Rapid prototyping, simple landing pages, brainstorming.</li>
                    <li><span className="text-slate-200 font-medium">Why:</span> It's incredibly fast and the most cost-effective.</li>
                    <li><span className="text-slate-500 font-mono text-xs">google/gemini-1.5-flash</span></li>
                  </ul>
                </div>

                {/* DeepSeek */}
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <span className="text-2xl">🥈</span> The Engineer: DeepSeek V3
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-1 rounded">💰 Low Cost</span>
                  </div>
                  <ul className="space-y-3 text-slate-400 text-sm">
                    <li><span className="text-slate-200 font-medium">Best For:</span> Complex logic, interactive features, balanced budget.</li>
                    <li><span className="text-slate-200 font-medium">Why:</span> It writes smart JavaScript and handles logic better than most.</li>
                    <li><span className="text-slate-500 font-mono text-xs">deepseek/deepseek-chat</span></li>
                  </ul>
                </div>

                {/* Claude */}
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <span className="text-2xl">🥇</span> The Architect: Claude 3.5 Sonnet
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">💎 Premium Cost</span>
                  </div>
                  <ul className="space-y-3 text-slate-400 text-sm">
                    <li><span className="text-slate-200 font-medium">Best For:</span> Production-ready code, pixel-perfect design, complex UI.</li>
                    <li><span className="text-slate-200 font-medium">Why:</span> The industry leader for frontend code and design aesthetics.</li>
                    <li><span className="text-indigo-400/50 font-mono text-xs">anthropic/claude-3.5-sonnet</span></li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 flex gap-4">
                <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                <p className="text-slate-300 text-sm italic">
                  **Pro Tip:** Start with **Gemini Flash** to sketch your idea. Once you're happy with the layout, switch to **Claude 3.5 Sonnet** to refine and polish the code for production.
                </p>
              </div>
            </section>

            {/* Step 3 */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-7xl font-black text-slate-900 select-none">03</div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Sliders className="w-8 h-8 text-emerald-400" />
                Step 3: Fine-Tuning Your Build
              </h2>
              <p className="text-slate-400 mb-8">Access **Advanced Model Controls** via the sliders icon to tune for perfect code:</p>
              
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/30">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Control</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Setting</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <tr>
                      <td className="px-6 py-6 font-bold text-white">Temperature</td>
                      <td className="px-6 py-6 text-blue-400 font-mono">0.2 – 0.5</td>
                      <td className="px-6 py-6 text-sm text-slate-400 leading-relaxed">
                        <span className="text-slate-200 font-bold block mb-1">Keep it Low.</span> 
                        Code needs precision. High temperature = broken code.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-6 font-bold text-white">Top P</td>
                      <td className="px-6 py-6 text-blue-400 font-mono">0.9</td>
                      <td className="px-6 py-6 text-sm text-slate-400 leading-relaxed">
                        <span className="text-slate-200 font-bold block mb-1">Stay Focused.</span> 
                        Ensures the AI stays focused on valid syntax.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-6 font-bold text-white">Max Tokens</td>
                      <td className="px-6 py-6 text-blue-400 font-mono">4096+</td>
                      <td className="px-6 py-6 text-sm text-slate-400 leading-relaxed">
                        <span className="text-slate-200 font-bold block mb-1">Set High.</span> 
                        Prevents cut-offs mid-file in long CSS or JS sections.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Step 4 */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-7xl font-black text-slate-900 select-none">04</div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                Step 4: Guiding the Persona
              </h2>
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <p className="text-slate-300">Set the rules of engagement in the **System Instructions** box. This persists across all generations.</p>
                
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">Copy & Paste This for Best Results:</h4>
                  <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-blue-400 text-sm font-mono overflow-x-auto">
{`You are an expert Frontend Web Developer. 
- Generate single-file HTML solutions with embedded CSS and JavaScript.
- Use Tailwind CSS via CDN for all styling.
- Ensure designs are fully responsive (Mobile, Tablet, Desktop).
- Do not explain the code; only output the code block ready for preview.
- Focus on modern, clean aesthetics with proper spacing and typography.`}
                  </pre>
                </div>

                <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Palmtree className="w-4 h-4 text-purple-400" />
                    Want a Specific Style?
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Add to the instructions: <span className="text-purple-300 italic">"Use a dark mode color palette with neon accents"</span> or <span className="text-purple-300 italic">"Mimic the style of Apple.com with minimalism."</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section className="relative">
              <div className="absolute -left-12 top-0 text-7xl font-black text-slate-900 select-none">05</div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                Step 5: The Workflow of Champions
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4 p-6 rounded-3xl bg-slate-900/30 border border-slate-800">
                   <h4 className="text-white font-bold">1. Describe the Vision</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     *Bad:* "Make a website."<br/>
                     *Good:* "Build a portfolio site for a photographer with a masonry grid gallery, dark theme, and a contact form."
                   </p>
                </div>
                <div className="space-y-4 p-6 rounded-3xl bg-slate-900/30 border border-slate-800">
                   <h4 className="text-white font-bold">2. Preview & Iterate</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     Don't regenerate for small changes. Ask: *"Change the primary button color to blue."*
                   </p>
                </div>
                <div className="space-y-4 p-6 rounded-3xl bg-slate-900/30 border border-slate-800">
                   <h4 className="text-white font-bold">3. Edit Manually</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     Use the Monaco Editor to tweak small details instantly. You are the captain.
                   </p>
                </div>
                <div className="space-y-4 p-6 rounded-3xl bg-slate-900/30 border border-slate-800">
                   <h4 className="text-white font-bold">4. Switch Viewports</h4>
                   <p className="text-slate-400 text-sm leading-relaxed">
                     Click the Tablet or Mobile icons to ensure responsive designs look great.
                   </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-red-400" />
                Troubleshooting & Tips
              </h2>
              <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                <li className="space-y-1">
                  <span className="text-white font-bold text-sm block">Code Cut Off?</span>
                  <span className="text-slate-400 text-sm leading-relaxed">Regenerate or increase **Max Tokens**.</span>
                </li>
                <li className="space-y-1">
                  <span className="text-white font-bold text-sm block">Safety Filter Blocked?</span>
                  <span className="text-slate-400 text-sm leading-relaxed">Switch to **DeepSeek** or **Claude** for complex scripts.</span>
                </li>
                <li className="space-y-1">
                  <span className="text-white font-bold text-sm block">Preview Blank?</span>
                  <span className="text-slate-400 text-sm leading-relaxed">Check console (F12). Ask AI: *"Fix the JS error in preview."*</span>
                </li>
                <li className="space-y-1">
                  <span className="text-white font-bold text-sm block">Managing Costs</span>
                  <span className="text-slate-400 text-sm leading-relaxed">Use **Gemini Flash** for prototyping, save **Claude** for finishing.</span>
                </li>
              </ul>
            </section>

            {/* Final Call to Action */}
            <div className="text-center py-12 border-t border-slate-800">
              <h2 className="text-3xl font-black text-white mb-4">🌟 You Are the Creator</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Aiappsy WebCrafter puts the power of a full development team in your browser. The AI handles the syntax; you handle the vision.
              </p>
              <Button onClick={onClose} className="px-12 py-6 h-auto text-lg font-bold bg-blue-600 hover:bg-blue-500 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                Ready to Build! 🚀
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
