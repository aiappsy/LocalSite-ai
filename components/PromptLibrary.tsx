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
  Sparkles,
  Shield,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PromptItem {
  id: string;
  title: string;
  niche: string;
  icon: any;
  color: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'orange' | 'indigo' | 'cyan' | 'sky' | 'violet' | 'fuchsia';
  content: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hoverBorder: 'hover:border-blue-400/50', glow: 'bg-blue-500/10' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hoverBorder: 'hover:border-purple-400/50', glow: 'bg-purple-500/10' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hoverBorder: 'hover:border-amber-400/50', glow: 'bg-amber-500/10' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-400/50', glow: 'bg-emerald-500/10' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', hoverBorder: 'hover:border-rose-400/50', glow: 'bg-rose-500/10' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', hoverBorder: 'hover:border-orange-400/50', glow: 'bg-orange-500/10' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', hoverBorder: 'hover:border-indigo-400/50', glow: 'bg-indigo-500/10' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', hoverBorder: 'hover:border-cyan-400/50', glow: 'bg-cyan-500/10' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', hoverBorder: 'hover:border-sky-400/50', glow: 'bg-sky-500/10' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', hoverBorder: 'hover:border-violet-400/50', glow: 'bg-violet-500/10' },
  fuchsia: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20', hoverBorder: 'hover:border-fuchsia-400/50', glow: 'bg-fuchsia-500/10' },
};

