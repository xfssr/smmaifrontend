import React from 'react';
import { Sparkles } from 'lucide-react';

interface SolutionCardProps {
  solution: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceIls: number;
    priceLabel: string;
    features: string[];
    badge?: string;
    thumbnailUrl?: string;
  };
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  return (
    <div className="glass-card group flex flex-col h-full animate-fade-in-up">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
        {solution.thumbnailUrl ? (
          <img
            src={solution.thumbnailUrl}
            alt={solution.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5 group-hover:text-orange/20 transition-colors">
            <Sparkles size={64} strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />

        {solution.badge && (
          <div className="absolute top-4 left-4">
            <div className="pill success">
              {solution.badge}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-orange transition-colors">
            {solution.name}
          </h3>
          <p className="text-sm text-muted font-medium line-clamp-2 leading-relaxed uppercase tracking-wider">
            {solution.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {solution.features.slice(0, 3).map((item, i) => (
            <span key={i} className="pill">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">Price Pack</span>
          <span className="text-xl font-black tracking-tighter">{solution.priceLabel}</span>
        </div>
        <button
          onClick={() => window.location.hash = `#/solutions/${solution.slug}`}
          className="btn-orange text-xs px-6 py-3"
        >
          View Solution
        </button>
      </div>
    </div>
  );
};

export default SolutionCard;
