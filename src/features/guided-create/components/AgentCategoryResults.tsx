import React, { useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import {
  AGENT_CATEGORY_GROUPS,
  BRAND_KIT_FACETS,
  BRAND_KIT_SWATCHES,
  categoryProgress,
  STATUS_STYLES,
  type CategoryGroup,
  type CategoryOutput,
} from './agentCategoryData';

function StatusPill({ output }: { output: CategoryOutput }) {
  const style = STATUS_STYLES[output.status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.chip} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {output.statusLabel}
    </span>
  );
}

function ProgressBar({ progress, barClass }: { progress: number; barClass: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${barClass}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function ChildOutputCard({ output }: { output: CategoryOutput }) {
  const style = STATUS_STYLES[output.status];
  const Icon = output.icon;
  const isQueued = output.status === 'queued';
  const isGenerating = output.status === 'in_progress';
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition-transform duration-200 active:scale-[1.02]">
      <div
        className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-black/40 ${
          isQueued ? 'animate-pulse' : ''
        }`}
      >
        <Icon className={`h-6 w-6 ${isGenerating ? 'text-[#FF9F1C]' : 'text-zinc-500'}`} strokeWidth={1.5} />
        {isGenerating && <div className="absolute inset-0 animate-pulse bg-[#FF9F1C]/5" />}
        <span className="absolute right-1.5 top-1.5 text-[9px] font-bold tabular-nums text-white/80">
          {output.progress}%
        </span>
      </div>
      <div className="flex items-start justify-between gap-1.5">
        <span className="min-w-0 truncate text-[11px] font-semibold text-zinc-100">{output.title}</span>
        <button
          type="button"
          aria-label={`${output.title} options`}
          className="shrink-0 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <ProgressBar progress={output.progress} barClass={style.bar} />
      <StatusPill output={output} />
    </div>
  );
}

function BrandKitCard({ output }: { output: CategoryOutput }) {
  const style = STATUS_STYLES[output.status];
  return (
    <div className="col-span-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold text-zinc-100">{output.title}</div>
          <div className="text-[9px] uppercase tracking-wide text-zinc-500">Reusable identity system</div>
        </div>
        <StatusPill output={output} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {BRAND_KIT_FACETS.map((facet) => {
          const FacetIcon = facet.icon;
          return (
            <div key={facet.id} className="flex flex-col gap-1.5 rounded-xl border border-white/5 bg-black/30 p-2">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <FacetIcon className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
                <span className="text-[9.5px] font-semibold uppercase tracking-wide">{facet.label}</span>
              </div>
              {facet.id === 'colors' ? (
                <div className="flex items-center gap-1">
                  {BRAND_KIT_SWATCHES.map((color) => (
                    <span
                      key={color}
                      className="h-3 w-3 rounded-full border border-white/15"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[9px] tabular-nums text-zinc-500">{facet.progress}%</span>
              )}
              <ProgressBar progress={facet.progress} barClass="bg-[#FF9F1C]" />
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Overall progress</span>
          <span className="text-[10px] font-bold tabular-nums text-zinc-300">{output.progress}%</span>
        </div>
        <ProgressBar progress={output.progress} barClass={style.bar} />
      </div>
    </div>
  );
}

function CategoryAccordion({ group }: { group: CategoryGroup }) {
  const [expanded, setExpanded] = useState(group.defaultExpanded);
  const Icon = group.icon;
  const progress = categoryProgress(group);
  const hasBrandKit = group.id === 'brand-system';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
          style={{ backgroundColor: `${group.accent}1f`, borderColor: `${group.accent}40` }}
        >
          <Icon className="h-4 w-4" style={{ color: group.accent }} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-zinc-100">{group.title}</span>
            <span className="shrink-0 text-[10px] font-bold tabular-nums text-zinc-500">{progress}%</span>
          </div>
          <div className="truncate text-[10px] text-zinc-500">{group.description}</div>
          <div className="mt-1.5">
            <ProgressBar progress={progress} barClass="bg-[#FF9F1C]" />
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2.5 border-t border-white/5 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {group.outputs.map((output) =>
            hasBrandKit && output.id === 'brand-kit' ? (
              <BrandKitCard key={output.id} output={output} />
            ) : (
              <ChildOutputCard key={output.id} output={output} />
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AI agent result area: the generated content grouped into expandable
 * category accordions. Rendered as part of the chat workflow, not a dashboard.
 */
export const AgentCategoryResults: React.FC<{ groups?: CategoryGroup[] }> = ({
  groups = AGENT_CATEGORY_GROUPS,
}) => {
  return (
    <div className="space-y-2.5">
      {groups.map((group) => (
        <CategoryAccordion key={group.id} group={group} />
      ))}
    </div>
  );
};

export default AgentCategoryResults;
