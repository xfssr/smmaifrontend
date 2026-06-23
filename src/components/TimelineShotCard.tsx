import React from 'react';
import { Camera, CheckCircle2, ImagePlus, RotateCw } from 'lucide-react';
import type { TemplateShotRequirement } from '../lib/templateExperience';

type TimelineState = 'empty' | 'uploading' | 'analyzing' | 'ready' | 'needs_retake' | 'confirmed';

interface TimelineShotCardProps {
  index: number;
  shot: TemplateShotRequirement;
  state: TimelineState;
  selected: boolean;
  previewUrl?: string;
  description?: string;
  onSelect: () => void;
  onUpload: () => void;
  onCamera: () => void;
}

const stateLabel: Record<TimelineState, string> = {
  empty: 'Waiting',
  uploading: 'Uploading',
  analyzing: 'Analyzing',
  ready: 'Ready',
  needs_retake: 'Retake',
  confirmed: 'Confirmed',
};

const TimelineShotCard: React.FC<TimelineShotCardProps> = ({
  index,
  shot,
  state,
  selected,
  previewUrl,
  description,
  onSelect,
  onUpload,
  onCamera,
}) => {
  const confirmed = state === 'confirmed';
  const needsRetake = state === 'needs_retake';

  return (
    <article
      className={`w-[272px] flex-shrink-0 snap-start overflow-hidden rounded-[24px] border bg-[#080b10] transition-all ${
        selected ? 'border-orange/45 shadow-[0_14px_40px_rgba(255,120,0,0.18)]' : 'border-white/10'
      } ${confirmed ? 'border-green/30' : ''}`}
      onClick={onSelect}
    >
      <div className="relative aspect-[4/5] bg-black/30">
        {previewUrl ? (
          <img src={previewUrl} alt={shot.label} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,140,0,0.2),transparent_40%),linear-gradient(160deg,#0f131d,#05070b)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/80">
          Shot {index + 1}
        </div>
        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/80">
          {stateLabel[state]}
        </div>
        {confirmed && (
          <div className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-green text-obsidian">
            <CheckCircle2 size={16} />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-sm font-black uppercase tracking-tight text-white">{shot.label}</h3>
        <p className="line-clamp-2 text-[10px] font-bold uppercase leading-relaxed tracking-tight text-white/48">
          {description || shot.exampleHint}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {shot.guidance.slice(0, 2).map((hint) => (
            <span key={hint} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white/55">
              {hint}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUpload();
            }}
            className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/80 hover:bg-white/10"
          >
            {needsRetake ? <RotateCw size={12} /> : <ImagePlus size={12} />}
            Upload
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCamera();
            }}
            className="flex items-center justify-center gap-1 rounded-xl border border-orange/40 bg-orange/95 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-obsidian hover:brightness-110"
          >
            <Camera size={12} />
            Camera
          </button>
        </div>
      </div>
    </article>
  );
};

export default TimelineShotCard;
