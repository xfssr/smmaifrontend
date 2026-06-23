import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import SolutionCard from '../components/SolutionCard';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import LegacyIcon from '../components/LegacyIcon';

const SolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSolutions() {
      try {
        setLoading(true);
        const data = await api.solutions();
        setSolutions(data.solutions);
        setError(null);
      } catch (err) {
        console.error('Failed to load solutions:', err);
        setError('Unable to load AI solutions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadSolutions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <p className="pill">Accessing Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card border-red/20 p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
        <AlertCircle className="w-16 h-16 text-red" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Transmission Error</h2>
          <p className="text-muted max-w-xs mx-auto">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-orange px-10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header */}
      <header className="space-y-6 max-w-3xl">
        <div className="pill">
          <LegacyIcon name="aiStyle" size={14} className="animate-pulse text-orange" />
          Neural Generation Catalog
        </div>
        <h1 className="text-4xl md:text-7xl">
          CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange to-amber">EDGE</span>
        </h1>
        <p className="text-muted text-lg font-medium leading-relaxed max-w-xl">
          High-performance video generation packs tailored for competitive markets.
          Select a solution to begin your instant AI transformation.
        </p>
      </header>

      {/* Grid */}
      {solutions.length === 0 ? (
        <div className="p-20 glass-card flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
            <Inbox size={40} />
          </div>
          <p className="text-muted font-black uppercase tracking-widest text-xs">No solutions available in your region</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
            />
          ))}
        </div>
      )}

      {/* Footnote */}
      <footer className="text-center py-8">
        <p className="text-[10px] text-white/10 uppercase font-black tracking-[0.2em]">
          All generation results are hyper-realistic and production-ready
        </p>
      </footer>
    </div>
  );
};

export default SolutionsPage;
