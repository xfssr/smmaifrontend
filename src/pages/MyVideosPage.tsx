import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import VideoJobCard from '../components/VideoJobCard';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

interface MyVideosPageProps {
  embedded?: boolean;
}

const MyVideosPage: React.FC<MyVideosPageProps> = ({ embedded }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const result = await api.myVideos();
      setJobs(result.videos || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Unable to synchronize with the neural vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Polling for active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(j => ['queued', 'processing', 'retrying'].includes(j.status));

    let interval: any;
    if (hasActiveJobs) {
      interval = setInterval(async () => {
        try {
          const result = await api.myVideos();
          setJobs(result.videos || []);
        } catch (e) {
          console.warn("Polling failed:", e);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobs]);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <p className="text-muted font-black uppercase tracking-widest text-[10px]">Accessing Vault...</p>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="glass-card border-red/20 p-12 flex flex-col items-center text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-red" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Vault Access Denied</h2>
          <p className="text-muted max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={fetchJobs} className="rounded-2xl bg-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-colors">
          Retry Access
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header - Only show if not embedded */}
      {!embedded && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="pill border-orange-line bg-orange-soft text-orange">
              <LegacyIcon name="magic" size={14} className="text-orange" />
              Neural Asset Vault
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">My Videos</h1>
          </div>

          <button
            onClick={() => window.location.hash = '#/create'}
            className="bg-[#D88A3D] text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(216,138,61,0.3)] hover:shadow-[0_0_40px_rgba(216,138,61,0.5)] text-[11px] uppercase tracking-widest"
          >
            <Plus size={18} />
            CREATE NEW
          </button>
        </header>
      )}

      {/* Grid */}
      {jobs.length === 0 ? (
        <div className="p-20 glass-card flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center text-white/10">
            <LegacyIcon name="videoDone" size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">Vault is empty</h2>
            <p className="text-muted max-w-xs mx-auto font-bold uppercase tracking-tight text-xs">Start by choosing a creative style and generating your first cinematic asset pack.</p>
          </div>
          <button
            onClick={() => window.location.hash = '#/templates'}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border border-white/10"
          >
            Explore Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jobs.map((job) => (
            <VideoJobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {!embedded && (
        <footer className="py-12 border-t border-white/5 opacity-40 flex flex-col items-center gap-4 mt-8">
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-muted">Vault Security: AES-256 ACTIVE</div>
          <p className="text-[9px] text-center max-w-md leading-relaxed uppercase font-bold tracking-widest">
            All assets are synthesized on private distributed GPU clusters.
            Your media is encrypted and served via temporary signed proxies.
          </p>
        </footer>
      )}
    </div>
  );
};

export default MyVideosPage;
