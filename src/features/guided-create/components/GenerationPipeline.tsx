import React, { useEffect, useState } from 'react';
import { PIPELINE_PROGRESS, PIPELINE_STAGES } from './agentCategoryData';

interface GenerationPipelineProps {
  /** Overall completion 0–100. Defaults to the reference value (62%). */
  progress?: number;
  stages?: readonly string[];
}

/**
 * Compact, linear generation pipeline shown inside an agent result bubble.
 * Stages: Analyze -> Brand -> Preview -> Generate -> Finalize.
 * No circular loaders – a single smoothly-interpolated bar (~500ms).
 */
export const GenerationPipeline: React.FC<GenerationPipelineProps> = ({
  progress = PIPELINE_PROGRESS,
  stages = PIPELINE_STAGES,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedProgress(progress));
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  // The active stage corresponds to how far the bar has filled.
  const activeStageIndex = Math.min(
    stages.length - 1,
    Math.floor((progress / 100) * stages.length)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5 shadow-inner">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          Generating package
        </span>
        <span className="text-[11px] font-bold text-[#FF9F1C] tabular-nums">{progress}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FB923C] to-[#FF9F1C] transition-[width] duration-500 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1">
        {stages.map((stage, index) => {
          const isDone = index < activeStageIndex;
          const isActive = index === activeStageIndex;
          return (
            <div key={stage} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                  isDone
                    ? 'bg-emerald-400'
                    : isActive
                      ? 'bg-[#FF9F1C] shadow-[0_0_8px_rgba(255,159,28,0.7)]'
                      : 'bg-white/15'
                }`}
              />
              <span
                className={`truncate text-[8.5px] font-semibold uppercase tracking-wide transition-colors duration-500 ${
                  isDone ? 'text-zinc-400' : isActive ? 'text-[#FF9F1C]' : 'text-zinc-600'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationPipeline;
