import React from 'react';
import { Check } from 'lucide-react';
import type { MediaSlotState } from './types';

interface StepProgressProps {
  slots: MediaSlotState[];
  currentStepIndex: number;
  brandMode: string;
}

const StepProgress: React.FC<StepProgressProps> = ({ slots, currentStepIndex, brandMode }) => {
  const steps = [
    ...slots.map(s => ({ title: s.title, status: s.status })),
    { title: 'Brand', status: brandMode !== 'none' ? 'complete' : (slots.every(s => s.status === 'complete') ? 'active' : 'locked') }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {steps.map((step, idx) => {
        const isComplete = step.status === 'complete';
        const isActive = idx === currentStepIndex || (idx === slots.length && slots.every(s => s.status === 'complete'));

        return (
          <div key={idx} className="flex items-center gap-2 shrink-0">
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500
              ${isComplete ? 'border-green/30 bg-green/10 text-green' : isActive ? 'border-white/20 bg-white/5 text-white' : 'border-white/5 text-white/20'}
            `}>
              <div className="flex items-center justify-center">
                {isComplete ? <Check size={10} strokeWidth={4} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{step.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-4 h-px bg-white/5" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepProgress;
