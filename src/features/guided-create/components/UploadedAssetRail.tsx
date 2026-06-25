import React from 'react';
import { CheckCircle2, Image as ImageIcon, Loader2, Plus, X } from 'lucide-react';
import type { MediaSlotState } from '../types';
import { resolveMediaUrl } from '../../../lib/api';

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
  // UI image priority: browserUrl > thumbnailUrl > server/blob previewUrl.
  // Never reconstruct the protected /api/assets/:id/view route for previews.
  return (
    resolveMediaUrl(slot.browserUrl) ||
    resolveMediaUrl(slot.thumbnailUrl) ||
    resolveMediaUrl(slot.previewUrl)
  );
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

  const filledSlots = visibleSlots.filter(
    (slot) => slot.status === 'complete' && Boolean(slot.previewUrl || slot.assetId)
  );
  const activeUploadSlots = activeUploads.filter(
    (u) => u.status === 'uploading' || u.status === 'analyzing'
  );

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] pb-1">
        {/* Filled asset thumbnails */}
        {filledSlots.map((slot) => {
          const imageUrl = previewUrlForSlot(slot);
          return (
            <div
              key={slot.id}
              className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer"
              onClick={() => onSlotClick ? onSlotClick(slot) : undefined}
            >
              {imageUrl && (
                <img src={imageUrl} className="w-full h-full object-cover" alt="" />
              )}
              {/* Remove button */}
              <button
                type="button"
                aria-label="Remove asset"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplace(slot.id);
                }}
                className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <X className="h-2.5 w-2.5" strokeWidth={2.5} />
              </button>
              {/* Success check */}
              <div className="absolute bottom-0.5 right-0.5 h-4 w-4 bg-emerald-400 rounded-full flex items-center justify-center border border-black/20">
                <CheckCircle2 className="h-2.5 w-2.5 text-black" strokeWidth={3} />
              </div>
            </div>
          );
        })}

        {/* Active upload thumbnails */}
        {activeUploadSlots.map((u) => (
          <div
            key={u.localId}
            className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-[#F97316]/40 bg-black/40"
          >
            {u.previewUrl && (
              <img src={u.previewUrl} className="w-full h-full object-cover opacity-40" alt="" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-[#F97316]/10 animate-pulse">
              <Loader2 className="h-4 w-4 text-[#F97316] animate-spin" />
            </div>
          </div>
        ))}

        {/* Upload More card */}
        {uploadCount < maxAssets && (
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Upload more photos"
            className="h-16 w-16 shrink-0 rounded-xl border border-dashed border-white/15 bg-white/[0.03] flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-300 hover:border-white/30 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span className="text-[8px] font-semibold uppercase tracking-wide">More</span>
          </button>
        )}
      </div>
    </div>
  );
};
