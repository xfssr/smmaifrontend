import React from 'react';

interface StoryboardTimelineProps {
  jobState?: {
    currentStep?: string;
    outputs?: {
      startFrame?: { imageUrl?: string };
      elementClusters?: Array<{
        frontalUrl?: string;
        references?: Array<string | { url?: string }>;
      }>;
    };
  } | null;
}

function getReferenceUrl(reference: string | { url?: string } | undefined) {
  if (!reference) return undefined;
  return typeof reference === 'string' ? reference : reference.url;
}

const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({ jobState }) => {
  const isSynthesis = jobState?.currentStep === 'image_synthesis';
  const cluster = jobState?.outputs?.elementClusters?.[0];

  const renderVisualNode = (url: string | undefined, title: string, aspectRatio = 'aspect-square') => (
    <div className={`web-premium-card relative w-full ${aspectRatio} overflow-hidden rounded-2xl transition-all duration-500 ${
      isSynthesis && !url ? 'border-[#FF9F1C]/20 shadow-[inset_0_0_12px_rgba(255,159,28,0.05)]' : ''
    }`}>
      {url ? (
        <img src={url} className="h-full w-full object-cover animate-premium-in" alt={title} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 p-3 text-center">
          <div className={`h-1.5 w-1.5 rounded-full ${isSynthesis ? 'bg-[#FF9F1C] animate-ping' : 'bg-zinc-700'}`} />
          <span className="text-[9px] font-medium tracking-wide text-zinc-500">{title}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="px-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Scene generation</div>
        {renderVisualNode(jobState?.outputs?.startFrame?.imageUrl, 'Building main frame...', 'aspect-[16/10]')}
      </div>

      <div className="web-premium-card relative flex flex-col items-center rounded-2xl p-4">
        <div className="mb-4 self-start text-[9px] font-bold uppercase tracking-widest text-zinc-500">
          Object in 3D space
        </div>

        <div className="h-[100px] w-[100px]">
          {renderVisualNode(cluster?.frontalUrl, 'Base plane')}
        </div>

        <div className="my-3 flex w-full flex-col items-center">
          <div className="h-3 w-px bg-gradient-to-b from-[#FF9F1C] to-[#E65F2B]" />
          <div className="h-px w-[66%] bg-[#E65F2B]/50" />
          <div className="flex h-2 w-[66%] justify-between">
            <div className="h-full w-px bg-[#E65F2B]/50" />
            <div className="h-full w-px bg-[#E65F2B]/50" />
            <div className="h-full w-px bg-[#E65F2B]/50" />
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-2.5">
          {['Top view', 'Side angle', 'Macro'].map((label, index) => (
            <div key={label} className="h-[75px]">
              {renderVisualNode(getReferenceUrl(cluster?.references?.[index]), label)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryboardTimeline;
