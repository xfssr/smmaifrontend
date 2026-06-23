import React from 'react';
import LegacyIcon from './LegacyIcon';
import CopyLinkButton from './CopyLinkButton';

interface QrMenuCardProps {
  menu: {
    id: string;
    title: string;
    slug: string;
    status: string;
    sections: any[];
  };
  onEdit: (id: string) => void;
}

const QrMenuCard: React.FC<QrMenuCardProps> = ({ menu, onEdit }) => {
  const itemCount = menu.sections.reduce((acc, s) => acc + (s.items?.length || 0), 0);
  const isPublished = menu.status === 'published';

  return (
    <div className="glass-card group rounded-[40px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 flex-1 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-orange group-hover:scale-110 transition-transform border border-white/5">
            <LegacyIcon name="templates" size={32} />
          </div>
          <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${
            isPublished ? 'bg-green/10 border-green/20 text-green' : 'bg-white/5 border-white/10 text-muted'
          }`}>
            {menu.status}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-orange transition-colors leading-none">{menu.title}</h3>
          <div className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">
            {itemCount} Synthesis Assets · {menu.sections.length} Experience Clusters
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-3">
          <CopyLinkButton slug={menu.slug} type="menu" />
          <button
            onClick={() => window.open(`/#/m/${menu.slug}`, '_blank')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-muted hover:text-white border border-white/5 transition-all"
          >
            <LegacyIcon name="magic" size={14} />
            Preview Deployment
          </button>
        </div>
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <button
          onClick={() => onEdit(menu.id)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-orange hover:text-obsidian text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <LegacyIcon name="magic" size={18} />
          Modify Schema
        </button>
      </div>
    </div>
  );
};

export default QrMenuCard;
