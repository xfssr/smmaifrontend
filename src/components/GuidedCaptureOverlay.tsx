import React from 'react';
import { Compass, Move, Sparkles } from 'lucide-react';

interface GuidedCaptureOverlayProps {
  title: string;
  guidance: string[];
  shotLabel: string;
}

const GuidedCaptureOverlay: React.FC<GuidedCaptureOverlayProps> = ({ title, guidance, shotLabel }) => {
  return (
    <section className="rounded-[30px] border border-orange/20 bg-orange/[0.08] p-5 shadow-[0_10px_30px_rgba(255,120,0,0.14)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange">
            <Sparkles size={13} />
            AI Guided Shooting
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white">{title}</h3>
          <p className="text-[11px] font-bold uppercase tracking-tight text-white/55">{shotLabel}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-orange">
          <Compass size={20} />
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {guidance.map((hint) => (
          <div key={hint} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <Move size={12} className="text-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">{hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GuidedCaptureOverlay;
