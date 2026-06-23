import React from 'react';
import type { TemplateCatalogItem } from '../../lib/templateExperience';
import TemplatePreviewBlock from './TemplatePreviewBlock';
import GuidedMediaFlow from './GuidedMediaFlow';
import AnalysisSummaryCard from './AnalysisSummaryCard';
import BrandOptionalStep from './BrandOptionalStep';
import { Zap } from 'lucide-react';
import type { MediaSlotState, BrandState, CombinedContentDirection } from './types';

interface SelectedTemplateComposerCardProps {
  template: TemplateCatalogItem;
  slots: MediaSlotState[];
  brand: BrandState;
  direction?: CombinedContentDirection;
  onUpload: (slotId: string, file: File) => void;
  onReplace: (slotId: string) => void;
  onBrandChange: (brand: BrandState) => void;
  onCreateJob: () => void;
  isSaving: boolean;
}

const SelectedTemplateComposerCard: React.FC<SelectedTemplateComposerCardProps> = ({
  template,
  slots,
  brand,
  direction,
  onUpload,
  onReplace,
  onBrandChange,
  onCreateJob,
  isSaving
}) => {
  return (
    <div className="w-full max-w-[960px] mx-auto overflow-hidden rounded-[28px] border border-white/10 glass-card bg-white/[0.01] shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">

        {/* Left Column: Template Info */}
        <div className="min-w-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01] p-4 sm:p-5 lg:p-8">
          <TemplatePreviewBlock template={template} />
        </div>

        {/* Right Column: Composer Flow */}
        <div className="min-w-0 flex flex-col">
          <div className="p-4 sm:p-5 lg:p-8 flex-1 space-y-8 lg:space-y-10">
            <GuidedMediaFlow
              slots={slots}
              onUpload={onUpload}
              onReplace={onReplace}
              templateSlug={template.slug}
              direction={direction}
              brandMode={brand.mode}
            />

            <header className="space-y-1 mt-4 lg:mt-0">
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Content Composer</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Guided AI Production Studio</p>
            </header>

            {direction && (
              <div className="space-y-8 lg:space-y-10 animate-in slide-in-from-bottom-4 duration-700">
                <AnalysisSummaryCard direction={direction} />

                <BrandOptionalStep
                  brand={brand}
                  onChange={onBrandChange}
                />
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 lg:p-8 bg-white/[0.02] border-t border-white/5">
            {direction ? (
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={onCreateJob}
                  disabled={isSaving}
                  className="w-full btn-green h-16 text-[11px] font-black tracking-[0.2em] shadow-2xl shadow-green/40 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSaving ? 'Assembling Content...' : 'Create Content'} <Zap size={18} />
                </button>
                <div className="flex items-center gap-6 opacity-20">
                  <div className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Neural Handshake Secure</div>
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <div className="text-[8px] font-black uppercase tracking-[0.5em] text-white">v2.4 Production Engine</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">
                  Complete media flow to unlock production
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedTemplateComposerCard;
