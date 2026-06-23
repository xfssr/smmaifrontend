import React, { useEffect, useState } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { api } from '../lib/api';
import LegacyIcon from '../components/LegacyIcon';
import { formatMoney, useAccountBalance } from '../hooks/useAccountBalance';

interface AccountPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  account?: any;
  initialTab?: string;
}

const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onLogout, account: initialAccount }) => {
  const [account, setAccount] = useState<any>(initialAccount);
  const [videos, setVideos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { balance, formatted } = useAccountBalance(account);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [accountResult, videosResult] = await Promise.all([
          initialAccount ? Promise.resolve(initialAccount) : api.me(),
          api.myVideos().catch(() => ({ videos: [] })),
        ]);
        if (!cancelled) {
          setAccount(accountResult);
          setVideos(videosResult.videos || []);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Account information is unavailable right now.');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialAccount]);

  if (error) {
    return (
      <div className="rounded-[28px] border border-red/20 bg-red-500/5 p-10 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red" />
        <h1 className="text-xl font-semibold text-white">Account unavailable</h1>
        <p className="mt-2 text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-24 animate-pulse rounded-[28px] bg-white/[0.04]" />
        <div className="h-36 animate-pulse rounded-[28px] bg-white/[0.04]" />
      </div>
    );
  }

  const workspaceName = account.workspace?.name || 'Demo workspace';
  const planLabel = account.billingAccount?.status === 'active' ? 'Business' : 'Demo / Free';
  const recentVideos = videos.slice(0, 3);
  const reservedCents = Math.round(Number(account.billingAccount?.reservedUsd ?? 0) * 100);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-orange">Account</p>
        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">{workspaceName}</h1>
        <p className="text-sm text-zinc-500">{account.user?.email}</p>
      </header>

      <section className="grid grid-cols-1 gap-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Balance</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {formatted || formatMoney(balance?.balanceCents ?? 0)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Credits available for new content.</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Plan</p>
          <p className="mt-2 text-xl font-semibold text-white">{planLabel}</p>
          <p className="mt-1 text-xs text-zinc-500">Workspace plan for business content creation.</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Recent content</h2>
          <button
            type="button"
            onClick={() => onNavigate('my-videos')}
            className="text-xs font-semibold text-orange"
          >
            My content
          </button>
        </div>
        <div className="space-y-2">
          {recentVideos.length > 0 ? recentVideos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => onNavigate('my-videos')}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-white">{video.template?.name || 'Business content'}</p>
                <p className="mt-1 text-xs capitalize text-zinc-500">{video.status}</p>
              </div>
              <LegacyIcon name="videoDone" size={16} className="text-zinc-500" />
            </button>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 text-sm text-zinc-500">
              No content yet. Create your first social media asset from a template.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-white">Recent activity</h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Credits used</span>
            <span>{formatMoney(reservedCents)}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={() => onNavigate('credits')}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-left"
        >
          <span className="font-semibold text-white">Billing</span>
          <LegacyIcon name="credits" size={16} className="text-zinc-500" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate('account?tab=settings')}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-left"
        >
          <span className="font-semibold text-white">Settings</span>
          <LegacyIcon name="workspace" size={16} className="text-zinc-500" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-between rounded-2xl border border-red/20 bg-red-500/5 px-4 py-4 text-left text-red"
        >
          <span className="font-semibold">Logout</span>
          <LogOut size={16} />
        </button>
      </section>
    </div>
  );
};

export default AccountPage;
