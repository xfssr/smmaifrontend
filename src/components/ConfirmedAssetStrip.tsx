import React from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface ConfirmedAsset {
  id: string;
  previewUrl: string;
  description: string;
  order?: number;
  shotRole?: string;
  shotLabel?: string;
  qualityScore?: number | null;
}

interface ConfirmedAssetStripProps {
  assets: ConfirmedAsset[];
  onRemove: (id: string) => void;
}

function getAssetPreviewUrl(asset: ConfirmedAsset): string | undefined {
  if (asset.previewUrl?.startsWith('blob:')) return asset.previewUrl;
  // If we have an ID, we can always fallback to the proxy route
  const assetId = asset.id;
  if (!assetId) return asset.previewUrl;
  return `/api/assets/${assetId}/view`;
}

const ConfirmedAssetStrip: React.FC<ConfirmedAssetStripProps> = ({ assets, onRemove }) => {
  if (assets.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-green rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Confirmed Manifest ({assets.length})</h3>
        </div>
        <div className="text-green flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
          <CheckCircle2 size={14} /> Neural Stability Confirmed
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
        {assets.map((asset, i) => (
          <div key={asset.id} className="relative flex-shrink-0 w-44 group animate-in zoom-in-95 duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
            {getAssetPreviewUrl(asset) ? (
            <div className="aspect-[3/4] rounded-[32px] border border-green/20 overflow-hidden bg-surface relative shadow-2xl group-hover:border-green/40 transition-all duration-500">
              <img
                src={getAssetPreviewUrl(asset)}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                alt="Confirmed"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-xl">
                Shot {(asset.order ?? i) + 1}
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => onRemove(asset.id)}
                  className="w-12 h-12 rounded-2xl bg-red-500 text-white hover:scale-110 transition-transform shadow-xl flex items-center justify-center"
                  title="Purge Asset"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <p className="mb-1 truncate text-[10px] font-black uppercase tracking-tight text-green">
                  {asset.shotLabel || asset.shotRole || 'Confirmed shot'}
                </p>
                <p className="text-[9px] font-black text-white/60 uppercase tracking-tighter truncate leading-none">
                  {asset.description}
                </p>
              </div>
            </div>
            ) : (
              <div className="aspect-[3/4] rounded-[32px] border border-white/5 bg-surface flex items-center justify-center text-[10px] font-black uppercase text-muted">
                No Preview
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfirmedAssetStrip;
