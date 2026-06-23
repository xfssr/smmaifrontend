import React from 'react';
import LegacyIcon from './LegacyIcon';

interface StatusBadgeProps {
  status: string;
  stage?: string;
}

const FRIENDLY_STAGE: Record<string, string> = {
  queued: "Preparing",
  processing: "Synthesizing",
  validating: "Analyzing",
  executing_primary: "Synthesizing",
  retrying: "Optimizing",
  executing_fallback: "Optimizing",
  validating_output: "Finalizing",
  completed: "Ready",
  failed: "Interrupted"
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, stage }) => {
  const label = FRIENDLY_STAGE[stage || status] || FRIENDLY_STAGE[status] || status;

  const isError = status === 'failed';
  const isSuccess = status === 'completed';
  const isPending = status === 'processing' || status === 'queued' || status === 'retrying';

  const iconName = isError ? "error" : isSuccess ? "videoDone" : "magic";

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
      isSuccess ? 'bg-green/10 border-green/20 text-green' :
      isError ? 'bg-red/10 border-red/20 text-red' :
      'bg-orange/10 border-orange/20 text-orange'
    }`}>
      <div className={isPending ? 'animate-pulse' : ''}>
        <LegacyIcon name={iconName} size={12} />
      </div>
      {label}
    </div>
  );
};

export default StatusBadge;
