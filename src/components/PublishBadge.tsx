import React from 'react';
import LegacyIcon from './LegacyIcon';

interface PublishBadgeProps {
  status: string;
}

const PublishBadge: React.FC<PublishBadgeProps> = ({ status }) => {
  const isPublished = status === 'published';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
      isPublished
        ? 'bg-green/10 border-green/20 text-green'
        : 'bg-white/5 border-white/10 text-muted'
    }`}>
      {isPublished ? <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" /> : <LegacyIcon name="magic" size={10} className="opacity-20" />}
      {status}
    </div>
  );
};

export default PublishBadge;
