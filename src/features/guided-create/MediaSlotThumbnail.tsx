import React from 'react';
import { Check, RefreshCw } from 'lucide-react';
import type { MediaSlotState } from './types';

interface MediaSlotThumbnailProps {
  slot: MediaSlotState;
  onReplace: () => void;
}

const MediaSlotThumbnail: React.FC<MediaSlotThumbnailProps> = ({ slot, onReplace }) => {
  if (slot.status !== 'complete') return null;

  return (
    <div className="group relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl border border-green/30 overflow-hidden bg-obsidian flex-shrink-0 animate-in zoom-in-90 duration-300">
      {/* Background Image */}
      {slot.previewUrl && (
        <img src={slot.previewUrl} alt={slot.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        <div className="w-6 h-6 rounded-full bg-green text-[#021a0a] flex items-center justify-center shadow-lg mb-1">
          <Check size={14} strokeWidth={3} />
        </div>
        <div className="text-[7px] font-black uppercase tracking-widest text-white truncate w-full">
          {slot.title}
        </div>
      </div>

      {/* Replace Button (Hidden by default, shown on hover/active) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReplace();
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <RefreshCw size={16} className="text-white" />
        <span className="text-[7px] font-black uppercase tracking-widest text-white">Replace</span>
      </button>

      {/* Quality Badge */}
      {slot.analysis?.quality && (
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-green text-[#021a0a] text-[6px] font-black uppercase tracking-tighter">
          {slot.analysis.quality}
        </div>
      )}
    </div>
  );
};

export default MediaSlotThumbnail;
