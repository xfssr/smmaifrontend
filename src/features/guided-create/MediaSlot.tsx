import React, { useRef } from 'react';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import type { MediaSlotState } from './types';

interface MediaSlotProps {
  slot: MediaSlotState;
  onUpload: (file: File) => void;
}

const MediaSlot: React.FC<MediaSlotProps> = ({ slot, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = slot.status === 'active';
  const isUploading = slot.status === 'uploading';
  const isAnalyzing = slot.status === 'analyzing';
  const isError = slot.status === 'error';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset value to allow selecting same file again if needed
    e.target.value = '';
  };

  const handleSlotClick = () => {
    if (isActive && !isUploading && !isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      onClick={handleSlotClick}
      className={`
        relative aspect-video lg:aspect-square w-full min-h-[180px] sm:min-h-[220px] lg:min-h-[260px] transition-all duration-500 rounded-[20px] lg:rounded-[24px] border overflow-hidden flex flex-col items-center justify-center text-center p-4 lg:p-6
        ${isActive ? 'border-white/20 bg-white/5 shadow-2xl shadow-white/5 cursor-pointer hover:bg-white/[0.08]' : 'border-white/5 bg-white/[0.02]'}
        ${isError ? 'border-red/50 bg-red/5' : ''}
        ${isUploading || isAnalyzing ? 'cursor-wait' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        {/* Status Icon */}
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500
          ${isActive ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/20'}
          ${isError ? 'bg-red text-white' : ''}
          ${isUploading || isAnalyzing ? 'bg-white/10 text-white' : ''}
        `}>
          {isActive && !isUploading && !isAnalyzing && <Plus size={28} strokeWidth={3} />}
          {isError && <AlertCircle size={24} />}
          {(isUploading || isAnalyzing) && <Loader2 size={24} className="animate-spin" />}
        </div>

        <div className="space-y-2 max-w-[200px]">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
            {isUploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : slot.title}
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-tight text-white/40 leading-relaxed">
            {isAnalyzing ? 'Scanning details and composition...' : slot.prompt}
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      {(isUploading || isAnalyzing) && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 overflow-hidden">
          <div
            className={`h-full bg-green shadow-[0_0_10px_#6bf0b4] transition-all duration-1000 ${isUploading ? 'animate-pulse' : ''}`}
            style={{ width: isUploading ? '40%' : '85%' }}
          />
        </div>
      )}
    </div>
  );
};

export default MediaSlot;
