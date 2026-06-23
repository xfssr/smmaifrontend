import React from 'react';
import LegacyIcon from './LegacyIcon';
import { formatMoney } from '../hooks/useAccountBalance';

interface BalanceCardProps {
  available: number;
  reserved: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ available, reserved }) => {
  return (
    <div className="relative overflow-hidden p-10 rounded-[40px] bg-gradient-to-br from-surface to-obsidian border border-white/10 shadow-2xl shadow-orange/5 animate-fade-in-up">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted text-[11px] font-black uppercase tracking-[0.3em]">
            <LegacyIcon name="credits" size={14} className="text-orange" />
            Balance
          </div>
          <div className="text-7xl font-black tracking-tighter text-white">
            {formatMoney(Math.round(available * 100))}
          </div>
        </div>

        <div className="flex flex-col gap-5 min-w-[200px]">
          <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Reserved credits</div>
            <div className="text-2xl font-black tracking-tighter text-amber">{formatMoney(Math.round(reserved * 100))}</div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest px-2">
            <LegacyIcon name="magic" size={14} className="text-green/50" />
            Usage-based billing
          </div>
        </div>
      </div>

      {/* Cinematic Accents */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-green/5 rounded-full blur-[100px]" />
    </div>
  );
};

export default BalanceCard;
