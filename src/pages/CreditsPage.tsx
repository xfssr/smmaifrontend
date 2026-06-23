import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import BalanceCard from '../components/BalanceCard';
import LedgerList from '../components/LedgerList';
import LegacyIcon from '../components/LegacyIcon';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { invalidateAccountBalance, useAccountBalance } from '../hooks/useAccountBalance';

interface CreditsPageProps {
  embedded?: boolean;
}

const CreditsPage: React.FC<CreditsPageProps> = ({ embedded }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { balance } = useAccountBalance();

  const fetchData = async () => {
    try {
      const result = await api.credits();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Billing information is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTopUp = async (amount: number) => {
    try {
      setTopUpLoading(true);
      await api.topUp(amount);
      invalidateAccountBalance();
      setSuccessMessage(`Added $${amount} to your balance.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
        <p className="text-muted font-black uppercase tracking-widest text-[10px]">Loading billing...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card border-red/20 p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
        <AlertCircle className="w-16 h-16 text-red" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Billing unavailable</h2>
          <p className="text-muted max-w-xs mx-auto">{error}</p>
        </div>
        <button onClick={fetchData} className="rounded-2xl bg-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      {!embedded && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-4">
            <div className="pill border-orange-line bg-orange-soft text-orange">
              <LegacyIcon name="credits" size={14} className="text-orange" />
              Billing
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Billing</h1>
          </div>

          {/* Dev Top-up - ONLY VISIBLE IN DEV */}
          {import.meta.env.DEV && (
            <div className="flex gap-2">
              {[10, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleTopUp(amount)}
                  disabled={topUpLoading}
                  className="px-4 py-2 bg-white/5 hover:bg-orange hover:text-[#021a0a] hover:shadow-[0_0_15px_rgba(216,138,61,0.3)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2"
                >
                  {topUpLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  +${amount}
                </button>
              ))}
            </div>
          )}
        </header>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-green/10 border border-green/20 text-green text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
          {successMessage}
        </div>
      )}

      {/* Balance Section */}
      <BalanceCard
        available={(balance?.balanceCents ?? Math.round(data.balance.availableUsd * 100)) / 100}
        reserved={data.balance.reservedUsd}
      />

      {/* Transaction History */}
      <section className="space-y-8 pt-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
            <LegacyIcon name="videoDone" className="text-muted" size={24} />
            Recent Activity
          </h2>
          <span className="text-[10px] text-muted font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            Recent activity
          </span>
        </div>

        <LedgerList entries={data.ledger} />
      </section>

      {!embedded && (
        <footer className="py-12 border-t border-white/5 opacity-40 mt-8">
          <p className="text-[9px] text-muted text-center uppercase font-bold tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
            Credits are used when your business content is created.
          </p>
        </footer>
      )}
    </div>
  );
};

export default CreditsPage;
