import React from 'react';
import LegacyIcon from './LegacyIcon';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string; // Legacy icon name
  onClick?: () => void;
  primary?: boolean;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, onClick, primary, trend }) => {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`p-6 rounded-[28px] border transition-all duration-300 text-left group w-full ${
        primary
          ? 'bg-gradient-to-br from-orange to-amber border-orange/20 text-obsidian shadow-xl shadow-orange/10 hover:scale-[1.02]'
          : 'glass-card border-white/5 text-white hover:border-white/10 hover:bg-white/[0.02]'
      } ${!onClick ? 'cursor-default' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          primary ? 'bg-obsidian/10' : 'bg-white/5 group-hover:bg-green/10 group-hover:text-green'
        }`}>
          <LegacyIcon name={icon} size={20} />
        </div>
        {trend && (
          <span className="text-[10px] font-black text-green bg-green/10 px-2 py-1 rounded-full uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-black tracking-tighter uppercase">{value}</div>
        <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${primary ? 'text-obsidian/60' : 'text-muted'}`}>
          {label}
        </div>
      </div>
    </button>
  );
};

export default StatCard;
