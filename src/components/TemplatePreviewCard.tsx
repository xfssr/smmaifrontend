import React from 'react';
import { Camera, Clock4 } from 'lucide-react';
import { normalizeTemplateExperience, templateDurationLabel, type TemplateCatalogItem } from '../lib/templateExperience';

interface TemplatePreviewCardProps {
  template: TemplateCatalogItem;
  onTry: (slug: string) => void;
  variant?: 'standard' | 'pipeline';
  selected?: boolean;
}

const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  template,
  onTry,
  variant = 'standard',
  selected = false
}) => {
  const experience = normalizeTemplateExperience(template);
  const duration = templateDurationLabel(template);
  const previewVideo = experience.previewVideo;
  const previewImage = experience.previewImage;

  const isPipeline = variant === 'pipeline';

  return (
    <article
      onClick={() => isPipeline && onTry(template.slug || '')}
      className={`group relative shrink-0 snap-start overflow-hidden rounded-[1.35rem] transition-all duration-300 cursor-pointer
        ${isPipeline
          ? `w-[135px] sm:w-[150px] aspect-[9/13.8]
             ${selected
               ? 'border-[2px] border-orange shadow-[0_0_15px_rgba(216,138,61,0.45)] scale-[1.02] z-10'
               : 'border border-white/5 opacity-75 hover:opacity-100 scale-[0.98]'
             }`
          : 'w-[155px] sm:w-[170px] aspect-[9/14.2] border border-white/10 bg-[#07090d] shadow-[0_12px_36px_rgba(0,0,0,0.45)] hover:-translate-y-1 hover:border-orange/30'
        }
      `}
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Media Container */}
        <div className="absolute inset-0 z-0">
          {previewVideo ? (
            <video
              src={previewVideo}
              poster={previewImage || undefined}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : previewImage ? (
            <img
              src={previewImage}
              alt={template.name}
              className="h-full w-full object-cover transition-transform duration-[12000ms] group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,140,0,0.15),transparent_35%),linear-gradient(160deg,#0d1018,#05070b)]" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

        {/* Top Badges */}
        {!isPipeline && (
          <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between z-20">
            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md">
              {template.categoryName || 'Template'}
            </span>
            <span className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white/70 backdrop-blur-md">
              <Clock4 size={9} />
              {duration}
            </span>
          </div>
        )}

        {/* Bottom Content Area */}
        <div className={`absolute inset-x-0 bottom-0 p-3 z-20 ${isPipeline ? 'pt-8' : 'pt-12'}`}>
          <h3 className={`font-black uppercase tracking-tight text-white line-clamp-1 leading-tight
            ${isPipeline ? 'text-[11px] sm:text-[12px]' : 'text-xs sm:text-sm'}
          `}>
            {template.name}
          </h3>

          {!isPipeline ? (
            <>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {experience.styleTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/5 bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTry(template.slug || '');
                  }}
                  className="flex w-full items-center justify-center gap-1 rounded-xl border border-orange-line bg-orange-soft py-2 text-[9px] font-black uppercase tracking-[0.12em] text-orange transition-all duration-300 hover:bg-[#D88A3D] hover:text-black hover:shadow-[0_0_12px_rgba(216,138,61,0.25)] active:scale-95"
                >
                  <Camera size={11} />
                  Use Template
                </button>
              </div>
            </>
          ) : (
            <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
              <span>{duration}</span>
              {selected && <span className="text-orange text-[8px] tracking-[0.15em] font-black">Active</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default TemplatePreviewCard;
