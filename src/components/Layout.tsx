import React, { useState, useEffect } from 'react';
import Drawer from './Drawer';
import LegacyIcon from './LegacyIcon';
import { getDevAuthStatus, subscribeDevAuthStatus } from '../lib/api';
import { useAccountBalance } from '../hooks/useAccountBalance';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  activeRoute?: string;
  onNavigate: (page: string) => void;
  user?: any;
  account?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, activeRoute, onNavigate, user, account }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [devAuthStatus, setDevAuthStatus] = useState(getDevAuthStatus());
  const { formatted } = useAccountBalance(account);
  const isWideWorkspace = activePage === 'create' || activePage === 'admin-ai';

  // Toggle body class for drawer state
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  }, [isDrawerOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    return subscribeDevAuthStatus((status) => {
      setDevAuthStatus(status);
    });
  }, []);

  const workspaceName = account?.workspace?.name || user?.workspace?.name || "Demo workspace";
  const showBack = activePage !== 'home';

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    onNavigate('home');
  };

  return (
    <div className="h-[100dvh] min-h-0 overflow-hidden text-white flex flex-col relative bg-[#050504]">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(216,138,61,0.16),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(255,255,255,0.035),transparent_28%)] pointer-events-none" />

      {/* Main App Container */}
      <div className={`relative mx-auto h-[100dvh] min-h-0 w-full flex flex-col overflow-hidden border-x border-white/5 bg-[#070706] shadow-2xl shadow-black/70 ${isWideWorkspace ? 'max-w-none' : 'max-w-[430px]'}`}>

        {activePage !== 'admin-ai' && (
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070706]/82 backdrop-blur-xl">
            <div className="flex h-[58px] items-center justify-between px-3.5 pt-[env(safe-area-inset-top)]">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 active:scale-[0.96] transition-transform"
                aria-label="Open menu"
              >
                <LegacyIcon name="nav" size={19} />
              </button>
              <div className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-line bg-orange-soft text-orange">
                  <LegacyIcon name="logoMark" size={17} />
                </div>
                <div className="cursor-pointer">
                  <p className="text-sm font-semibold leading-none text-white tracking-tight">Obsidian Studio</p>
                  <p className="mt-1 text-[10px] text-zinc-500 uppercase tracking-widest">{workspaceName}</p>
                </div>
              </div>
              <a
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-2.5 text-zinc-300 active:scale-[0.96] transition-transform flex items-center justify-center gap-1"
                href="#/credits"
                onClick={(e) => { e.preventDefault(); onNavigate('credits'); }}
              >
                <span className="text-[10px] font-bold text-white/80">{formatted || 'Balance'}</span>
              </a>
            </div>
          </header>
        )}

        {!isWideWorkspace && import.meta.env.DEV && devAuthStatus.state !== 'idle' && (
          <div className="max-w-5xl mx-auto w-full pt-2">
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                devAuthStatus.state === 'active'
                  ? 'border-green/30 bg-green/10 text-green'
                  : 'border-red/30 bg-red-500/10 text-red'
              }`}
            >
              {devAuthStatus.state === 'active'
                ? 'Dev session active'
                : devAuthStatus.message || 'Dev auth failed - run seed or check NODE_ENV'}
            </div>
          </div>
        )}

        {showBack && !isWideWorkspace && (
          <div className="px-3.5 pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
            >
              ← Back
            </button>
          </div>
        )}

        {/* View Content */}
        <main className={`min-h-0 flex-1 w-full ${activePage === 'create' ? 'overflow-hidden p-0' : activePage === 'admin-ai' ? 'overflow-y-auto p-6' : 'overflow-y-auto p-3.5'}`}>
          {children}
        </main>
      </div>

      {activePage !== 'admin-ai' && (
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeSection={activeRoute || activePage}
          onNavigate={onNavigate}
          workspaceName={workspaceName}
        />
      )}
    </div>
  );
};

export default Layout;
