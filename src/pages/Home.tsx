import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Clock4, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import {
  normalizeTemplateExperience,
  templateDurationLabel,
  type TemplateCatalogItem,
} from '../lib/templateExperience';

const HOME_CATEGORIES = [
  { label: 'Food & Bar', category: 'food_bar' },
  { label: 'Products', category: 'products' },
  { label: 'Beauty / Nails', category: 'beauty_nails' },
  { label: 'Hotels / Hospitality', category: 'hotels_hospitality' },
  { label: 'UGC Ads', category: 'ugc_ads' },
  { label: 'Events', category: 'events' },
  { label: 'Real Estate', category: 'real_estate' },
  { label: 'Local Business', category: 'local_business' },
] as const;

type HomeCategory = typeof HOME_CATEGORIES[number]['category'];

const CATEGORY_MATCHES: Record<HomeCategory, string[]> = {
  food_bar: ['food_bar'],
  products: ['products', 'product', 'product_studio'],
  beauty_nails: ['beauty_nails', 'beauty_wellness'],
  hotels_hospitality: ['hotels_hospitality', 'hotel', 'hospitality'],
  ugc_ads: ['ugc_ads'],
  events: ['events', 'event'],
  real_estate: ['real_estate'],
  local_business: ['local_business'],
};

function templateCategoryKeys(template: TemplateCatalogItem) {
  const raw = template as TemplateCatalogItem & {
    category?: string | { slug?: string | null } | null;
    businessCategory?: string | null;
  };

  return [
    template.categorySlug,
    typeof raw.category === 'string' ? raw.category : raw.category?.slug,
    raw.businessCategory,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);
}

function templateMatchesCategory(template: TemplateCatalogItem, selectedCategory: HomeCategory) {
  const matches = CATEGORY_MATCHES[selectedCategory] || [selectedCategory];
  return templateCategoryKeys(template).some((category) => matches.includes(category));
}

