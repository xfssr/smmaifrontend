import { useState, useEffect, useCallback } from 'react';
import { HashRouter, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SolutionsPage from './pages/SolutionsPage';
import SolutionDetailPage from './pages/SolutionDetailPage';
import AccountPage from './pages/AccountPage';
import CreditsPage from './pages/CreditsPage';
import MyVideosPage from './pages/MyVideosPage';
import QrMenuPage from './pages/QrMenuPage';
import QrMenuEditorPage from './pages/QrMenuEditorPage';
import PublicQrMenuPage from './pages/PublicQrMenuPage';
import DisplayWallPage from './pages/DisplayWallPage';
import DisplayWallEditor from './pages/DisplayWallEditor';
import PublicDisplayWallPage from './pages/PublicDisplayWallPage';
import CreatePage from './pages/CreatePage';
import TemplatesPage from './pages/TemplatesPage';
import DiscoverPage from './pages/DiscoverPage';
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';
import AdminAiPage from './pages/AdminAiPage';
import { api, ensureDevSession } from './lib/api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Account {
  user: User;
}

interface Solution {
  name: string;
  description: string;
  priceLabel: string;
  features: string[];
  slug: string;
  buttonLabel?: string;
  [key: string]: any;
}

const ACTIVE_PAGES = new Set([
  'home',
  'solutions',
  'solution-detail',
  'account',
  'credits',
  'my-videos',
  'qr-menu',
  'qr-menu-edit',
  'display-wall',
  'display-wall-edit',
  'create',
  'templates',
  'discover',
  'not-found',
]);

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

