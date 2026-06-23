import React from 'react';
import { Clock4, PlayCircle, Layers } from 'lucide-react';
import {
  normalizeTemplateExperience,
  templateDurationLabel,
  type TemplateCatalogItem
} from '../../lib/templateExperience';

interface TemplatePreviewBlockProps {
  template: TemplateCatalogItem;
}

const TemplatePreviewBlock: React.FC<TemplatePreviewBlockProps> = ({ template }) => {
  const experience = normalizeTemplateExperience(template);
  const preview = experience.previewImage || experience.previewVideo || template.previewImageUrl || template.previewVideoUrl;
  const description = template.publicDescription || template.description;
  const category = template.categoryName || 'Content Template';
  const durationLabel = templateDurationLabel(template);
  const requiredCount = experience.requiredShots.filter(s => s.required).length;
  const totalCount = experience.requiredShots.length;

  return (
    <div className="space-y-4">
      <div className="relative h-[220px] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-black/40">
        {experience.previewVideo ? (
          <video
            src={experience.previewVideo}
            poster={experience.previewImage || undefined}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : experience.previewImage ? (
          <img src={experience.previewImage} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-obsidian flex items-center justify-center">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 rotate-90">Preview Missing</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white">
          {category}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight leading-[0.92] text-white">
            {template.name}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-tight text-white/40 leading-relaxed">
            {description || 'Capture guided shots, confirm assets, and generate cinematic AI output.'}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Layers size={10} className="text-orange" /> <span className="hidden sm:inline">Required Shots</span><span className="sm:hidden">Shots</span>
            </div>
            <div className="text-xs font-black text-white">{requiredCount} / {totalCount}</div>
          </div>
          <div className="p-3 rounded-[16px] bg-white/[0.03] border border-white/5 space-y-0.5">
            <div className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Clock4 size={10} className="text-orange" /> <span className="hidden sm:inline">Est. Duration</span><span className="sm:hidden">Duration</span>
            </div>
            <div className="text-xs font-black text-white">{durationLabel}</div>
          </div>
        </div>

        {/* Tags and Status */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {experience.styleTags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[7px] font-black uppercase tracking-[0.1em] text-white/60">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-orange animate-pulse">
            <PlayCircle size={12} />
            AI Directed Capture Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewBlock;
