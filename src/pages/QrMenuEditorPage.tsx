import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Trash2, Plus, ChevronLeft, Globe } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

interface QrMenuEditorPageProps {
  id: string;
}

const QrMenuEditorPage: React.FC<QrMenuEditorPageProps> = ({ id }) => {
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      const data = await api.qrMenu(id);
      setMenu(data.menu ?? data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Neural menu link failed.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const runMutation = async (mutation: () => Promise<unknown>, fallbackMessage = 'Neural sync failed') => {
    try {
      setSaving(true);
      await mutation();
      await fetchMenu();
    } catch (err) {
      alert(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await runMutation(() => api.updateQrMenu(id, {
      title: menu.title,
      description: menu.description || '',
      logoUrl: menu.logoUrl ?? null,
      coverImageUrl: menu.coverImageUrl ?? null
    }));
  };

  const handlePublishToggle = async () => {
    await runMutation(
      () => menu.status === 'published' ? api.unpublishQrMenu(id) : api.publishQrMenu(id),
      'Action failed'
    );
  };

  const handleDelete = async () => {
    try {
      await api.deleteQrMenu(id);
      window.location.hash = '#/qr-menu';
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  const addSection = async () => {
    await runMutation(() => api.addQrMenuSection(id, 'New Category'));
  };

  const updateSection = (sId: string, title: string) => {
    setMenu({
      ...menu,
      sections: menu.sections.map((s: any) => s.id === sId ? { ...s, title } : s)
    });
  };

  const persistSection = async (sId: string) => {
    const section = menu.sections.find((s: any) => s.id === sId);
    const title = section?.title?.trim();
    if (!title) {
      await fetchMenu();
      return;
    }
    await runMutation(() => api.updateQrMenuSection(sId, { title }));
  };

  const removeSection = async (sId: string) => {
    await runMutation(() => api.deleteQrMenuSection(sId), 'Section delete failed');
  };

  const addItem = async (sId: string) => {
    await runMutation(() => api.addQrMenuItem(sId, {
      title: 'Neural Asset',
      description: '',
      priceIls: 0
    }));
  };

  const updateItem = (sId: string, iId: string, updates: any) => {
    setMenu({
      ...menu,
      sections: menu.sections.map((s: any) => s.id === sId ? {
        ...s,
        items: s.items.map((i: any) => i.id === iId ? { ...i, ...updates } : i)
      } : s)
    });
  };

  const persistItem = async (sId: string, iId: string) => {
    const section = menu.sections.find((s: any) => s.id === sId);
    const item = section?.items.find((i: any) => i.id === iId);
    const title = item?.title?.trim();
    if (!title) {
      await fetchMenu();
      return;
    }
    await runMutation(() => api.updateQrMenuItem(iId, {
      title,
      description: item.description || '',
      priceIls: Number(item.priceIls) || 0
    }));
  };

  const removeItem = async (_sId: string, iId: string) => {
    await runMutation(() => api.deleteQrMenuItem(iId), 'Item delete failed');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <Loader2 className="w-12 h-12 text-orange animate-spin" />
      <p className="text-muted font-black uppercase tracking-widest text-[10px]">Syncing Experience Schema...</p>
    </div>
  );

  if (error || !menu) return (
    <div className="p-12 glass-card border-red/20 text-center space-y-6 animate-in zoom-in-95 duration-300">
      <AlertCircle className="w-16 h-16 text-red mx-auto" />
      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight">Access Denied</h2>
        <p className="text-muted text-sm">{error || 'Experience not found in this sector.'}</p>
      </div>
      <button onClick={() => window.location.hash = '#/qr-menu'} className="btn-orange px-10">Back to Grid</button>
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
            <h1 className="text-3xl font-black tracking-tighter uppercase line-clamp-1">{menu.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${menu.status === 'published' ? 'bg-green animate-pulse' : 'bg-muted'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  {menu.status}
                </span>
              </div>
              <a href={`/#/m/${menu.slug}`} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-orange hover:underline flex items-center gap-2">
                LIVE PREVIEW <Globe size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublishToggle}
            disabled={saving}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border ${
              menu.status === 'published' ? 'border-white/10 hover:bg-white/5 text-muted' : 'bg-green/10 border-green/20 text-green hover:bg-green/20'
            }`}
          >
            {menu.status === 'published' ? 'Take Offline' : 'Deploy Live'}
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

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Settings */}
        <section className="glass-card p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange/10 text-orange flex items-center justify-center border border-orange/20">
              <LegacyIcon name="magic" size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Core Metadata</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Experience Title</label>
              <input
                type="text"
                value={menu.title}
                onChange={(e) => setMenu({ ...menu, title: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 focus:border-orange/50 transition-colors font-black uppercase tracking-tight text-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">Contextual Description</label>
              <input
                type="text"
                value={menu.description || ''}
                onChange={(e) => setMenu({ ...menu, description: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-[20px] px-6 py-4 focus:border-orange/50 transition-colors text-sm font-bold"
                placeholder="Ex: Cinematic Winter Collection 2026"
              />
            </div>
          </div>
        </section>

        {/* Content Builder */}
        <section className="space-y-10">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
              <LegacyIcon name="templates" className="text-muted" size={24} />
              Neural Clusters
            </h2>
            <button onClick={addSection} disabled={saving} className="btn-orange px-6 py-3 text-[10px]">
              <Plus size={16} /> ADD CLUSTER
            </button>
          </div>

          <div className="space-y-12">
            {menu.sections.map((section: any) => (
              <div key={section.id} className="glass-card p-10 space-y-8 relative overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange/40" />

                <div className="flex items-center justify-between gap-6 border-b border-white/5 pb-6">
                  <div className="flex-1 flex items-center gap-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, e.target.value)}
                      onBlur={() => persistSection(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-2xl font-black uppercase tracking-tight p-0 placeholder:text-white/10"
                      placeholder="Category Name"
                    />
                  </div>
                  <button onClick={() => removeSection(section.id)} disabled={saving} className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/10 disabled:opacity-50">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  {section.items.map((item: any) => (
                    <div key={item.id} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row gap-8 group hover:border-white/10 transition-all">
                      <div className="flex-1 space-y-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                          onBlur={() => persistItem(section.id, item.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 font-black uppercase tracking-tight p-0 text-xl group-hover:text-orange transition-colors"
                          placeholder="Asset Name"
                        />
                        <textarea
                          value={item.description || ''}
                          onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                          onBlur={() => persistItem(section.id, item.id)}
                          className="w-full bg-transparent border-none focus:ring-0 text-[11px] p-0 text-muted resize-none font-bold uppercase tracking-widest leading-relaxed"
                          placeholder="Describe the neural experience..."
                          rows={2}
                        />
                      </div>
                      <div className="flex md:flex-col items-center justify-between gap-6">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                          <span className="text-muted font-black text-xs uppercase tracking-widest">₪</span>
                          <input
                            type="number"
                            value={item.priceIls}
                            onChange={(e) => updateItem(section.id, item.id, { priceIls: parseFloat(e.target.value) || 0 })}
                            onBlur={() => persistItem(section.id, item.id)}
                            className="w-20 bg-transparent border-none focus:ring-0 font-black p-0 text-right text-lg tracking-tighter"
                          />
                        </div>
                        <button onClick={() => removeItem(section.id, item.id)} disabled={saving} className="w-10 h-10 rounded-xl bg-white/5 text-muted hover:text-red-500 transition-colors flex items-center justify-center border border-white/5 disabled:opacity-50">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addItem(section.id)}
                    disabled={saving}
                    className="w-full py-6 rounded-[28px] border border-dashed border-white/10 text-muted hover:text-orange hover:border-orange/30 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 bg-white/[0.01]"
                  >
                    <Plus size={20} /> ATTACH NEURAL ASSET
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dangerous Actions */}
        <section className="p-12 rounded-[40px] border border-red-500/20 bg-red-500/5 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <Trash2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-red-500">Purge Experience</h2>
            <p className="text-muted text-sm font-bold uppercase tracking-tight max-w-sm">Deleting this menu will immediately sever all active QR links and neural deployments.</p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-10 py-4 rounded-2xl bg-red-500 text-white transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20"
          >
            CONFIRM DESTRUCTION
          </button>
        </section>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Purge Experience?"
        message="This action is irreversible. All neural deployments and active QR codes will be terminated immediately."
        confirmLabel="Yes, Purge"
      />

      <ConfirmModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirm={() => window.location.hash = '#/qr-menu'}
        title="Discard Changes?"
        message="Unsynchronized modifications to this experience schema will be lost forever."
        confirmLabel="Discard"
        variant="warning"
      />
    </div>
  );
};

export default QrMenuEditorPage;
