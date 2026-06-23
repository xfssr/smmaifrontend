import React from 'react';
import LegacyIcon from './LegacyIcon';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  workspaceName: string;
}

const DRAWER_LINKS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'create', label: 'Create content', icon: 'createVideo' },
  { id: 'templates', label: 'Templates', icon: 'templates' },
  { id: 'my-videos', label: 'My content', icon: 'videoDone' },
  { id: 'account', label: 'Account', icon: 'account' },
  { id: 'credits', label: 'Billing', icon: 'credits' },
  { id: 'account?tab=settings', label: 'Settings', icon: 'workspace' },
];

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  activeSection,
  onNavigate,
  workspaceName
}) => {
  const activeNav = getActiveNav(activeSection);

  return (
    <>
      <div
        className={`fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-[1000] flex h-[100dvh] w-[82vw] max-w-[320px] flex-col border-r border-white/10 bg-[#090908]/95 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))] backdrop-blur-xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-white">Obsidian Studio</p>
            <p className="mt-1 text-xs text-zinc-500">{workspaceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white active:scale-[0.96]"
            aria-label="Close menu"
          >
            <LegacyIcon name="close" size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {DRAWER_LINKS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                  isActive ? 'bg-orange-soft text-orange' : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <LegacyIcon name={item.icon} size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

function getActiveNav(activeSection: string) {
  if (activeSection === 'home') return 'home';
  if (activeSection === 'create' || activeSection === 'camera') return 'create';
  if (activeSection === 'templates') return 'templates';
  if (activeSection === 'my-videos') return 'my-videos';
  if (activeSection === 'credits') return 'credits';
  if (activeSection === 'account?tab=settings') return 'account?tab=settings';
  if (activeSection === 'account') return 'account';
  return activeSection;
}

export default Drawer;
