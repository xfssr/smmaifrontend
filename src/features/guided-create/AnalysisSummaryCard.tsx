import React from 'react';
import { Target, Search, Map } from 'lucide-react';
import LegacyIcon from '../../components/LegacyIcon';
import type { CombinedContentDirection } from './types';

interface AnalysisSummaryCardProps {
  direction: CombinedContentDirection;
}

const AnalysisSummaryCard: React.FC<AnalysisSummaryCardProps> = ({ direction }) => {
  return (
    <div className="glass-card p-6 rounded-[32px] border-white/10 space-y-6 animate-in zoom-in-95 duration-700 bg-white/[0.01]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-tight">Content Direction</h2>
        <div className="px-3 py-1 rounded-full bg-green/10 border border-green/20 text-green text-[9px] font-black uppercase tracking-widest animate-pulse">
          Ready
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <DetailBlock icon={<Target size={14} />} title="Hero Subject" content={direction.heroSubject} />
          <DetailBlock icon={<Search size={14} />} title="Close-up Focus" content={direction.closeupDetails} />
          <DetailBlock icon={<Map size={14} />} title="Visual Mood" content={direction.atmosphere} />
        </div>

        <div className="p-5 rounded-[24px] bg-green/5 border border-green/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green text-[#021a0a] flex items-center justify-center">
              <LegacyIcon name="createVideo" size={16} />
            </div>
            <div className="space-y-0.5">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-green/60">Suggested Style</div>
              <p className="text-[11px] font-black text-white uppercase tracking-tight">
                {direction.suggestedStyle || 'Cinematic UGC'}
              </p>
            </div>
          </div>

          {direction.shotSequence && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                <LegacyIcon name="videoDone" size={12} className="text-white/40" />
                Shot Plan
              </div>
              <ul className="space-y-1.5">
                {direction.shotSequence.map((shot, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[9px] font-black text-green mt-0.5">{idx + 1}.</span>
                    <span className="text-[10px] font-bold text-white/70 leading-tight uppercase tracking-tight">
                      {shot}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailBlock: React.FC<{ icon: React.ReactNode; title: string; content?: string }> = ({ icon, title, content }) => (
  <div className="px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="text-white/20">{icon}</div>
      <div className="text-[9px] font-black uppercase tracking-[0.1em] text-white/40">{title}</div>
    </div>
    <p className="text-[10px] font-bold text-white/80 uppercase tracking-tight text-right truncate max-w-[140px]">
      {content || 'Analyzing...'}
    </p>
  </div>
);

export default AnalysisSummaryCard;
