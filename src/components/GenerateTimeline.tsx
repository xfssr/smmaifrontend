import React from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface GenerateTimelineProps {
  stage: 'idle' | 'assembling' | 'processing' | 'rendering' | 'done';
}

const stages = [
  { id: 'assembling', label: 'Scene Assembly' },
  { id: 'processing', label: 'AI Processing' },
  { id: 'rendering', label: 'Rendering' },
  { id: 'done', label: 'Output Ready' },
] as const;

const GenerateTimeline: React.FC<GenerateTimelineProps> = ({ stage }) => {
  const activeIndex = Math.max(0, stages.findIndex((item) => item.id === stage));

  return (
    <section className="space-y-4 rounded-[28px] border border-white/10 bg-[#090b10] p-5">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange">
        <Sparkles size={13} />
        Final Generation Timeline
      </div>
      <div className="space-y-2">
        {stages.map((item, index) => {
          const completed = index < activeIndex || stage === 'done';
          const active = index === activeIndex && stage !== 'done';
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                completed ? 'bg-green text-obsidian' : active ? 'bg-orange text-obsidian' : 'bg-white/10 text-white/55'
              }`}>
                {completed ? <CheckCircle2 size={14} /> : active ? <Loader2 size={13} className="animate-spin" /> : index + 1}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">{item.label}</div>
              {active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-orange shadow-[0_0_8px_rgba(255,140,0,0.8)]" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GenerateTimeline;
