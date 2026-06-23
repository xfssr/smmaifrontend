import React from 'react';
import { CheckCircle2, Image as ImageIcon, Loader2, PlusCircle } from 'lucide-react';
import type { MediaSlotState } from '../types';

export type ActiveUpload = {
  localId: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'analyzing' | 'done' | 'failed';
  slotId: string;
};

interface UploadedAssetRailProps {
  visibleSlots: MediaSlotState[];
  activeUploads: ActiveUpload[];
  uploadCount: number;
  maxAssets: number;
  onReplace: (slotId: string) => void;
  onAddClick: () => void;
  onSlotClick?: (slot: MediaSlotState) => void;
}

export function previewUrlForSlot(slot?: MediaSlotState) {
  if (!slot) return undefined;
  if (slot.previewUrl?.startsWith('blob:')) return slot.previewUrl;
  return slot.assetId ? `/api/assets/${slot.assetId}/view` : slot.previewUrl;
}

export const getHumanSlotLabel = (slotId: string, title?: string): string => {
  const normalized = (slotId || '').toLowerCase();
  if (normalized.includes('logo') || normalized.includes('brand')) return 'Logo';
  if (normalized.includes('hero') || normalized.includes('main') || normalized.includes('wide_table_shot') || normalized.includes('start_frame')) return 'Main photo';
  if (normalized.includes('closeup') || normalized.includes('detail') || normalized.includes('macro') || normalized.includes('texture')) return 'Close-up';
  if (normalized.includes('atmosphere') || normalized.includes('venue') || normalized.includes('lifestyle')) return 'Atmosphere';
  if (normalized.includes('story') || normalized.includes('promo')) return 'Story shot';

  const t = (title || '').toLowerCase();
  if (t.includes('logo') || t.includes('brand')) return 'Logo';
  if (t.includes('hero') || t.includes('main')) return 'Main photo';
  if (t.includes('close') || t.includes('detail') || t.includes('macro') || t.includes('texture')) return 'Close-up';
  if (t.includes('atmosphere') || t.includes('venue') || t.includes('lifestyle')) return 'Atmosphere';

  return title || 'Frame';
};

export const UploadedAssetRail: React.FC<UploadedAssetRailProps> = ({
  visibleSlots,
  activeUploads,
  uploadCount,
  maxAssets,
  onReplace,
  onAddClick,
  onSlotClick,
}) => {
  const isUploadingOrAnalyzing = activeUploads.some(
    (u) => u.status === 'uploading' || u.status === 'analyzing'
  );

  return (
    <div className="flex flex-col items-center px-4 py-6 w-full">
      <div className="w-full max-w-lg">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 ml-1">
          Source Dossier
        </div>
        <div className="flex w-full snap-x snap-mandatory justify-start gap-4 overflow-x-auto scroll-smooth pb-4 px-1 scrollbar-hide [scrollbar-width:none]">
          {visibleSlots.map((slot) => {
            const activeUpload = activeUploads.find(
              (u) =>
                u.slotId === slot.id &&
                (u.status === 'uploading' || u.status === 'analyzing')
            );
            const isScanning = Boolean(activeUpload);
            const isFilled = slot.status === 'complete' && Boolean(slot.previewUrl || slot.assetId);
            const label = getHumanSlotLabel(slot.id, slot.title);
            const imageUrl = activeUpload?.previewUrl || previewUrlForSlot(slot);

            return (
              <div
                key={slot.id}
                className={`bg-white/[0.03] border flex h-[150px] w-[115px] shrink-0 snap-center flex-col justify-between rounded-3xl p-2.5 transition-all duration-300 hover:bg-white/5 cursor-pointer shadow-lg ${
                  isScanning ? 'border-[#FF9F1C]/40 shadow-[0_0_20px_rgba(255,159,28,0.15)]' : 'border-white/5'
                }`}
                onClick={() => {
                  if (isScanning) return;
                  if (isFilled && onSlotClick) {
                    onSlotClick(slot);
                  } else if (isFilled) {
                    onReplace(slot.id);
                  } else {
                    onAddClick();
                  }
                }}
              >
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/50 shadow-inner">
                  {isFilled && imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover animate-premium-in" alt="" />
                  ) : isScanning ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {imageUrl && (
                        <img src={imageUrl} className="absolute inset-0 h-full w-full object-cover opacity-35" alt="" />
                      )}
                      <div className="absolute inset-0 bg-[#FF9F1C]/5 animate-pulse" />
                      <span className="relative text-[10px] text-[#FF9F1C] font-bold tracking-widest font-mono">
                        {activeUpload?.status === 'uploading' ? 'LOAD' : 'SCAN'}
                      </span>
                      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF9F1C] to-transparent shadow-[0_0_12px_#FF9F1C] animate-bounce" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400/20">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  {isFilled && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center shadow-md border-2 border-black/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="flex min-h-[20px] items-center justify-center px-1 text-center text-[10px] font-medium leading-tight text-zinc-400">
                  {label}
                </span>
              </div>
            );
          })}
          {uploadCount < maxAssets && (
            <div className="bg-white/[0.02] border border-white/5 flex h-[150px] w-[115px] shrink-0 snap-center flex-col justify-between rounded-3xl p-2.5 transition-all duration-300 hover:bg-white/5 cursor-pointer">
              <button
                type="button"
                onClick={onAddClick}
                className="flex aspect-square w-full shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black/20 text-white/30 transition-all hover:border-white/30 hover:text-white/80"
                aria-label="Upload more photos"
              >
                <PlusCircle className="w-7 h-7" strokeWidth={1.5} />
              </button>
              <span className="flex min-h-[20px] items-center justify-center px-1 text-center text-[10px] font-medium leading-tight text-zinc-500">
                Upload
              </span>
            </div>
          )}
        </div>
        {isUploadingOrAnalyzing && (
          <div className="text-[10px] text-amber-400 mt-2 flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> AI is analyzing...
          </div>
        )}
      </div>
    </div>
  );
};
