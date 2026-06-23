import React from 'react';
import LegacyIcon from '../components/LegacyIcon';
import { ChevronRight, Plus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface SolutionDetailProps {
  solution: {
    name: string;
    description: string;
    priceLabel: string;
    features: string[];
    slug: string;
    buttonLabel?: string;
  };
  account: any;
}

const SolutionDetailPage: React.FC<SolutionDetailProps> = ({ solution, account }) => {
  const [busy, setBusy] = React.useState(false);

  const steps = [
    { icon: 'plus', title: 'Upload photos', desc: 'Capture or select high-quality shots.' },
    { icon: 'magic', title: 'AI Analysis', desc: 'Our AI analyzes your inputs for optimal synthesis.' },
    { icon: 'templates', title: 'Style Selection', desc: 'Choose from cinematic templates tuned for your asset.' },
    { icon: 'videoDone', title: 'Instant Delivery', desc: 'Final assets delivered to your neural vault in minutes.' }
  ];

  const ownedSlugs = new Set((account?.purchasedSolutions || []).map((s: any) => s?.slug).filter(Boolean));
  const pendingOrders = (account?.paymentOrders || []).filter((o: any) => o.status === "pending" && o.solutionPack?.slug === solution.slug);
  const owned = ownedSlugs.has(solution.slug);
  const hasPending = pendingOrders.length > 0;

  const handleCheckout = async () => {
    try {
      setBusy(true);
      await api.checkoutSolution(solution.slug);
      window.location.hash = '#/account';
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <section className="space-y-6">
        <button
          onClick={() => window.location.hash = '#/solutions'}
          className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          ← Back to Catalog
        </button>

        <div className="space-y-4">
          <div className="pill">
            <LegacyIcon name="magic" size={12} className="text-orange" />
            Premium Neural Solution
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none">
            {solution.name}
          </h1>
          <p className="text-muted text-lg max-w-2xl font-bold uppercase tracking-tight">
            {solution.description}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Workflow Steps */}
          <section className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
              <LegacyIcon name="magic" className="text-orange" />
              The AI Production Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, i) => (
                <div key={i} className="p-6 glass-card flex gap-5 hover:border-orange/20 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-orange group-hover:bg-orange/10 transition-colors flex-shrink-0 border border-white/5">
                    <LegacyIcon name={step.icon} size={22} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight mb-1 text-sm">{step.title}</h3>
                    <p className="text-[10px] text-muted leading-relaxed uppercase tracking-wider font-bold">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Included Features */}
          <section className="space-y-8 p-10 glass-card border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange/40" />
            <h2 className="text-xl text-muted font-black uppercase tracking-widest">Synthesis Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solution.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-tight group">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-green group-hover:bg-green/10 transition-colors">
                    <LegacyIcon name="videoDone" size={12} />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Inputs */}
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
              <LegacyIcon name="cameraAi" className="text-amber" />
              Neural Intake Best Practices
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Studio Lighting', 'Clean Geometry', 'Neutral Texture', '4K Resolution', 'Stable Frame'].map((type, i) => (
                <span key={i} className="pill font-black">
                  {type}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / CTA */}
        <aside className="space-y-6">
          <div className="sticky top-24 p-8 glass-card border-white/20 shadow-2xl shadow-orange/10 space-y-10">
            <div className="space-y-2">
              <div className="text-muted text-[10px] font-black uppercase tracking-[0.3em]">Commercial License</div>
              <div className="text-5xl font-black text-white tracking-tighter">{solution.priceLabel}</div>
            </div>

            <div className="space-y-4">
              {owned ? (
                <div className="p-6 rounded-[20px] bg-white/5 border border-white/10 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-green/10 text-green flex items-center justify-center">
                    <LegacyIcon name="videoDone" size={20} />
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-white/60">ALREADY OWNED</div>
                  <button
                    onClick={() => window.location.hash = '#/create'}
                    className="text-orange text-[10px] font-black uppercase tracking-widest hover:underline"
                  >
                    Go to Studio →
                  </button>
                </div>
              ) : hasPending ? (
                <div className="p-6 rounded-[20px] bg-amber/5 border border-amber/20 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-amber/10 text-amber flex items-center justify-center">
                    <LegacyIcon name="magic" size={20} className="animate-pulse" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber">PAYMENT PENDING</div>
                  <p className="text-[9px] text-muted uppercase font-bold tracking-tight">Your order is waiting for confirmation.</p>
                </div>
              ) : (
                <button
                  disabled={busy}
                  onClick={handleCheckout}
                  className="bg-[#D88A3D] text-black w-full py-5 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-xl shadow-[rgba(216,138,61,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="animate-spin" size={18} /> : (solution.buttonLabel || "START PRODUCTION")}
                  {!busy && <LegacyIcon name="magic" size={18} />}
                </button>
              )}

              <p className="text-[10px] text-center text-muted uppercase font-bold tracking-[0.2em] px-4 leading-relaxed">
                Neural processing reserved in real-time
              </p>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-black text-muted uppercase tracking-widest">
                <LegacyIcon name="videoDone" size={16} className="text-orange" />
                <span>Private GPU Cluster Access</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-muted uppercase tracking-widest">
                <LegacyIcon name="videoDone" size={16} className="text-orange" />
                <span>4K Cinematic Synthesis</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SolutionDetailPage;
