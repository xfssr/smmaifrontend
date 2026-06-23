import React from 'react';
import { Upload, Type, Check, X } from 'lucide-react';
import type { BrandState } from './types';

interface BrandOptionalStepProps {
  brand: BrandState;
  onChange: (brand: BrandState) => void;
}

const BrandOptionalStep: React.FC<BrandOptionalStepProps> = ({ brand, onChange }) => {
  const isComplete = brand.mode !== 'none' && brand.mode !== 'skipped';

  if (isComplete) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-green/5 border border-green/20 animate-in slide-in-from-right-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green text-[#021a0a] flex items-center justify-center">
            <Check size={16} strokeWidth={3} />
          </div>
          <div className="space-y-0.5">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-green/60">Brand Layer</div>
            <p className="text-[11px] font-black text-white uppercase tracking-tight">
              {brand.mode === 'text' ? brand.businessName : 'Logo Integrated'} ✓
            </p>
          </div>
        </div>
        <button
          onClick={() => onChange({ mode: 'none' })}
          className="p-2 text-white/20 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Brand Identity — Optional</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
          <Upload size={14} className="text-white/40 group-hover:text-white transition-colors" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Logo</span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange({ mode: 'logo', logoFile: file, logoPreviewUrl: URL.createObjectURL(file) });
              }
            }}
          />
        </label>

        <button
          onClick={() => {
            const name = prompt('Enter your business name:');
            if (name) onChange({ mode: 'text', businessName: name });
          }}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all"
        >
          <Type size={14} className="text-white/40" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Name</span>
        </button>

        <button
          onClick={() => onChange({ mode: 'skipped' })}
          className="flex items-center justify-center p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Skip Brand</span>
        </button>
      </div>
    </div>
  );
};

export default BrandOptionalStep;
