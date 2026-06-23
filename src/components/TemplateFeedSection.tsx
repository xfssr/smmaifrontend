import React from 'react';
import { Sparkles } from 'lucide-react';
import TemplateCarousel from './TemplateCarousel';
import TemplatePreviewCard from './TemplatePreviewCard';
import type { TemplateCatalogItem } from '../lib/templateExperience';

interface TemplateFeedSectionProps {
  title: string;
  subtitle: string;
  templates: TemplateCatalogItem[];
  onTryTemplate: (slug: string) => void;
}

const TemplateFeedSection: React.FC<TemplateFeedSectionProps> = ({
  title,
  subtitle,
  templates,
  onTryTemplate,
}) => {
  if (templates.length === 0) return null;

  return (
    <section className="space-y-4">
      <header className="space-y-2 px-1">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange drop-shadow-[0_0_8px_rgba(216,138,61,0.3)]">
          <Sparkles size={13} className="animate-pulse" />
          {title}
        </div>
        <p className="text-sm font-bold uppercase tracking-tight text-white/50">{subtitle}</p>
      </header>

      <TemplateCarousel ariaLabel={`${title} templates`}>
        {templates.map((template) => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            onTry={onTryTemplate}
          />
        ))}
      </TemplateCarousel>
    </section>
  );
};

export default TemplateFeedSection;
