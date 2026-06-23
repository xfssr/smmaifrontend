import React from 'react';
import { Play, PlayCircle, Sparkles, Image as ImageIcon, Cpu, Clapperboard, CheckCircle2, Film, Layers, Navigation } from 'lucide-react';
import LegacyIcon from '../components/LegacyIcon';

const DiscoverPage: React.FC = () => {
  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-700 pb-20">

      {/* 1. Discover Hero */}
      <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold leading-none text-orange border-orange-line bg-orange-soft">
          Discover
        </span>
        <h1 className="mt-4 text-[31px] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
          Explore AI video styles.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Templates, examples, pipeline ideas, and beginner guidance in one place.
        </p>
        <button
          onClick={() => window.location.hash = '#/create'}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-black active:scale-[0.98] transition-transform"
          style={{ background: "#D88A3D" }}
        >
          Start Creating <Sparkles size={16} />
        </button>
      </section>

      {/* 2. How It Works Visual Pipeline */}
      <section className="space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">How It Works</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-white/50">The simple path to cinematic results</p>
        </header>

        <div className="relative max-w-3xl mx-auto hidden sm:block">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {[
              { title: "Upload", icon: <ImageIcon size={24} />, desc: "Add your photos" },
              { title: "Analyze", icon: <Cpu size={24} />, desc: "AI scans assets" },
              { title: "Build", icon: <Layers size={24} />, desc: "Storyboard ready" },
              { title: "Result", icon: <Film size={24} />, desc: "Video generated", isFinal: true }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 bg-obsidian transition-all ${step.isFinal ? 'border-green text-green shadow-[0_0_15px_rgba(107,240,180,0.3)]' : 'border-orange/50 text-orange'}`}>
                  {step.icon}
                </div>
                <div>
                  <div className={`font-black uppercase tracking-widest text-xs ${step.isFinal ? 'text-green' : 'text-white'}`}>{step.title}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/50 mt-1">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Pipeline */}
        <div className="sm:hidden space-y-4 relative">
          <div className="absolute left-8 top-8 bottom-8 w-px bg-white/5 z-0" />
          {[
            { title: "Upload", icon: <ImageIcon size={20} />, desc: "Add your photos" },
            { title: "Analyze", icon: <Cpu size={20} />, desc: "AI scans assets" },
            { title: "Build", icon: <Layers size={20} />, desc: "Storyboard ready" },
            { title: "Result", icon: <Film size={20} />, desc: "Video generated", isFinal: true }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-6 relative z-10 pl-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-obsidian shrink-0 ${step.isFinal ? 'border-green text-green shadow-[0_0_15px_rgba(107,240,180,0.3)]' : 'border-orange/50 text-orange'}`}>
                {step.icon}
              </div>
              <div>
                <div className={`font-black uppercase tracking-widest text-xs ${step.isFinal ? 'text-green' : 'text-white'}`}>{step.title}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Education Mini Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Start with one photo", icon: "capture" },
          { title: "Add logos for branding", icon: "templates" },
          { title: "Better lighting is better", icon: "magic" },
          { title: "Use atmosphere shots", icon: "image" },
        ].map((edu, i) => (
          <div key={i} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:border-orange/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 shrink-0">
              <LegacyIcon name={edu.icon as any} size={18} />
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest text-white leading-tight">
              {edu.title}
            </div>
          </div>
        ))}
      </section>

      {/* 4. Example Gallery */}
      <section className="space-y-4 pt-4">
        <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Feed</p>
            <h2 className="truncate text-[18px] font-semibold tracking-[-0.03em] text-zinc-50">Example results</h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { cat: "Food", title: "Neon Burger Promo", style: "Cinematic" },
            { cat: "Product", title: "Sneaker Drop", style: "UGC" },
            { cat: "Local", title: "Cyberpunk Glow", style: "Portrait" }
          ].map((ex, i) => (
            <div key={i} className="flex gap-3 rounded-[1.45rem] border border-white/10 bg-white/[0.035] p-3 active:scale-[0.98] transition-transform cursor-pointer" onClick={() => window.location.hash = '#/create'}>
              <div className="relative flex h-[78px] w-[86px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(216,138,61,0.18),transparent_50%)]" />
                <Play size={20} className="text-orange" />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-orange-line bg-orange-soft px-2 py-1 text-[10px] font-semibold leading-none text-orange">
                  {ex.cat}
                </span>
                <p className="mt-2 truncate text-sm font-semibold text-zinc-100">{ex.title}</p>
                <p className="text-xs text-zinc-500">{ex.style} Style</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverPage;
