import React from 'react';
import { Zap, X, CheckCircle2 } from 'lucide-react';

interface SelectedSolutionBannerProps {
  solution: {
    name: string;
    slug: string;
    priceLabel: string;
  };
  onClear: () => void;
}

const SelectedSolutionBanner: React.FC<SelectedSolutionBannerProps> = ({ solution, onClear }) => {
  return (
    <div className="glass-card p-6 border-orange/30 bg-orange/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      {/* Animated Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/5 to-orange/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms]" />

      <div className="flex items-center gap-6 relative">
        <div className="w-14 h-14 rounded-2xl bg-orange flex items-center justify-center text-white shadow-lg shadow-orange/30">
          <Zap size={32} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange">Active Solution</span>
            <CheckCircle2 size={12} className="text-orange" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
            {solution.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-6 relative">
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Cost</div>
          <div className="text-xl font-black text-white">{solution.priceLabel}</div>
        </div>
        <button
          onClick={onClear}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-white transition-all"
          title="Change Solution"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default SelectedSolutionBanner;