function uniqueTemplates(templates: TemplateCatalogItem[]) {
  const seen = new Set<string>();
  return templates.filter((template) => {
    const key = template.slug || template.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<HomeCategory>('food_bar');
  const [templates, setTemplates] = useState<TemplateCatalogItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const response = await api.templates();
        if (!cancelled) {
          setTemplates(uniqueTemplates(response.templates || []));
          setTemplatesError(null);
        }
      } catch (error) {
        console.error('Failed to load home templates:', error);
        if (!cancelled) setTemplatesError('Templates are not available right now.');
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    };

    void loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategoryLabel = HOME_CATEGORIES.find((category) => category.category === selectedCategory)?.label || 'Templates';
  const visibleTemplates = useMemo(
    () => templates.filter((template) => templateMatchesCategory(template, selectedCategory)),
    [selectedCategory, templates],
  );
  const recommendationTemplates = useMemo(() => templates.slice(0, 4), [templates]);

  const inlineTemplatePreview = (
    <div className="space-y-3 py-1">
      {templatesLoading && (
        <div className="flex min-h-[180px] items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.035]">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Loader2 size={16} className="animate-spin text-orange" />
            Loading templates
          </div>
        </div>
      )}

      {!templatesLoading && templatesError && (
        <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 text-sm font-medium text-zinc-400">
          {templatesError}
        </div>
      )}

      {!templatesLoading && !templatesError && visibleTemplates.length === 0 && (
        <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange">{selectedCategoryLabel}</p>
          <p className="mt-2 text-lg font-semibold text-white">Coming soon</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-500">
            New business templates for this category will appear here.
          </p>
        </div>
      )}

      {!templatesLoading && !templatesError && visibleTemplates.length > 0 && (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pr-6 scrollbar-hide">
          {visibleTemplates.map((template) => (
            <HomeTemplateCard key={template.id || template.slug} template={template} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-full flex-col gap-5 pb-6 pt-4 animate-in fade-in duration-700">
      <section className="space-y-3">
        <div className="space-y-1 px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange">Top recommendations</p>
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-zinc-50">Social content templates</h2>
          <p className="text-xs font-medium leading-relaxed text-zinc-500">
            Preview how templates work before choosing one for your business photos.
          </p>
        </div>

        {templatesLoading && (
          <div className="flex gap-3 overflow-hidden pb-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-[198px] w-[150px] shrink-0 animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[0.035]"
              />
            ))}
          </div>
        )}

        {!templatesLoading && recommendationTemplates.length > 0 && (
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pr-6 scrollbar-hide">
            {recommendationTemplates.map((template) => (
              <RecommendationTemplateCard key={template.id || template.slug} template={template} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-zinc-50">What do you want to create?</h2>
          <span className="text-xs font-semibold text-orange">{selectedCategoryLabel}</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          {HOME_CATEGORIES.map((category) => (
            <div key={category.category} className="space-y-2.5">
              <button
                type="button"
                onClick={() => { setSelectedCategory(category.category); }}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition active:scale-[0.98] ${
                  selectedCategory === category.category
                    ? 'border-orange/45 bg-orange/10 text-white'
                    : 'border-white/10 bg-white/[0.035] text-zinc-100 hover:border-orange/25 hover:bg-orange/5'
                }`}
              >
                <span className="text-sm font-semibold">{category.label}</span>
                <ChevronRight
                  size={17}
                  className={selectedCategory === category.category ? 'rotate-90 text-orange' : 'text-zinc-500'}
                />
              </button>
              {selectedCategory === category.category && inlineTemplatePreview}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function RecommendationTemplateCard({ template }: { template: TemplateCatalogItem }) {
  const experience = normalizeTemplateExperience(template);
  const previewImage = experience.previewImage;
  const previewVideo = experience.previewVideo;

  return (
    <article className="relative h-[198px] w-[150px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#080a0f]">
      {previewVideo ? (
        <video
          src={previewVideo}
          poster={previewImage || undefined}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : previewImage ? (
        <img src={previewImage} alt={template.name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(216,138,61,0.18),transparent_34%),linear-gradient(160deg,#121318,#050504)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-orange backdrop-blur-md">
        Tutorial preview
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="line-clamp-2 text-xs font-black uppercase leading-tight tracking-tight text-white">
          {template.name}
        </h3>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          Preview only
        </p>
      </div>
    </article>
  );
}

function HomeTemplateCard({ template }: { template: TemplateCatalogItem }) {
  const experience = normalizeTemplateExperience(template);
  const duration = templateDurationLabel(template);
  const previewImage = experience.previewImage;
  const previewVideo = experience.previewVideo;

  const openTemplate = () => {
    if (!template.slug) return;
    window.location.hash = `#/create?template=${template.slug}`;
  };

  return (
    <article
      className="group relative h-[260px] w-[178px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#080a0f] shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition hover:border-orange/30 active:scale-[0.98]"
      onClick={openTemplate}
    >
      {previewVideo ? (
        <video
          src={previewVideo}
          poster={previewImage || undefined}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : previewImage ? (
        <img
          src={previewImage}
          alt={template.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(216,138,61,0.18),transparent_34%),linear-gradient(160deg,#121318,#050504)]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
      <div className="absolute inset-x-3 top-3 flex justify-end">
        <span className="flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white/75 backdrop-blur-md">
          <Clock4 size={9} />
          {duration}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 space-y-3 p-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-tight text-white">
            {template.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-snug text-zinc-400">
            {template.publicDescription || template.description || 'Ready social content for your business photos.'}
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openTemplate();
          }}
          className="flex w-full items-center justify-center rounded-xl border border-orange-line bg-orange-soft py-2 text-[9px] font-black uppercase tracking-[0.12em] text-orange transition hover:bg-orange hover:text-black active:scale-95"
        >
          Use template
        </button>
      </div>
    </article>
  );
}

export default Home;
