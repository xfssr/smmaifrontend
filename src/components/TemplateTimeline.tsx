import React from 'react';
import type { ConfirmedShotAsset, TemplateShotRequirement } from '../lib/templateExperience';
import ShotProgressIndicator from './ShotProgressIndicator';
import TimelineShotCard from './TimelineShotCard';

interface TemplateTimelineProps {
  shots: TemplateShotRequirement[];
  assets: ConfirmedShotAsset[];
  selectedIndex: number;
  activeState: 'idle' | 'uploading' | 'analyzing' | 'reviewing' | 'recommending' | 'creating_job' | 'error';
  onSelectShot: (index: number) => void;
  onUploadShot: (index: number) => void;
  onCameraShot: (index: number) => void;
}

const TemplateTimeline: React.FC<TemplateTimelineProps> = ({
  shots,
  assets,
  selectedIndex,
  activeState,
  onSelectShot,
  onUploadShot,
  onCameraShot,
}) => {
  const byOrder = new Map(assets.map((asset) => [asset.order, asset]));
  const completed = shots.filter((_shot, index) => byOrder.has(index)).length;

  const timelineStateFor = (index: number) => {
    const asset = byOrder.get(index);
    if (asset?.confirmed) return 'confirmed' as const;
    if (asset) return 'ready' as const;
    if (index === selectedIndex && activeState === 'uploading') return 'uploading' as const;
    if (index === selectedIndex && activeState === 'analyzing') return 'analyzing' as const;
    return 'empty' as const;
  };

  return (
    <section className="space-y-5 rounded-[34px] border border-white/10 bg-white/[0.03] p-5">
      <header className="space-y-3">
        <div className="text-[10px] font-black uppercase tracking-[0.26em] text-orange">AI Capture Timeline</div>
        <ShotProgressIndicator total={shots.length} completed={completed} activeIndex={selectedIndex} />
      </header>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {shots.map((shot, index) => {
          const asset = byOrder.get(index);
          return (
            <TimelineShotCard
              key={`${shot.role}-${index}`}
              index={index}
              shot={shot}
              state={timelineStateFor(index)}
              selected={selectedIndex === index}
              previewUrl={asset?.previewUrl}
              description={asset?.description}
              onSelect={() => onSelectShot(index)}
              onUpload={() => onUploadShot(index)}
              onCamera={() => onCameraShot(index)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default TemplateTimeline;