const PROMPTS: PromptItem[] = [
  {
    id: 'fintech-dashboard',
    title: 'Neo-Bank Dashboard',
    niche: 'FinTech',
    icon: Zap,
    color: 'blue',
    content: "Build a high-fidelity Neo-Bank interface. Aesthetic: 'Clean & Trustworthy' with soft white/slate-50 backgrounds and emerald-400 accents. Features: A Bento-style dashboard grid, real-time SVG line charts for 'Spending Habits', a sleek glassmorphism sidebar, and GSAP-staggered card reveals on load."
  },
  {
    id: 'ai-model-explorer',
    title: 'AI Model Explorer',
    niche: 'AI / Technology',
    icon: Cpu,
    color: 'purple',
    content: "Design an innovative AI model explorer interface. Include a terminal-style console for real-time logs, an interactive 3D-effect neural network visualization using CSS/SVG, and a 'Model Settings' panel with HSL-accented glass sliders. The aesthetic should be 'Cyberpunk Minimalist' with neon purple highlights."
  },
  {
    id: 'luxury-ecommerce',
    title: 'Luxury Boutique Store',
    niche: 'E-Commerce',
    icon: ShoppingBag,
    color: 'amber',
    content: "Create an ultra-premium boutique e-commerce landing page. Aesthetic: 'Modern Elegance' with serif typography (Playfair Display) and a 'Champagne & Charcoal' HSL palette. Features: Parallax product reveals, a sliding cart drawer with backdrop-blur-xl, and high-end image hover animations using GSAP and mask-expansion."
  },
  {
    id: 'architectural-portfolio',
    title: 'Architectural Portfolio',
    niche: 'Real Estate',
    icon: Home,
    color: 'emerald',
    content: "Develop a modern architectural portfolio site using a 'Bento Box' grid layout. Features: Parallax scroll effects for featured properties, a sleek contact form with floating labels, and an interactive image gallery that expands into a full-screen light-box with smooth transitions."
  },
  {
    id: 'mindful-meditation',
    title: 'Mindful Meditation App',
    niche: 'Health / Wellness',
    icon: HeartPulse,
    color: 'rose',
    content: "Design a serene meditation app interface. Use soft pastel HSL colors (Mint, Soft Rose), a 'breathing' pulse animation for the main action button, and smooth fade-in transitions between sessions. Include a minimalist progress ring for 'Daily Streak' with SVG stroke-dasharray animations."
  },
  {
    id: 'michelin-star-menu',
    title: 'Michelin Star Menu',
    niche: 'Food / Dining',
    icon: Utensils,
    color: 'orange',
    content: "Create a vibrant, interactive Michelin-star restaurant menu. Use elegant Gold-to-Copper gradients, serif accents, and a cross-fade 'Chef's Specials' carousel. Implement a smooth scroll-behavior between 'Appetizers', 'Main Course', and 'Desserts' with category-specific micro-interactions."
  },
  {
    id: 'digital-design-studio',
    title: 'Digital Design Studio',
    niche: 'Creative Agency',
    icon: Palette,
    color: 'indigo',
    content: "Build a bold, high-contrast creative agency landing page. Features: Brutalist-inspired large typography, hover-triggered image reveals that follow the cursor, and 'magnetic' buttons. Use a monochromatic layout with one high-saturation accent color like 'International Orange'."
  },
  {
    id: 'gamified-learning',
    title: 'Gamified Learning',
    niche: 'Education',
    icon: GraduationCap,
    color: 'cyan',
    content: "Design a gamified E-learning dashboard. Include progress rings with SVG animations, a 'Leaderboard' with smooth re-ordering transitions, and course cards that scale slightly on hover. Implement a 'Current Lesson' player with glassmorphism controls and sleek progress bars."
  },
  {
    id: 'space-tourism-explorer',
    title: 'Space Tourism Explorer',
    niche: 'Travel / Adventure',
    icon: Globe,
    color: 'sky',
    content: "Develop an immersive 'Space Journey' landing page. Use deep space black, CSS-powered starfield background, and futuristic typography. Features: A 'Book Your Flight' modal with a 3D glassmorphism effect and interactive planet selection cards with subtle glow transitions."
  },
  {
    id: 'ai-saas',
    niche: 'Software',
    title: 'AI Platform SaaS',
    icon: Cpu,
    color: 'violet',
    content: "Design a futuristic AI SaaS landing page. Aesthetic: 'Cyber-Modern' with deep indigo backgrounds and violet-fuchsia gradients. Features: An animated SVG 'Neural Network' background, glassmorphism pricing cards, GSAP-powered 'Feature Reveal' on scroll, and glowing HSL border effects on primary buttons."
  },
  {
    id: 'green-energy',
    title: 'Solar Energy Platform',
    niche: 'Sustainability',
    icon: Zap,
    color: 'emerald',
    content: "A world-class clean energy landing page. Aesthetic: 'Eco-Minimalist' with sage greens and soft sunlight ambers. Features: 3D-effect solar panel statistics using CSS transforms, a smooth scroll-triggered horizontal timeline of 'Planet Impact', and interactive HSL maps showing energy savings."
  },
  {
    id: 'pet-wellness',
    title: 'Pet Care & Adoption',
    niche: 'Animals / Wellness',
    icon: HeartPulse,
    color: 'rose',
    content: "Design a premium pet wellness and adoption hub. Use soft organic shapes, a warm 'Sand & Peach' HSL palette, and smooth 'staggered' entrance animations for pet cards. Include an interactive 'Match-Making' quiz with micro-animations and a sleek vertical timeline for medical history."
  },
  {
    id: 'modern-law-firm',
    title: 'Modern Law Firm',
    niche: 'Professional Services',
    icon: GraduationCap,
    color: 'amber',
    content: "Build a world-class legal firm landing page. Aesthetic: 'Old Money Luxury' meets 'Silicon Valley Clean'. Use deep navy backgrounds, gold serif typography (Playfair), and high-resolution architectural photography. Features: Reveal-on-scroll case studies and a minimalist, floating consultation booking card."
  },
  {
    id: 'cyber-security',
    title: 'DefendAI Cyber Suite',
    niche: 'Tech Security',
    icon: Shield,
    color: 'orange',
    content: "A high-security tech landing page. Aesthetic: 'Dark Matrix' with slate-950 background and glowing orange-red security alerts. Features: A 'Live Threat Map' simulation using moving SVG particles, grid-pattern backgrounds with mask-fade, and heavy glassmorphism for command center cards."
  },
  {
    id: 'music-festival',
    title: 'Music Festival Experience',
    niche: 'Events / Entertainment',
    icon: Palette,
    color: 'fuchsia',
    content: "Design a vibrant, high-energy music festival landing page. Use horizontal scroll sections, 'sticky' scrolling lineup cards, and bold, oversized kinetic typography. Implement a sticky 'Buy Tickets' button with a subtle hover-shimmer effect and a dynamic countdown timer using HSL gradients."
  },
  {
    id: 'elite-interior-design',
    title: 'Elite Interior Design Portfolio',
    niche: 'Luxury Real Estate',
    icon: Layout,
    color: 'rose',
    content: "A sophisticated interior design agency site. Aesthetic: 'Quiet Luxury' with creamy beige HSL tones and serif typography. Features: Full-page horizontal scrolling for the 'Work Gallery', interactive before/after sliders, and GSAP-powered image reveals that feel 'Architectural'."
  },
  {
    id: 'crypto-exchange',
    title: 'Pro Crypto Terminal',
    niche: 'Web3',
    icon: Cpu,
    color: 'cyan',
    content: "A high-fidelity crypto trading terminal. Aesthetic: 'Elite Trading' with dark slate-950 and neon cyan status bars. Features: Real-time lookalike SVG candlestick charts, a 'Flash Order' panel with HSL glow interactions, and a multi-pane Bento layout for asset management."
  },
  {
    id: 'ev-showroom',
    title: 'NextGen EV Showroom',
    niche: 'Automotive',
    icon: Zap,
    color: 'cyan',
    content: "Create an immersive EV showroom landing page. Use high-end car image reveal animations (top-to-bottom wipe), interactive 360-degree color selectors, and ultra-smooth scroll-linked battery range visualizations. Aesthetic: Titanium Silver and Cyber Cyan with minimalist, wide-track typography. [GSAP Animations Required]"
  },
  {
    id: 'pro-trainer',
    title: 'Elite Fitness Dashboard',
    niche: 'Health / Fitness',
    icon: HeartPulse,
    color: 'violet',
    content: "Design a premium personal training dashboard. Features: Progress charts with animated SVG fill, a 'Bento Box' workout plan view, and a sleek nutrition tracker with glass-effect icons. Use high-contrast 'Carbon Black' and 'Vivid Violet' accents with bold, italicized headlines."
  },
  {
    id: 'coffee-roastery',
    title: 'Artisan Coffee Roastery',
    niche: 'Food / E-commerce',
    icon: Utensils,
    color: 'sky',
    content: "Develop a boutique coffee roastery store. Aesthetic: 'Craft & Organic' with grainy textures and a 'Warm Earth' HSL palette. Features: Hover-trigger parallax for coffee bags, a 'Flavor Profile' radar chart for each blend, and a smooth, minimalist cart sliding drawer from the right."
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
              onClick={() => onSelect(prompt.content)}
              className={cn(
                "group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:bg-slate-900 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer",
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
