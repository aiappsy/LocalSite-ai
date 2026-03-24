'use client';

import React from 'react';
import { 
  Rocket, 
  Zap, 
  ShoppingBag, 
  Home, 
  HeartPulse, 
  Utensils, 
  Palette, 
  GraduationCap, 
  Globe, 
  Cpu,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PromptItem {
  id: string;
  title: string;
  niche: string;
  icon: any;
  color: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'orange' | 'indigo' | 'cyan' | 'sky' | 'violet';
  content: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'bg-blue-500', hoverBorder: 'hover:border-blue-500/50' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'bg-purple-500', hoverBorder: 'hover:border-purple-500/50' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'bg-amber-500', hoverBorder: 'hover:border-amber-500/50' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'bg-emerald-500', hoverBorder: 'hover:border-emerald-500/50' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'bg-rose-500', hoverBorder: 'hover:border-rose-500/50' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', glow: 'bg-orange-500', hoverBorder: 'hover:border-orange-500/50' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', glow: 'bg-indigo-500', hoverBorder: 'hover:border-indigo-500/50' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', glow: 'bg-cyan-500', hoverBorder: 'hover:border-cyan-500/50' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', glow: 'bg-sky-500', hoverBorder: 'hover:border-sky-500/50' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', glow: 'bg-violet-500', hoverBorder: 'hover:border-violet-500/50' },
};

const PROMPTS: PromptItem[] = [
  {
    id: 'fintech',
    title: 'Fintech Dashboard',
    niche: 'SaaS / Finance',
    icon: Zap,
    color: 'blue',
    content: "Create a premium, dark-themed analytics dashboard for a fintech SaaS. Features: Glassmorphism cards with subtle backdrop-blur, interactive SVG line charts for 'Revenue Growth', a 'Recent Transactions' list with micro-animations on hover, and a sleek sidebar with active states. Use a palette of Deep Slate and Electric Blue accents."
  },
  {
    id: 'ai-tech',
    title: 'AI Model Explorer',
    niche: 'AI / Technology',
    icon: Cpu,
    color: 'purple',
    content: "Design an innovative AI model explorer interface. Include a terminal-style console for real-time logs, an interactive 3D-effect neural network visualization using CSS/SVG, and a 'Model Settings' panel with HSL-accented glass sliders. The aesthetic should be 'Cyberpunk Minimalist' with neon purple highlights."
  },
  {
    id: 'luxury-fashion',
    title: 'Luxury Fashion Store',
    niche: 'E-commerce',
    icon: ShoppingBag,
    color: 'amber',
    content: "Build a high-end luxury fashion store landing page. Use large, high-resolution image placeholders, Serif typography (Outfit/Playfair Display) via Google Fonts, and 'reveal on scroll' entrance animations. Implement a minimalist navigation that stays fixed on scroll and a smooth quick-view modal for products."
  },
  {
    id: 'real-estate',
    title: 'Architectural Portfolio',
    niche: 'Real Estate',
    icon: Home,
    color: 'emerald',
    content: "Develop a modern architectural portfolio site using a 'Bento Box' grid layout. Features: Parallax scroll effects for featured properties, a sleek contact form with floating labels, and an interactive image gallery that expands into a full-screen light-box with smooth transitions."
  },
  {
    id: 'wellness',
    title: 'Mindful Meditation App',
    niche: 'Health / Wellness',
    icon: HeartPulse,
    color: 'rose',
    content: "Design a serene meditation app interface. Use soft pastel HSL colors (Mint, Soft Rose), a 'breathing' pulse animation for the main action button, and smooth fade-in transitions between sessions. Include a minimalist progress ring for 'Daily Streak' with SVG stroke-dasharray animations."
  },
  {
    id: 'dining',
    title: 'Michelin Star Menu',
    niche: 'Food / Dining',
    icon: Utensils,
    color: 'orange',
    content: "Create a vibrant, interactive Michelin-star restaurant menu. Use elegant Gold-to-Copper gradients, serif accents, and a cross-fade 'Chef's Specials' carousel. Implement a smooth scroll-behavior between 'Appetizers', 'Main Course', and 'Desserts' with category-specific micro-interactions."
  },
  {
    id: 'creative-agency',
    title: 'Digital Design Studio',
    niche: 'Creative Agency',
    icon: Palette,
    color: 'indigo',
    content: "Build a bold, high-contrast creative agency landing page. Features: Brutalist-inspired large typography, hover-triggered image reveals that follow the cursor, and 'magnetic' buttons. Use a monochromatic layout with one high-saturation accent color like 'International Orange'."
  },
  {
    id: 'edu-platform',
    title: 'Gamified Learning',
    niche: 'Education',
    icon: GraduationCap,
    color: 'cyan',
    content: "Design a gamified E-learning dashboard. Include progress rings with SVG animations, a 'Leaderboard' with smooth re-ordering transitions, and course cards that scale slightly on hover. Implement a 'Current Lesson' player with glassmorphism controls and sleek progress bars."
  },
  {
    id: 'travel-space',
    title: 'Space Tourism Explorer',
    niche: 'Travel / Adventure',
    icon: Globe,
    color: 'sky',
    content: "Develop an immersive 'Space Journey' landing page. Use deep space black, CSS-powered starfield background, and futuristic typography. Features: A 'Book Your Flight' modal with a 3D glassmorphism effect and interactive planet selection cards with subtle glow transitions."
  },
  {
    id: 'web3-wallet',
    title: 'Next-Gen Crypto Wallet',
    niche: 'Web3 / Crypto',
    icon: Rocket,
    color: 'violet',
    content: "Create a cutting-edge Crypto Wallet interface. Features: A Neumorphic main card showing balance, a real-time 'Token Swap' interface with micro-interactions on input, and a 'Recent Activity' feed with 1ms-style entrance animations. Use a vibrant 'Cyber-Blue' and 'Hyper-Lime' color scheme."
  }
];

interface PromptLibraryProps {
  onSelect: (content: string) => void;
}

export function PromptLibrary({ onSelect }: PromptLibraryProps) {
  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Rocket className="w-6 h-6 text-blue-500" />
          World-Class Prompt Library
        </h2>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Select a niche-specific template to generate a premium, innovative interface. 
          Each prompt is designed to trigger the AI's "Expert Persona" for maximum quality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROMPTS.map((prompt) => {
          const styles = colorMap[prompt.color];
          return (
            <div 
              key={prompt.id}
              className={cn(
                "group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:bg-slate-900 transition-all duration-300 flex flex-col h-full overflow-hidden",
                styles.hoverBorder
              )}
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                styles.glow
              )} />

              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  styles.bg,
                  styles.text
                )}>
                  <prompt.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 bg-slate-800/50 rounded-md">
                  {prompt.niche}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {prompt.title}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1 italic leading-relaxed">
                "{prompt.content}"
              </p>

              <Button 
                onClick={() => onSelect(prompt.content)}
                className="w-full bg-slate-800 hover:bg-blue-600 text-white gap-2 group/btn rounded-xl"
              >
                Use this Template
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center text-center">
        <Sparkles className="w-10 h-10 text-slate-700 mb-4" />
        <h4 className="text-slate-300 font-bold">More templates coming soon</h4>
        <p className="text-sm text-slate-500 mt-1">Our library is updated weekly with the latest design trends.</p>
      </div>
    </div>
  );
}
