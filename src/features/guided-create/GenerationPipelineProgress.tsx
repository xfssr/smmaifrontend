import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';

export const USER_SAFE_STATUS_COPY = {
  idle: "Upload photos",
  analyzing: "AI is analyzing",
  assigned: "Photos assigned",
  previewReady: "Preview ready",
  generating: "Video generating",
  ready: "Final content ready",
} as const;

const PIPELINE_STEPS = [
  USER_SAFE_STATUS_COPY.analyzing,
  USER_SAFE_STATUS_COPY.assigned,
  USER_SAFE_STATUS_COPY.previewReady,
  USER_SAFE_STATUS_COPY.generating,
  USER_SAFE_STATUS_COPY.ready
];

interface GenerationPipelineProgressProps {
  onComplete?: () => void;
}

const GenerationPipelineProgress: React.FC<GenerationPipelineProgressProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simulate pipeline progress visually since the actual job is async and we just redirect eventually
    const totalDuration = 6000; // 6 seconds total
    const stepDuration = totalDuration / PIPELINE_STEPS.length;

    let interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) onComplete();
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="rounded-[1.35rem] border border-white/10 p-6 sm:p-8 bg-white/[0.035] shadow-2xl animate-in zoom-in-95 duration-700 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-white/5 border-t-orange animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-orange">
            <Zap size={32} className="animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-black uppercase tracking-widest text-white text-center">
          {USER_SAFE_STATUS_COPY.generating}
        </h2>
        <p className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] text-center">
          Your AI SMM Agent is creating the final asset.
        </p>
      </div>

      <div className="space-y-4 relative">
        {/* Track line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-white/5" />

        {PIPELINE_STEPS.map((step, index) => {
          const isComplete = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step} className={`flex items-start gap-4 relative z-10 transition-all duration-700 ${isPending ? 'opacity-30 translate-y-2' : isActive ? 'opacity-100 scale-105 transform' : 'opacity-80'}`}>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center border shrink-0 mt-0.5 transition-colors duration-500
                ${isComplete ? 'bg-green border-green text-[#021a0a] shadow-[0_0_15px_#6bf0b4]' : isActive ? 'bg-black border-orange text-orange shadow-[0_0_10px_rgba(255,165,0,0.5)]' : 'bg-black border-white/20 text-white/20'}
              `}>
                {isComplete ? <CheckCircle2 size={14} /> : isActive ? <Loader2 size={12} className="animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
              </div>
              <div className="space-y-0.5">
                <div className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${isComplete ? 'text-white' : isActive ? 'text-orange drop-shadow-[0_0_8px_rgba(255,165,0,0.8)]' : 'text-white/40'}`}>
                  {step}
                </div>
                {isActive && (
                  <div className="text-[9px] font-bold text-white/60 uppercase tracking-widest animate-in slide-in-from-top-1 fade-in duration-300">
                    Please keep this page open...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationPipelineProgress;
