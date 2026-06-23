import React from 'react';
import StatusBadge from './StatusBadge';
import OutputCard from './OutputCard';
import { Clock, Film, AlertCircle } from 'lucide-react';

interface VideoJobCardProps {
  job: {
    id: string;
    status: string;
    executionStage: string;
    template: { name: string };
    createdAt: string;
    errorMessage?: string;
    outputs: any[];
  };
}

const VideoJobCard: React.FC<VideoJobCardProps> = ({ job }) => {
  const date = new Date(job.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const time = new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.035] group overflow-hidden flex flex-col animate-fade-in-up">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted group-hover:bg-orange/10 group-hover:text-orange transition-colors">
              <Film size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter uppercase line-clamp-1">{job.template.name}</h3>
              <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-[0.2em]">
                <Clock size={12} />
                {date} · {time}
              </div>
            </div>
          </div>
          <StatusBadge status={job.status} stage={job.executionStage} />
        </div>

        {/* Failed State Message */}
        {job.status === 'failed' && (
          <div className="p-4 rounded-2xl bg-red/5 border border-red/10 flex items-start gap-3">
            <AlertCircle className="text-red flex-shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red/80">Neural Synthesis Failed</p>
              <p className="text-xs text-muted leading-relaxed font-medium">
                We encountered a temporal resolution issue during synthesis.
                Credits have been automatically restored to your wallet.
              </p>
            </div>
          </div>
        )}

        {/* Pending State Message */}
        {(job.status === 'processing' || job.status === 'queued') && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-orange/10 border-t-orange animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange/80">Synthesizing Assets</p>
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold">ETA: ~120 Seconds</p>
            </div>
          </div>
        )}
      </div>

      {/* Outputs Grid */}
      {job.status === 'completed' && job.outputs.length > 0 && (
        <div className="p-6 bg-white/[0.01] border-t border-white/5 grid grid-cols-1 gap-6">
          {job.outputs.map((output) => (
            <OutputCard key={output.id} output={output} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoJobCard;