function AppContent() {
  const [page, setPage] = useState('home');
  const [slug, setSlug] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState('');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        await ensureDevSession();
        if (!cancelled) {
          setBootstrapError(null);
          setBootstrapping(false);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Dev auth failed - run npm run prisma:seed";
          setBootstrapError(message);
          setBootstrapping(false);
        }
      }
    };
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch User Data
  useEffect(() => {
    if (bootstrapping) return;
    const fetchUser = async () => {
      try {
        const data = await api.me();
        setAccount(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [bootstrapping]);

  const parseRoute = (pathname: string, search: string, hash: string) => {
    const normalizedSource = pathname === "/" || pathname === "" ? hash : pathname;
    const path = normalizedSource.replace(/^#\/?/, '').replace(/^\/?/, '');
    const parts = path.split('?')[0].split('/');
    const page = parts[0] || 'home';

    const query = new URLSearchParams(search);

    if (page === 'solutions' && parts[1]) {
      return { page: 'solution-detail', slug: parts[1], activeId: null, routePath: path };
    }
    if (page === 'account') {
      return { page: 'account', slug: query.get('tab') || null, activeId: null, routePath: path };
    }
    if (page === 'qr-menu' && parts[1] === 'edit' && parts[2]) {
      return { page: 'qr-menu-edit', slug: null, activeId: parts[2], routePath: path };
    }
    if (page === 'display-wall' && parts[1] === 'edit' && parts[2]) {
      return { page: 'display-wall-edit', slug: null, activeId: parts[2], routePath: path };
    }
  if (page === 'm' && parts[1]) {
    return { page: 'public-menu', slug: parts[1], activeId: null, routePath: path };
  }
  if (page === 'w' && parts[1]) {
    return { page: 'public-wall', slug: parts[1], activeId: null, routePath: path };
  }
  if (page === 'admin' && parts[1] === 'ai') {
    const section = parts[2] || 'dashboard';
    return { page: 'admin-ai', slug: section, activeId: null, routePath: path };
  }
  if (ACTIVE_PAGES.has(page)) {
    return { page, slug: null, activeId: null, routePath: path };
  }
  return { page: 'not-found', slug: null, activeId: null, routePath: path };
};

  useEffect(() => {
    const { page, slug, activeId, routePath } = parseRoute(location.pathname, location.search, location.hash);
    setPage(page);
    setSlug(slug);
    setActiveId(activeId);
    setRoutePath(routePath);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (page === 'solution-detail' || page === 'solutions') {
      if (solutions.length === 0) {
        setLoading(true);
        api.solutions().then(res => setSolutions(res.solutions)).finally(() => setLoading(false));
      }
    }
  }, [page, solutions.length]);

  const activeSolution = slug ? solutions.find(s => s.slug === slug) : null;

  if (page === 'public-menu' && slug) {
    return <PublicQrMenuPage slug={slug} />;
  }

  if (page === 'public-wall' && slug) {
    return <PublicDisplayWallPage slug={slug} />;
  }

  const handleNavigate = (p: string) => {
    navigate(p === 'home' ? '/' : `/${p}`);
  };

  const renderPage = () => {
    if (bootstrapping) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-green animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">
            Starting local demo session...
          </p>
        </div>
      );
    }

    if (bootstrapError && import.meta.env.DEV) {
      return (
        <div className="glass-card p-10 rounded-[28px] text-center space-y-4 border-red/20">
          <h2 className="text-2xl font-black uppercase tracking-tight text-red">Dev auth failed</h2>
          <p className="text-sm text-white/65 font-bold uppercase tracking-tight">
            {bootstrapError}
          </p>
          <p className="text-[10px] text-white/45 font-black uppercase tracking-[0.18em]">
            Run npm run prisma:seed and keep NODE_ENV=development
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-12 h-12 text-green animate-spin" />
        </div>
      );
    }

    switch (page) {
      case 'home': return <Home />;
      case 'solutions': return <SolutionsPage />;
      case 'account': return <AccountPage onNavigate={handleNavigate} account={account} initialTab={slug || 'overview'} />;
      case 'credits': return <AccountPage onNavigate={handleNavigate} account={account} initialTab="credits" />;
      case 'my-videos': return <AccountPage onNavigate={handleNavigate} account={account} initialTab="videos" />;
      case 'admin-ai': return <AdminAiPage section={slug || 'dashboard'} onNavigate={handleNavigate} />;
      case 'qr-menu': return <QrMenuPage />;
      case 'qr-menu-edit': return activeId ? <QrMenuEditorPage id={activeId} /> : null;
      case 'display-wall': return <DisplayWallPage />;
      case 'display-wall-edit': return activeId ? <DisplayWallEditor id={activeId} /> : null;
      case 'create': return <CreatePage />;
      case 'templates': return <TemplatesPage />;
      case 'discover': return <DiscoverPage />;
      case 'solution-detail':
        return activeSolution ? (
          <SolutionDetailPage solution={activeSolution} account={account} />
        ) : (
          <div className="glass-card p-12 rounded-[32px] text-center space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight">Solution Not Found</h2>
            <p className="text-muted">The requested AI solution does not exist or has been archived.</p>
            <button
              onClick={() => navigate('/solutions')}
              className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-2xl font-bold transition-all border border-white/10"
            >
              Return to Catalog
            </button>
          </div>
        );
      case 'not-found':
      default:
        return <NotFoundPage path={routePath} />;
    }
  };

  return (
    <Layout
      activePage={page}
      activeRoute={slug ? `${page}?tab=${slug}` : page}
      onNavigate={handleNavigate}
      user={account?.user}
      account={account}
    >
      <ErrorBoundary resetKey={`${page}:${slug ?? ''}:${activeId ?? ''}`}>
        {renderPage()}
      </ErrorBoundary>

      {/* Toast System */}
      <div className="fixed left-0 right-0 top-[calc(70px+env(safe-area-inset-top))] p-4 pointer-events-none z-[10000] flex flex-col items-center gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast pointer-events-auto">
            {toast.type === 'success' ? <CheckCircle2 className="text-green" size={20} /> : <AlertCircle className="text-red" size={20} />}
            <span className="text-sm font-bold uppercase tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default App;
