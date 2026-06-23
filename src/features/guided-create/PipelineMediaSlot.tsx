import React from 'react';
import { AlertCircle, Image as ImageIcon, Plus, RefreshCw } from 'lucide-react';
import type { MediaSlotState } from './types';

interface PipelineMediaSlotProps {
  slot: MediaSlotState;
  onSelectUpload?: () => void;
  onReplace?: () => void;
}

const PipelineMediaSlot: React.FC<PipelineMediaSlotProps> = ({ slot, onSelectUpload, onReplace }) => {
  const isLocked = slot.status === 'locked';
  const isActive = slot.status === 'active';
  const isUploading = slot.status === 'uploading';
  const isAnalyzing = slot.status === 'analyzing';
  const isComplete = slot.status === 'complete';
  const isError = slot.status === 'error';
  const previewUrl = slot.assetId && !slot.previewUrl?.startsWith('blob:')
    ? `/api/assets/${slot.assetId}/view`
    : slot.previewUrl;

  const handleSlotClick = () => {
    if ((isActive || isLocked || isError) && !isUploading && !isAnalyzing) {
      onSelectUpload?.();
    }
  };

  return (
    <div
      onClick={isComplete ? undefined : handleSlotClick}
      role={isComplete ? undefined : 'button'}
      tabIndex={isComplete || isUploading || isAnalyzing ? -1 : 0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSlotClick();
        }
      }}
      className={`web-premium-card relative flex h-[130px] w-[100px] shrink-0 snap-center flex-col justify-between rounded-2xl p-2 transition-all duration-300 ${
        isAnalyzing || isUploading ? 'border-[#FF9F1C]/30 glow-amber cursor-wait' : ''
      } ${isError ? 'border-red/40 bg-red-500/5' : ''} ${
        !isComplete && !isUploading && !isAnalyzing ? 'cursor-pointer hover:-translate-y-0.5 hover:border-white/10' : ''
      }`}
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#0F0F11]">
        {isComplete && previewUrl ? (
          <>
            <img src={previewUrl} className="h-full w-full object-cover animate-premium-in" alt={slot.title} />
            {onReplace && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onReplace();
                }}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md transition hover:text-white"
                aria-label={`Replace ${slot.title}`}
              >
                <RefreshCw size={13} />
              </button>
            )}
          </>
        ) : isAnalyzing || isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[#FF9F1C]/5 animate-pulse" />
            <span className="relative text-[10px] font-semibold tracking-wider text-[#FF9F1C] font-mono">
              {isUploading ? 'LOAD' : 'SCAN'}
            </span>
            <div className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF9F1C] to-transparent shadow-[0_0_8px_#FF9F1C] animate-bounce" />
          </div>
        ) : isError ? (
          <AlertCircle className="h-5 w-5 text-red-400" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1 text-zinc-400/40">
            {isLocked ? <ImageIcon className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
        )}
      </div>

      <div className="flex min-h-[18px] items-center justify-center px-0.5 text-center text-[8px] font-medium leading-tight tracking-wide text-zinc-400">
        {slot.title}
      </div>
    </div>
  );
};

export default PipelineMediaSlot;
