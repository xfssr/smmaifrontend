import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { X, Search, Loader2, Plus, Film } from 'lucide-react';

interface AttachOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (outputId: string) => void;
  existingOutputIds: string[];
}

const AttachOutputModal: React.FC<AttachOutputModalProps> = ({ isOpen, onClose, onAttach, existingOutputIds }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.myVideos().then(res => {
        setJobs(res.videos || []);
      }).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const completedOutputs = jobs
    .filter(j => j.status === 'completed')
    .flatMap(j => j.outputs.map((o: any) => ({ ...o, templateName: j.template.name })))
    .filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.templateName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

      <div className="relative w-full max-w-3xl glass-card rounded-[48px] overflow-hidden shadow-glass flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="p-10 border-b border-white/10 space-y-8 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Synthesized Library</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl border border-white/10 transition-colors text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-orange transition-colors" size={24} />
            <input
              type="text"
              placeholder="FILTER BY NEURAL SIGNS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-[24px] pl-16 pr-8 py-5 focus:border-orange transition-all outline-none font-black text-xs uppercase tracking-[0.2em] shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide space-y-6">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-orange animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Scanning Repository</div>
            </div>
          ) : completedOutputs.length === 0 ? (
            <div className="py-32 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-white/5 border border-white/5">
                <Film size={40} />
              </div>
              <p className="text-muted text-[10px] font-black uppercase tracking-[0.3em]">No Assets Found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
              {completedOutputs.map((output) => {
                const isAttached = existingOutputIds.includes(output.id);
                return (
                  <div key={output.id} className="p-6 rounded-[32px] glass-card border-white/5 hover:border-orange/30 transition-all group flex flex-col gap-6 relative overflow-hidden hover:shadow-neon-orange">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black relative">
                      <video src={output.viewUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity duration-700" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={40} className="text-orange" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange mb-1 truncate">{output.templateName}</div>
                        <div className="font-black text-sm uppercase tracking-tighter truncate leading-none">{output.label}</div>
                      </div>
                      <button
                        onClick={() => onAttach(output.id)}
                        disabled={isAttached}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                          isAttached ? 'bg-white/5 text-muted cursor-not-allowed border border-white/5' : 'bg-orange text-obsidian hover:scale-110 shadow-lg shadow-orange/20'
                        }`}
                      >
                        {isAttached ? <Plus size={20} className="opacity-10" /> : <Plus size={20} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachOutputModal;
