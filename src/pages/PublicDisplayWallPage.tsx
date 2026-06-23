import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

interface PublicDisplayWallPageProps {
  slug: string;
}

const PublicDisplayWallPage: React.FC<PublicDisplayWallPageProps> = ({ slug }) => {
  const [wall, setWall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.publicWall(slug).then(res => {
      setWall(res.wall || res); // Handle both {wall} and direct wall object
    }).catch(err => {
      console.error(err);
      setError('Neural wall connection lost.');
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 space-y-6">
        <Loader2 className="w-16 h-16 text-orange animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted animate-pulse">Synchronizing Neural Media...</div>
      </div>
    );
  }

  if (error || !wall) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-1000">
        <AlertCircle size={80} className="text-red-500/10" />
        <div className="space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Surface Offline</h1>
          <p className="text-muted text-sm font-bold uppercase tracking-tight max-w-sm mx-auto leading-relaxed">This visual signage interface has been de-synchronized or is currently under maintenance.</p>
        </div>
      </div>
    );
  }

  const items = wall.items || [];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden animate-in fade-in duration-2000 selection:bg-orange/30">
      <div className={`grid h-screen w-full gap-0.5 p-0.5 ${
        items.length === 1 ? 'grid-cols-1' :
        items.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        items.length <= 4 ? 'grid-cols-2' :
        items.length <= 6 ? 'grid-cols-2 md:grid-cols-3' :
        'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
      }`}>
        {items.map((item: any) => (
          <div key={item.id} className="relative overflow-hidden group bg-white/[0.02] animate-in zoom-in-95 duration-1000">
            <video
              src={item.viewUrl}
              className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-125"
              autoPlay
              muted
              loop
              playsInline
            />

            {/* Minimal High-End HUD overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange shadow-sm">NEURAL ASSET</div>
                  <div className="text-sm font-black uppercase tracking-tight text-white leading-none">
                    {item.caption || "Obsidian Production"}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                </div>
              </div>
            </div>

            {/* Scanning Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange/20 to-transparent h-20 -top-20 animate-scan" />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-[1em] text-white/5 italic">No Assets Mapped</h2>
          </div>
        )}
      </div>

      {/* Persistent Brand Watermark */}
      <div className="fixed bottom-10 right-10 z-50 pointer-events-none opacity-20 group hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-end -space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white">OBSIDIAN</div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-orange">STUDIO SURFACE</div>
        </div>
      </div>
    </div>
  );
};

export default PublicDisplayWallPage;
