import React, { useRef } from 'react';
import { Download, Play } from 'lucide-react';

interface OutputCardProps {
  output: {
    id: string;
    label: string;
    type: string;
    viewUrl: string;
    downloadUrl: string;
  };
}

const OutputCard: React.FC<OutputCardProps> = ({ output }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="glass-card group rounded-[40px] overflow-hidden flex flex-col h-full animate-fade-in-up">
      <div
        className="relative aspect-video bg-black overflow-hidden group cursor-pointer"
        onMouseEnter={() => videoRef.current?.play()}
        onMouseLeave={() => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      >
        <video
          ref={videoRef}
          src={output.viewUrl}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
            <Play size={32} fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="p-8 flex-1 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange">Synthesized Asset</div>
          <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-orange transition-colors">
            {output.label}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted">
          <span>{output.type}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>4K Cinematic</span>
        </div>
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <a
          href={output.downloadUrl}
          download
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white hover:text-obsidian text-xs font-black uppercase tracking-widest transition-all"
        >
          <Download size={18} />
          Download 4K
        </a>
      </div>
    </div>
  );
};

export default OutputCard;
