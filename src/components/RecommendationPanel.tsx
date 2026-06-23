import React from 'react';
import { Sparkles, ArrowRight, Wand2, Info } from 'lucide-react';
import LegacyIcon from './LegacyIcon';

interface RecommendationPanelProps {
  recommendations: {
    suggestedTemplates: any[];
    compositionTips: string[];
  };
  onSelectTemplate: (templateId: string) => void;
  isGenerating?: boolean;
}

const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations, onSelectTemplate, isGenerating
}) => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-24 h-24 rounded-[40px] bg-orange/10 text-orange flex items-center justify-center shadow-[0_0_60px_rgba(255,102,0,0.15)] border border-orange/20 animate-pulse transition-transform hover:scale-110">
          <Sparkles size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">Synthesized Strategy</h2>
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted opacity-60">Neural Compatibility Analysis: 100% Match</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Templates */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-8 bg-orange/40 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted flex items-center gap-3">
              <Wand2 size={16} /> Recommended Modalities
            </h3>
          </div>

          <div className="space-y-6">
            {recommendations.suggestedTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl.id)}
                disabled={isGenerating}
                className="w-full p-10 rounded-[48px] glass-card border-white/5 hover:border-orange/40 hover:shadow-[0_0_80px_rgba(255,102,0,0.1)] transition-all text-left flex items-center justify-between group relative overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="text-2xl font-black uppercase tracking-tight group-hover:text-orange transition-colors">{tpl.name}</div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-lg bg-orange/10 text-orange text-[10px] font-black uppercase tracking-widest border border-orange/20">9:16 VERTICAL</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">Neural-Sync Compatible</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center group-hover:bg-orange group-hover:text-obsidian transition-all relative z-10 border border-white/5">
                  <ArrowRight size={28} />
                </div>
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/[0.02] to-orange/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="w-1.5 h-8 bg-white/10 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted flex items-center gap-3">
              <Info size={16} /> Synthesis Constraints
            </h3>
          </div>

          <div className="p-12 rounded-[60px] glass-card space-y-8 border-white/5 relative overflow-hidden h-full">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange/5 blur-[120px] rounded-full" />

            <div className="space-y-8">
              {recommendations.compositionTips.map((tip, i) => (
                <div key={i} className="flex gap-6 items-start animate-in slide-in-from-left-4 duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-orange mt-2.5 flex-shrink-0 shadow-[0_0_15px_rgba(255,102,0,0.8)]" />
                  <p className="text-base leading-relaxed text-muted font-bold uppercase tracking-tight italic opacity-80">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-white/5 mt-10 space-y-6">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-orange">
                <LegacyIcon name="magic" size={16} /> Neural Optimization Active
              </div>
              <p className="text-xs text-muted/40 leading-relaxed font-bold uppercase tracking-widest">
                System has calibrated rendering parameters for optimal fidelity and lighting reconstruction based on your intake manifest.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecommendationPanel;
