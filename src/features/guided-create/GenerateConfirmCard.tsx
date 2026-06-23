import React from 'react';
import { AlertTriangle } from 'lucide-react';
import LegacyIcon from '../../components/LegacyIcon';
import type { TemplateCatalogItem } from '../../lib/templateExperience';
import type { CombinedContentDirection, MediaSlotState } from './types';

interface GenerateConfirmCardProps {
  template: TemplateCatalogItem;
  slots: MediaSlotState[];
  direction: CombinedContentDirection;
  onCreateJob: () => void;
  isSaving: boolean;
}

const GenerateConfirmCard: React.FC<GenerateConfirmCardProps> = ({
  template,
  slots,
  direction,
  onCreateJob,
  isSaving
}) => {
  const weakPhotos = slots.filter(s => s.analysis?.quality === 'poor');
  const usableCount = slots.filter(s => s.status === 'complete').length;

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 space-y-6 animate-in zoom-in-95 duration-700 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-orange-soft rounded-2xl flex items-center justify-center text-orange border border-orange-line mb-3">
          <LegacyIcon name="createVideo" size={24} />
        </div>
        <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-zinc-50">Ready to create</h2>
        <p className="text-xs text-zinc-500">
          {usableCount} of {slots.length} assets confirmed
        </p>
        {usableCount === 1 && slots.length > 1 && (
          <p className="text-[10px] font-medium text-orange/80 bg-orange/10 px-3 py-1.5 rounded-lg border border-orange/20 inline-block mt-2">
            One photo is enough. Add more only if you want a richer result.
          </p>
        )}
      </div>

      <div className="bg-black/20 rounded-2xl p-4 border border-white/5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-semibold text-zinc-600 mb-0.5">Style</div>
            <div className="text-xs font-semibold text-zinc-200 truncate">{template.name}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-zinc-600 mb-0.5">Main Subject</div>
            <div className="text-xs font-semibold text-zinc-200 truncate">{direction.heroSubject || 'Detected from assets'}</div>
          </div>
        </div>

        {weakPhotos.length > 0 && (
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-orange/10 border border-orange/20 text-orange">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold">Low Quality Assets</div>
              <div className="text-[10px] text-orange/70 leading-snug">
                {weakPhotos.length} asset(s) might produce sub-optimal results.
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onCreateJob}
        disabled={isSaving}
        className={`
          w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-bold active:scale-[0.98] transition-transform
          ${isSaving
            ? 'bg-white/5 border border-white/10 text-white/40 cursor-wait shadow-inner'
            : 'text-black shadow-[0_0_20px_rgba(216,138,61,0.2)]'
          }
        `}
        style={!isSaving ? { background: "#D88A3D" } : {}}
      >
        {isSaving ? (
          <span className="flex items-center gap-2 animate-pulse">
            Creating content...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Generate Content <LegacyIcon name="createVideo" size={16} />
          </span>
        )}
      </button>
    </div>
  );
};

export default GenerateConfirmCard;
