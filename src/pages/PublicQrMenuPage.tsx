import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle } from 'lucide-react';

interface PublicQrMenuPageProps {
  slug: string;
}

const PublicQrMenuPage: React.FC<PublicQrMenuPageProps> = ({ slug }) => {
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.publicMenu(slug).then(res => {
      setMenu(res.menu || res); // Handle both {menu} and direct menu object
    }).catch(err => {
      console.error(err);
      setError('Neural menu link severed.');
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 space-y-6">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted animate-pulse">Syncing Experience...</div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-20 h-20 rounded-[32px] bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black uppercase tracking-tight">Offline Sector</h1>
          <p className="text-muted text-sm font-bold uppercase tracking-tight max-w-xs mx-auto leading-relaxed">The requested neural catalog is currently unavailable or has been archived.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col animate-in fade-in duration-1000 selection:bg-orange/30">
      {/* Hero / Header */}
      <div className="relative h-80 overflow-hidden group">
        {menu.coverImageUrl ? (
          <img src={menu.coverImageUrl} className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-obsidian via-white/5 to-obsidian" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />

        {/* Logo Overlay */}
        <div className="absolute inset-x-0 -bottom-12 flex flex-col items-center">
          {menu.logoUrl ? (
            <div className="w-32 h-32 rounded-[40px] bg-obsidian p-1.5 shadow-2xl border border-white/5">
              <div className="w-full h-full rounded-[34px] overflow-hidden">
                <img src={menu.logoUrl} className="w-full h-full object-cover" alt="Logo" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-[40px] bg-obsidian p-1.5 shadow-2xl border border-white/5">
              <div className="w-full h-full rounded-[34px] bg-white/5 flex items-center justify-center text-orange/40">
                <LegacyIcon name="magic" size={48} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 mt-16 mb-12 flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">{menu.title}</h1>
        {menu.description && (
          <p className="text-muted text-[11px] font-bold uppercase tracking-widest max-w-md leading-relaxed opacity-60">
            {menu.description}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 px-8 pb-32 space-y-16 max-w-3xl mx-auto w-full">
        {menu.sections.map((section: any) => (
          <section key={section.id} className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="relative">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center justify-between pb-4 border-b border-white/10">
                {section.title}
                <div className="h-0.5 w-12 bg-orange/40 rounded-full" />
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {section.items.map((item: any) => (
                <div key={item.id} className="flex gap-8 items-start group relative">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-black text-xl leading-tight uppercase group-hover:text-orange transition-colors">{item.title}</h3>
                      {item.description && (
                        <p className="text-[11px] text-muted font-medium uppercase tracking-tight leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-2xl font-black text-white tracking-tighter">₪{item.priceIls}</div>
                      {item.tags?.length > 0 && (
                        <div className="flex gap-2">
                          {item.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-[0.2em] text-orange/60 border border-orange/10">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media */}
                  {(item.videoUrl || item.imageUrl) && (
                    <div className="w-32 h-32 rounded-[32px] bg-white/5 border border-white/5 overflow-hidden flex-shrink-0 shadow-2xl group-hover:border-orange/20 transition-all relative">
                      {item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating CTA / Footer */}
      <footer className="fixed bottom-0 inset-x-0 p-8 pointer-events-none z-50">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="px-8 py-5 glass-card flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border-white/10 rounded-[32px] backdrop-blur-3xl">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center border border-orange/20">
                <LegacyIcon name="magic" size={24} />
              </div>
              <div className="flex flex-col -space-y-1">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted">Neural Surface</div>
                <div className="text-sm font-black uppercase tracking-tighter text-white">Obsidian Studio</div>
              </div>
            </div>
            <div className="w-1 h-8 bg-white/5 mx-2 rounded-full" />
            <div className="text-[9px] text-orange font-black uppercase tracking-[0.2em] animate-pulse cursor-pointer hover:opacity-80 transition-opacity">
              Contact Concierge
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicQrMenuPage;
