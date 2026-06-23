import React from 'react';
import LegacyIcon from './LegacyIcon';
import { AlertCircle } from 'lucide-react';

interface LedgerEntry {
  id: string;
  type: string;
  amountUsd: number;
  createdAt: string;
}

const TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
  grant: { label: 'Credit grant', icon: 'magic', color: 'text-green' },
  purchase: { label: 'Credit purchase', icon: 'credits', color: 'text-green' },
  topup: { label: 'Manual top up', icon: 'plus', color: 'text-green' },
  reserve: { label: 'Reserved credits', icon: 'magic', color: 'text-amber' },
  consume: { label: 'Credits used', icon: 'videoDone', color: 'text-white' },
  release: { label: 'Reserved credits returned', icon: 'magic', color: 'text-green' },
  adjustment: { label: 'Balance adjustment', icon: 'magic', color: 'text-muted' },
  refund: { label: 'Credit refund', icon: 'magic', color: 'text-green' },
};

interface LedgerListProps {
  entries: LedgerEntry[];
}

const LedgerList: React.FC<LedgerListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="p-20 glass-card flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
          <LegacyIcon name="credits" size={40} />
        </div>
        <p className="text-muted font-black uppercase tracking-widest text-[10px]">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-700">
      {entries.map((entry) => {
        const config = TYPE_MAP[entry.type] || { label: entry.type, icon: 'magic', color: 'text-muted' };
        const isNegative = entry.type === 'consume' || entry.type === 'reserve';

        return (
          <div key={entry.id} className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:border-white/10 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${config.color} border border-white/5 group-hover:scale-110 transition-transform`}>
                <LegacyIcon name={config.icon} size={20} />
              </div>
              <div>
                <div className="font-black uppercase tracking-tight text-sm">{config.label}</div>
                <div className="text-[9px] text-muted font-black uppercase tracking-widest mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString()} · {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className={`text-xl font-black tracking-tighter ${isNegative ? 'text-white/60' : config.color}`}>
              {isNegative ? '-' : '+'}${Math.abs(entry.amountUsd).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LedgerList;
