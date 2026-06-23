import React from 'react';
import { Trash2, ExternalLink, Play } from 'lucide-react';

interface WallItemCardProps {
  item: {
    id: string;
    output: {
      id: string;
      label: string;
      viewUrl: string;
    };
    isVisible: boolean;
  };
  onRemove: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
}

const WallItemCard: React.FC<WallItemCardProps> = ({ item, onRemove }) => {
  return (
    <div className="group relative aspect-video rounded-[32px] glass-card border border-white/5 overflow-hidden hover:border-orange/50 hover:shadow-neon-orange transition-all duration-500">
      <video
        src={item.output.viewUrl}
        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
        muted
        loop
        playsInline
        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
        onMouseOut={(e) => {
          const v = e.target as HTMLVideoElement;
          v.pause();
          v.currentTime = 0;
        }}
      />

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

      <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">Deployment Asset</div>
            <h4 className="font-black text-lg text-white line-clamp-1 uppercase tracking-tighter leading-none">{item.output.label}</h4>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open(item.output.viewUrl, '_blank')}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white text-white hover:text-obsidian transition-all shadow-xl"
            >
              <ExternalLink size={20} />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red/10 hover:bg-red text-red hover:text-white transition-all shadow-xl"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-6 left-6">
        <div className="px-3 py-1.5 rounded-xl bg-obsidian/80 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange">
          <div className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          Live Asset
        </div>
      </div>
    </div>
  );
};

export default WallItemCard;
