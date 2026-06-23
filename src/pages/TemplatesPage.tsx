import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronUp, Clock, Loader2, Play, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import {
  normalizeTemplateExperience,
  templateDurationLabel,
  type TemplateCatalogItem,
} from '../lib/templateExperience';

const CATEGORY_ORDER = ['food_bar', 'products', 'beauty_wellness', 'hotels_hospitality', 'ugc_ads', 'events', 'real_estate', 'local_business'];

const CATEGORY_CONFIG: Record<string, { label: string; matchSlugs: string[] }> = {
  food_bar: { label: 'Food & Bar', matchSlugs: ['food_bar'] },
  products: { label: 'Products', matchSlugs: ['product', 'product_studio'] },
  beauty_wellness: { label: 'Beauty / Nails', matchSlugs: ['beauty_wellness'] },
  hotels_hospitality: { label: 'Hotels / Hospitality', matchSlugs: ['hotels_hospitality', 'hotel', 'hospitality'] },
  ugc_ads: { label: 'UGC Ads', matchSlugs: ['ugc_ads'] },
  events: { label: 'Events', matchSlugs: ['events', 'event'] },
  real_estate: { label: 'Real Estate', matchSlugs: ['real_estate'] },
  local_business: { label: 'Local Business', matchSlugs: ['local_business'] },
};

function categoryMatches(template: TemplateCatalogItem, slug: string) {
  const matchSlugs = CATEGORY_CONFIG[slug]?.matchSlugs ?? [slug];
  return Boolean(template.categorySlug && matchSlugs.includes(template.categorySlug));
}

function categorySortIndex(template: TemplateCatalogItem) {
  const slug = CATEGORY_ORDER.find((categorySlug) => categoryMatches(template, categorySlug));
  return slug ? CATEGORY_ORDER.indexOf(slug) : CATEGORY_ORDER.length;
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.templates();
        if (!cancelled) {
          setTemplates(res.templates || []);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
        if (!cancelled) setError('Unable to load templates right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const query = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const cat = query.get('category');
      if (cat) {
        setActiveCategory(cat);
      } else {
        setActiveCategory('all');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const categories = CATEGORY_ORDER;

  const feedTemplates = useMemo(() => {
    const sorted = [...templates].sort((a, b) => {
      const categoryDelta = categorySortIndex(a) - categorySortIndex(b);
      if (categoryDelta !== 0) return categoryDelta;
      return a.name.localeCompare(b.name);
    });
    return activeCategory === 'all' ? sorted : sorted.filter((template) => categoryMatches(template, activeCategory));
  }, [activeCategory, templates]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Loading template marketplace</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card flex flex-col items-center gap-6 border-red/20 p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red" />
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight">Template feed offline</h2>
          <p className="mx-auto max-w-xs text-muted">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-orange px-10">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <header className="sticky top-0 z-20 -mx-4 border-b border-white/5 bg-obsidian/90 px-4 py-5 backdrop-blur-2xl">
        <div className="flex items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.34em] text-orange">
              <Sparkles size={14} />
              Template Marketplace
            </div>
            <h1 className="text-4xl font-black uppercase leading-none tracking-tight">Marketplace</h1>
            <p className="max-w-sm text-[11px] font-bold uppercase leading-relaxed tracking-tight text-white/45">
              No prompting. No editing. Just upload your business photos.
            </p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70"
            title="Back to top"
          >
            <ChevronUp size={18} />
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCategory === 'all'
                ? 'border-orange bg-orange text-obsidian'
                : 'border-white/10 bg-white/5 text-white/55'
            }`}
          >
            All
          </button>
          {categories.map((slug) => (
            <button
              key={slug}
              onClick={() => setActiveCategory(slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === slug
                  ? 'border-orange bg-orange text-obsidian'
                  : 'border-white/10 bg-white/5 text-white/55'
              }`}
            >
              {CATEGORY_CONFIG[slug]?.label || slug}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        {feedTemplates.map((template) => (
          <TemplateFeedCard key={template.id} template={template} />
        ))}
      </div>

      {feedTemplates.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center gap-5 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/20">
            <Play size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-muted">Coming soon</p>
        </div>
      )}
    </div>
  );
};

function TemplateFeedCard({ template }: { template: TemplateCatalogItem }) {
  const experience = normalizeTemplateExperience(template);
  const category = template.categoryName || CATEGORY_CONFIG[template.categorySlug || '']?.label || 'Template';
  const requiredCount = experience.requiredShots.filter((shot) => shot.required).length;

  return (
    <article className="contain-paint cv-auto overflow-hidden rounded-[32px] border border-white/10 bg-[#080a0f] shadow-2xl">
      <div className="relative aspect-[9/14] min-h-[520px] overflow-hidden bg-black">
        {experience.previewVideo ? (
          <video
            className="h-full w-full object-cover"
            src={experience.previewVideo}
            poster={experience.previewImage || undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="h-full w-full">
            {experience.previewImage && (
              <img
                src={experience.previewImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="gpu h-full w-full object-cover opacity-90"
                style={{
                  animation: 'subtle-zoom 20s infinite alternate ease-in-out',
                } as any}
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,102,0,0.22),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.84))]" />
            {!experience.previewImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                <div className="h-28 w-64 rounded-full border border-white/10 bg-white/[0.03] blur-sm animate-pulse" />
              </div>
            )}
          </div>
        )}

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 backdrop-blur-xl">
          <Play size={13} className="text-orange" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{category}</span>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 backdrop-blur-xl">
          <Clock size={13} className="text-white/55" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
            {templateDurationLabel(template)}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-5 bg-gradient-to-t from-black via-black/85 to-transparent p-6 pt-32">
          <div className="space-y-3">
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
              {template.name}
            </h2>
            <p className="max-w-xl text-[13px] font-bold uppercase leading-relaxed tracking-tight text-white/70">
              {template.publicDescription || template.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-5">
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">Needs</div>
              <div className="text-sm font-black uppercase tracking-tight text-white">
                {template.requiredAssetMin}–{template.requiredAssetMax} Photos · {category}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">Output</div>
              <div className="text-sm font-black uppercase tracking-tight text-white">
                {template.outputAspectRatio || '9:16'} Social Asset · {template.outputDurationSec || 6}s
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.hash = `#/create?template=${template.slug}`;
            }}
            className="btn-orange flex w-full items-center justify-center gap-3 py-6 text-[11px] font-black uppercase tracking-[0.3em] shadow-neon-orange"
          >
            Create with AI SMM Agent
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-center backdrop-blur-xl">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">{label}</div>
      <div className="mt-1 truncate text-xs font-black uppercase tracking-tight text-white">{value}</div>
    </div>
  );
}

export default TemplatesPage;
