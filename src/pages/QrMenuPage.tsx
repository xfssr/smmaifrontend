import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import QrMenuCard from '../components/QrMenuCard';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

const QrMenuPage: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await api.qrMenus();
      setMenus(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Neural menu synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleCreate = async () => {
    try {
      const title = `Neural Experience ${menus.length + 1}`;
      const slug = `neural-experience-${Date.now().toString(36)}`;
      const response = await api.createQrMenu({ title, slug });
      const newMenu = response.menu ?? response;
      window.location.hash = `#/qr-menu/edit/${newMenu.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Creation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <p className="text-muted font-black uppercase tracking-widest text-[10px]">Syncing Digital Catalogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 glass-card border-red/20 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <AlertCircle className="w-16 h-16 text-red mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Sync Interrupted</h2>
          <p className="text-muted max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={fetchMenus} className="btn-orange px-10">
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
            Interactive Digital Surface
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">QR Menus</h1>
        </div>

        <button
          onClick={handleCreate}
          className="bg-gradient-to-br from-orange to-amber text-obsidian font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-orange/20 text-xs tracking-widest uppercase"
        >
          DEPLOY NEW MENU <Plus size={20} />
        </button>
      </header>

      {/* Grid */}
      {menus.length === 0 ? (
        <div className="p-20 glass-card flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
            <LegacyIcon name="templates" size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black uppercase tracking-tight">No Active Menus</h2>
            <p className="text-muted max-w-md mx-auto text-sm font-bold leading-relaxed uppercase tracking-tight">Deploy your first digital experience to bridge the gap between physical space and neural AI content.</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
          >
            Deploy My First Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {menus.map((menu) => (
            <QrMenuCard
              key={menu.id}
              menu={menu}
              onEdit={(id) => window.location.hash = `#/qr-menu/edit/${id}`}
            />
          ))}
        </div>
      )}

      <footer className="py-12 border-t border-white/5 opacity-40 flex flex-col items-center gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Obsidian Edge Delivery Network v2.1</div>
        <p className="text-[10px] text-center max-w-md leading-relaxed font-bold uppercase tracking-widest opacity-60">
          Experience low-latency synchronization across global edge nodes for instant content updates.
        </p>
      </footer>
    </div>
  );
};

export default QrMenuPage;
