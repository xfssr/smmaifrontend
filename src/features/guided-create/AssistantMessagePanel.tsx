import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AssistantMessagePanelProps {
  message: string;
  subMessage?: string;
  isLoading?: boolean;
}

const AssistantMessagePanel: React.FC<AssistantMessagePanelProps> = ({ message, subMessage, isLoading }) => {
  return (
    <div className="glass-card p-5 rounded-[28px] border-white/10 bg-white/[0.02] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
        ${isLoading ? 'bg-white/5 text-white/20' : 'bg-green text-[#021a0a] shadow-lg shadow-green/20'}
      `}>
        {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black uppercase tracking-tight text-white leading-none">
          {message}
        </h3>
        {subMessage && (
          <p className="text-[11px] font-bold uppercase tracking-tight text-white/40 leading-tight">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssistantMessagePanel;
