import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import type { BrandCollectionBoard, SourceAnalysisBoard, SourceAssetPreviewCard } from '../types';

type PreviewCollectionBoardProps = {
  sourceAnalysisBoard?: SourceAnalysisBoard | null;
  brandCollectionBoard?: BrandCollectionBoard | null;
};

const weightLabels: Record<SourceAssetPreviewCard['sourceTruthWeight'], string> = {
  hero: 'Hero',
  secondary: 'Detail',
  brand: 'Brand',
  atmosphere: 'Venue',
  support: 'Story',
};

export const PreviewCollectionBoard: React.FC<PreviewCollectionBoardProps> = ({
  sourceAnalysisBoard,
}) => {
  const cards = sourceAnalysisBoard?.cards ?? [];
  if (!cards.length) return null;

  return (
    <section data-testid="brand-board" className="space-y-4 px-4 pb-2">
      {cards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Source analysis board</div>
            <div className="text-xs font-bold text-zinc-400">
              {sourceAnalysisBoard?.uploadedCount ?? cards.length} / 5
            </div>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide [scrollbar-width:none]">
            {cards.map((card) => (
              <article key={card.assetId} className="bg-white/[0.03] border border-white/5 w-[180px] shrink-0 snap-start rounded-3xl p-3 shadow-lg">
                <div className="relative aspect-[4/5] bg-zinc-950 rounded-2xl overflow-hidden shadow-inner">
                  <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
                  <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm border border-white/10">
                    {weightLabels[card.sourceTruthWeight]}
                  </div>
                  {card.status === 'accepted' && (
                    <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-emerald-400 text-black shadow-md border-2 border-black/20">
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 mt-3 px-1">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-bold text-white leading-tight">{card.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{card.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="capitalize text-zinc-500">{card.status.replace('_', ' ')}</span>
                    {typeof card.qualityScore === 'number' && (
                      <span className="font-bold text-[#FF9F1C]">{Math.round(card.qualityScore)}/100</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="flex items-center gap-2 px-1 text-[11px] text-zinc-500">
          <Sparkles size={14} className="text-[#FF9F1C]" />
          <span>Generated preview catalogue appears after these sources are processed.</span>
        </div>
      )}
    </section>
  );
};
