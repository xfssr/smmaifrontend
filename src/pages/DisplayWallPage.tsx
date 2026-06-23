import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import PublishBadge from '../components/PublishBadge';
import CopyLinkButton from '../components/CopyLinkButton';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Plus, ExternalLink } from 'lucide-react';

const DisplayWallPage: React.FC = () => {
  const [walls, setWalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalls = async () => {
    try {
      setLoading(true);
      const data = await api.displayWalls();
      setWalls(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Neural network synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalls();
  }, []);

  const handleCreate = async () => {
    try {
      const title = `Neural Surface ${walls.length + 1}`;
      const slug = `neural-surface-${Date.now().toString(36)}`;
      const response = await api.createDisplayWall({ title, slug });
      const newWall = response.wall ?? response;
      window.location.hash = `#/display-wall/edit/${newWall.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deployment failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <p className="text-muted font-black uppercase tracking-widest text-[10px]">Syncing Visual Surfaces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 glass-card border-red/20 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <AlertCircle className="w-16 h-16 text-red mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Network Interrupted</h2>
          <p className="text-muted max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={fetchWalls} className="btn-orange px-10">
          Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="pill">
            <LegacyIcon name="magic" size={14} className="text-orange" />
            Large-Scale Neural Signage
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Display Walls</h1>
        </div>

        <button
          onClick={handleCreate}
          className="bg-gradient-to-br from-orange to-amber text-obsidian font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-orange/20 text-xs tracking-widest uppercase"
        >
          DEPLOY NEW SURFACE <Plus size={20} />
        </button>
      </header>

      {/* Grid */}
      {walls.length === 0 ? (
        <div className="p-20 glass-card flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
            <LegacyIcon name="videoDone" size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tight">No Active Surfaces</h2>
            <p className="text-muted max-w-md mx-auto text-sm font-bold leading-relaxed uppercase tracking-tight">Deploy your first display wall to showcase cinematic AI synthesis on any hardware interface.</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
          >
            Deploy My First Wall
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {walls.map((wall) => (
            <div key={wall.id} className="glass-card group rounded-[40px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 flex-1 space-y-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-orange group-hover:scale-110 transition-transform border border-white/5">
                    <LegacyIcon name="videoDone" size={32} />
                  </div>
                  <PublishBadge status={wall.status} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-orange transition-colors leading-none">{wall.title}</h3>
                  <div className="text-[9px] text-muted font-black uppercase tracking-[0.3em]">
                    {wall.items?.length || 0} Assets · {wall.layout || 'Grid'} Schema
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <CopyLinkButton slug={wall.slug} type="wall" />
                  <button
                    onClick={() => window.open(`/#/w/${wall.slug}`, '_blank')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-muted hover:text-white border border-white/5 transition-all"
                  >
                    <ExternalLink size={14} />
                    Live View
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white/[0.01] border-t border-white/5">
                <button
                  onClick={() => window.location.hash = `#/display-wall/edit/${wall.id}`}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-orange hover:text-obsidian text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <LegacyIcon name="magic" size={18} />
                  Configure Surface
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="py-12 border-t border-white/5 opacity-40 flex flex-col items-center gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Neural Sync Protocol v4.0</div>
        <p className="text-[10px] text-center max-w-md leading-relaxed font-bold uppercase tracking-widest opacity-60">
          Visual surfaces are optimized for 24/7 autonomous playback with zero-latency buffer management.
        </p>
      </footer>
    </div>
  );
};

export default DisplayWallPage;
