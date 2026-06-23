import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Plus, ChevronLeft, Globe, Monitor } from 'lucide-react';
import WallItemCard from '../components/WallItemCard';
import AttachOutputModal from '../components/AttachOutputModal';
import ConfirmModal from '../components/ConfirmModal';

interface DisplayWallEditorProps {
  id: string;
}

const DisplayWallEditor: React.FC<DisplayWallEditorProps> = ({ id }) => {
  const [wall, setWall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const fetchWall = async () => {
    try {
      const data = await api.displayWall(id);
      setWall(data.wall ?? data);
    } catch (err) {
      console.error(err);
      setError('Neural network connection lost.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWall();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateDisplayWall(id, {
        title: wall.title,
        layout: wall.layout
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Neural sync failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      setSaving(true);
      if (wall.status === 'published') {
        await api.unpublishDisplayWall(id);
      } else {
        await api.publishDisplayWall(id);
      }
      await fetchWall();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAttach = async (outputId: string) => {
    try {
      setSaving(true);
      await api.attachToWall(id, outputId);
      setIsAttachModalOpen(false);
      await fetchWall();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Attach failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!itemToRemove) return;
    try {
      setSaving(true);
      await api.removeFromWall(id, itemToRemove);
      setItemToRemove(null);
      await fetchWall();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Removal failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="w-12 h-12 text-orange animate-spin" />
      <p className="text-muted font-black uppercase tracking-widest text-[10px]">Synchronizing Surface Schema...</p>
    </div>
  );

  if (error || !wall) return (
    <div className="p-12 glass-card border-red/20 text-center space-y-6 animate-in zoom-in-95 duration-300">
      <AlertCircle className="w-16 h-16 text-red mx-auto" />
      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight">Access Denied</h2>
        <p className="text-muted text-sm">{error || 'Surface not found in this sector.'}</p>
      </div>
      <button onClick={() => window.location.hash = '#/display-wall'} className="btn-orange px-10">Back to Grid</button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-16 z-30 bg-obsidian/80 backdrop-blur-xl border-b border-white/5 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsDiscardModalOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border border-white/5"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase line-clamp-1">{wall.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wall.status === 'published' ? 'bg-green animate-pulse' : 'bg-muted'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  {wall.status}
                </span>
              </div>
              <a href={`/#/w/${wall.slug}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-orange hover:underline flex items-center gap-2">
                LIVE DEPLOYMENT <Globe size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishToggle}
            disabled={saving}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border ${
              wall.status === 'published' ? 'border-white/10 hover:bg-white/5 text-muted' : 'bg-green/10 border-green/20 text-green hover:bg-green/20'
            }`}
          >
            {wall.status === 'published' ? 'Take Offline' : 'Deploy Live'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-orange text-obsidian font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-orange/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <LegacyIcon name="magic" size={16} />}
            Synchronize
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
              <LegacyIcon name="videoDone" className="text-muted" size={24} />
              Surface Composition
            </h2>
            <button
              onClick={() => setIsAttachModalOpen(true)}
              className="btn-orange px-6 py-3 text-[10px]"
            >
              <Plus size={16} /> ATTACH MEDIA
            </button>
          </div>

          {wall.items?.length === 0 ? (
            <div className="p-20 glass-card border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
                <Monitor size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase tracking-tight">Empty Surface</h3>
                <p className="text-muted text-sm font-bold uppercase tracking-tight max-w-xs mx-auto">No neural assets are currently mapped to this display interface.</p>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(true)}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
              >
                Choose from Vault
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wall.items.map((item: any) => (
                <WallItemCard
                  key={item.id}
                  item={item}
                  onRemove={(id) => setItemToRemove(id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-10">
          <section className="glass-card p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center border border-orange/20">
                <LegacyIcon name="magic" size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Surface Title</label>
                <input
                  type="text"
                  value={wall.title}
                  onChange={(e) => setWall({ ...wall, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 focus:border-orange/50 transition-colors font-black uppercase tracking-tight text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Grid Schema</label>
                <div className="grid grid-cols-2 gap-3">
                  {['grid', 'featured', 'kiosk'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setWall({ ...wall, layout: mode })}
                      className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                        wall.layout === mode ? 'bg-orange/10 border-orange/40 text-orange' : 'bg-white/5 border-white/5 text-muted hover:border-white/10'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="p-10 rounded-[40px] bg-gradient-to-br from-orange to-amber border border-orange/20 text-obsidian space-y-6 shadow-2xl shadow-orange/20 animate-in slide-in-from-right-4">
            <div className="flex items-center gap-4">
              <Monitor size={40} />
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Global Playback</h2>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-90 uppercase tracking-tight">
              Display Walls are engineered for high-availability signage. Deploy the public link to any hardware via standard web interfaces.
            </p>
          </section>
        </aside>
      </div>

      <AttachOutputModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        onAttach={handleAttach}
        existingOutputIds={wall.items?.map((i: any) => i.output.id) || []}
      />

      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleRemove}
        title="Remove Asset?"
        message="This neural asset will be de-synchronized from the display surface immediately."
        confirmLabel="De-sync Asset"
      />

      <ConfirmModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={() => window.location.hash = '#/display-wall'}
        title="Discard Changes?"
        message="Unsynchronized modifications to this surface schema will be lost forever."
        confirmLabel="Discard"
        variant="warning"
      />
    </div>
  );
};

export default DisplayWallEditor;
