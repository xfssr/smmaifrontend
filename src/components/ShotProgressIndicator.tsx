import React from 'react';

interface ShotProgressIndicatorProps {
  total: number;
  completed: number;
  activeIndex: number;
}

const ShotProgressIndicator: React.FC<ShotProgressIndicatorProps> = ({ total, completed, activeIndex }) => {
  const ratio = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
        <span>{completed}/{total} shots ready</span>
        <span>{ratio}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange via-amber to-green transition-all duration-500"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < completed;
          const isActive = index === activeIndex;
          return (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${
                isCompleted
                  ? 'bg-green shadow-[0_0_8px_rgba(0,255,136,0.6)]'
                  : isActive
                    ? 'bg-orange'
                    : 'bg-white/15'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ShotProgressIndicator;
