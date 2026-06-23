import React from 'react';
import type { TemplateCatalogItem } from '../../../lib/templateExperience';

interface TemplateProgressHeaderProps {
  template: TemplateCatalogItem;
  uploadCount: number;
  maxAssets: number;
  onChangeTemplate?: () => void;
}

export const TemplateProgressHeader: React.FC<TemplateProgressHeaderProps> = ({
  template,
  uploadCount,
  maxAssets,
  onChangeTemplate,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0c0c0e]/90 backdrop-blur z-20">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300/80">
          Selected Template
        </div>
        <div className="font-bold text-white text-sm mt-0.5">{template.name}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[10px] text-white/50">
          {uploadCount}/{Math.min(maxAssets, 5)} uploaded
        </div>
        {onChangeTemplate && (
          <button
            onClick={onChangeTemplate}
            className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
};
