import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Play, Sparkles } from 'lucide-react';

export type PreviewAspectRatio = '1:1' | '9:16' | '16:9' | '4:5';

type CatalogueReference = {
  id?: string;
  assetId?: string;
  url?: string;
  title?: string;
  role?: string;
  campaignRole?: string;
  sourceTruthMatch?: string;
  selectedForVideo?: boolean;
  selected?: boolean;
  provider?: string;
  modelId?: string;
  generationClass?: string;
};

const ASPECT_RATIO_OPTIONS: Array<{ value: PreviewAspectRatio; label: string }> = [
  { value: '1:1', label: '1:1' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
  { value: '4:5', label: '4:5' },
];

export interface JobTelemetry {
  jobId: string;
  status: 'queued' | 'running' | 'waiting_provider' | 'completed' | 'failed';
  currentStep:
    | 'upload_preparation'
    | 'picture_analysis'
    | 'frame_brand_prompting'
    | 'image_synthesis'
    | 'awaiting_user_approval'
    | 'video_generation'
    | 'video_prompt_compiling'
    | 'video_generating'
    | 'video_ready'
    | 'completed'
    | 'failed';
  pipelineState: string;
  outputs: {
    startFrame?: { id?: string; imageUrl: string };
    brandCards: Array<{
      id: string;
      refId?: string;
      promptToken?: string;
      title: string;
      imageUrl?: string;
      internalUrl?: string;
      assetId?: string;
      referenceImageId?: string;
      referenceId?: string;
      description?: string;
      role?: string;
      campaignRole?: string;
      sourceTruthMatch?: string;
      selectedForVideo?: boolean;
      selected?: boolean;
      approved?: boolean;
      provider?: string;
      modelId?: string;
      generationClass?: string;
    }>;
    elementClusters: Array<{
      frontal?: CatalogueReference;
      frontalUrl?: string;
      references: Array<CatalogueReference | string>;
    }>;
    finalVideoUrl?: string;
    finalVideoRatio?: string;
  };
}

export interface CanvasProps {
  job: JobTelemetry | null;
  onApproveAndStartVideo: (selectedReferenceImageIds: string[], aspectRatio: PreviewAspectRatio) => void;
}

const PIPELINE_STEPS = [
  'upload_preparation',
  'picture_analysis',
  'frame_brand_prompting',
  'image_synthesis',
  'awaiting_user_approval',
  'video_generation',
  'completed',
  'failed',
];

const blockAnimation = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.45, ease: 'easeInOut' as const },
};

function referenceUrl(reference: CatalogueReference | string | undefined) {
  if (!reference) return undefined;
  return typeof reference === 'string' ? reference : reference.url;
}

function referenceId(reference: CatalogueReference | string | undefined) {
  if (!reference || typeof reference === 'string') return undefined;
  return reference.id;
}

function isValidReferenceId(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.length > 0;
}

function getDisplayImageUrl(card: { imageUrl?: string; internalUrl?: string; referenceImageId?: string; id: string }) {
  return card.imageUrl || card.internalUrl;
}

function getSelectableReferenceId(card: { id: string; referenceImageId?: string }) {
  return card.referenceImageId || card.id;
}

function formatCardTitle(title: string) {
  return title || 'Brand Asset';
}

export const WorkflowCatalogueCanvas: React.FC<CanvasProps> = ({ job, onApproveAndStartVideo }) => {
  const currentStep = job?.currentStep ?? 'upload_preparation';
  const stepIndex = Math.max(0, PIPELINE_STEPS.indexOf(currentStep));
  const outputs = job?.outputs;
  const cluster = outputs?.elementClusters?.[0];
  const isAwaitingApproval = job?.pipelineState === 'awaiting_user_approval';
  const hasPreviewCards = Boolean(outputs?.brandCards?.length);
  const isSynthesis = currentStep === 'image_synthesis';
  const isAnalyzing = currentStep === 'picture_analysis';
  const isVideoGenerating = currentStep === 'video_generation' || currentStep === 'video_prompt_compiling' || currentStep === 'video_generating';
  const isVideoStage = isVideoGenerating || currentStep === 'video_ready';
  const showStyleBoard = stepIndex >= PIPELINE_STEPS.indexOf('frame_brand_prompting') || isAwaitingApproval || hasPreviewCards;
  const showFinalVideo = isVideoStage || stepIndex >= PIPELINE_STEPS.indexOf('video_generation') || Boolean(outputs?.finalVideoUrl);

  const [selectedPreviewIds, setSelectedPreviewIds] = React.useState<Set<string>>(new Set());
  const [selectedAspectRatio, setSelectedAspectRatio] = React.useState<PreviewAspectRatio>('9:16');

  const selectableCardItems = React.useMemo(() => {
    const cards = outputs?.brandCards ?? [];
    return cards
      .map((card) => {
        const referenceId = getSelectableReferenceId(card);
        return referenceId ? { referenceId, card } : null;
      })
      .filter(Boolean) as Array<{ referenceId: string; card: JobTelemetry['outputs']['brandCards'][number] }>;
  }, [outputs?.brandCards]);

  const imageReferenceItems = React.useMemo(() => {
    const references = cluster?.references ?? [];
    return references
      .map((reference) => {
        const id = referenceId(reference);
        if (!id) return null;
        return {
          id,
          url: referenceUrl(reference),
          title: typeof reference === 'string' ? undefined : reference.title,
        };
      })
      .filter(Boolean) as Array<{ id: string; url: string | undefined; title?: string }>;
  }, [cluster?.references]);

  const selectableIds = React.useMemo(() => {
    if (selectableCardItems.length > 0) {
      return selectableCardItems.map((item) => item.referenceId);
    }
    return imageReferenceItems.map((item) => item.id);
  }, [selectableCardItems, imageReferenceItems]);

  const supportReferenceItems = React.useMemo(() => {
    const primaryIds = new Set(selectableCardItems.map((item) => item.referenceId));
    return imageReferenceItems.filter((item) => !primaryIds.has(item.id));
  }, [selectableCardItems, imageReferenceItems]);

  React.useEffect(() => {
    if (!isAwaitingApproval) return;
    setSelectedPreviewIds(new Set(selectableIds));
  }, [isAwaitingApproval, selectableIds]);

  React.useEffect(() => {
    if (outputs?.finalVideoUrl) {
      setSelectedAspectRatio('9:16');
    }
  }, [outputs?.finalVideoUrl]);

  const toggleSelection = (id?: string) => {
    if (!isAwaitingApproval || !id) return;
    setSelectedPreviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = (nextChecked: boolean) => {
    setSelectedPreviewIds(new Set(nextChecked ? selectableIds : []));
  };

  const canStartVideo = isValidReferenceId(selectedPreviewIds.size ? Array.from(selectedPreviewIds)[0] : undefined) && selectedPreviewIds.size > 0;

  const renderSelection = (id?: string) => {
    if (!isAwaitingApproval || !id || !selectedPreviewIds.has(id)) return null;
    return (
      <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#FF9F1C] text-black shadow-[0_4px_12px_rgba(255,159,28,0.5)] transition-transform scale-110 border-2 border-black/10">
        <Check size={16} strokeWidth={3} />
      </div>
    );
  };

  const renderVisualNode = (
    url: string | undefined,
    title: string,
    aspectRatio = 'aspect-square',
    id?: string
  ) => (
    <button
      type="button"
      onClick={() => toggleSelection(id)}
      disabled={!isAwaitingApproval || !id}
      className={`web-premium-card relative w-full ${aspectRatio} overflow-hidden rounded-3xl text-center transition-all duration-500 border border-white/5 ${
        isSynthesis && !url ? 'border-[#FF9F1C]/20 shadow-[inset_0_0_12px_rgba(255,159,28,0.05)]' : ''
    } ${id && isAwaitingApproval ? 'cursor-pointer hover:ring-2 hover:ring-[#FF9F1C]/40 hover:shadow-lg' : 'cursor-default'} ${
      id && isAwaitingApproval && !selectedPreviewIds.has(id) ? 'opacity-45 grayscale-[30%]' : 'opacity-100'
      }`}
    >
      {url ? (
        <img src={url} className="h-full w-full object-cover animate-premium-in select-none" alt={title} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 p-3">
          <div className={`h-1.5 w-1.5 rounded-full ${isSynthesis || isAnalyzing ? 'bg-[#FF9F1C] animate-ping' : 'bg-zinc-700'}`} />
          <span className="text-[9px] font-medium tracking-wide text-zinc-500">{title}</span>
        </div>
      )}
      {renderSelection(id)}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 px-4 pb-44 text-white">
      <AnimatePresence>
        <motion.div {...blockAnimation} key="scene-generation" className="space-y-3">
          <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Scene generation
          </div>
          {renderVisualNode(
            outputs?.startFrame?.imageUrl,
            isSynthesis ? 'Building main frame...' : 'Main frame pending',
            'aspect-[16/10]',
            outputs?.startFrame?.id
          )}
          <div className="px-2 text-[11px] text-zinc-400 mt-1">Primary composed scene to start the video.</div>
        </motion.div>

        <motion.div
          {...blockAnimation}
          key="object-space"
          className="bg-white/[0.02] border border-white/5 relative flex flex-col items-center rounded-[2rem] p-6 shadow-2xl"
        >
          <div className="mb-8 self-start text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Brand Story Graph
          </div>

          <div className="h-[140px] w-[140px] shadow-2xl ring-4 ring-black/20 rounded-3xl">
            {renderVisualNode(
              cluster?.frontalUrl || referenceUrl(cluster?.frontal),
              isAnalyzing ? 'Scanning object' : 'Base frame',
              'aspect-square',
              cluster?.frontal?.id
            )}
          </div>

          <div className="my-4 flex w-full flex-col items-center">
            <div className={`h-6 w-0.5 rounded-full bg-gradient-to-b ${isAnalyzing ? 'from-[#FF9F1C] to-[#E65F2B]' : 'from-zinc-500 to-zinc-800'}`} />
            <div className={`h-0.5 w-[75%] rounded-full ${isAnalyzing ? 'bg-[#E65F2B]/50' : 'bg-white/10'}`} />
            <div className="flex h-4 w-[75%] justify-between">
              {[0, 1, 2].map((item) => (
                <div key={item} className={`h-full w-0.5 rounded-b-full ${isAnalyzing ? 'bg-[#E65F2B]/50' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3">
            {['Atmosphere', 'Detail', 'Context'].map((label, index) => {
              const reference = cluster?.references?.[index];
              return (
                <div key={label} className="flex flex-col gap-2">
                  <div className="h-[90px] shadow-xl ring-2 ring-black/10 rounded-3xl">
                    {renderVisualNode(referenceUrl(reference), label, 'aspect-square', referenceId(reference))}
                  </div>
                  <div className="text-center text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {showStyleBoard && (
          <motion.div {...blockAnimation} key="style-board" className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Creative Preview Catalogue
              </div>
              <div className="text-[10px] text-[#FF9F1C] font-bold px-3 py-1 bg-[#FF9F1C]/10 rounded-full border border-[#FF9F1C]/20">
                Recommend format: 9:16
              </div>
            </div>
            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-6 pt-2 px-2 scrollbar-hide [scrollbar-width:none]">
              {(outputs?.brandCards?.length ? outputs.brandCards : [
                { id: 'palette', title: 'Palette' },
                { id: 'logo', title: 'Logo' },
                { id: 'type', title: 'Typography' },
                { id: 'poster', title: 'Poster' },
              ]).map((card) => (
                <div key={card.id} data-testid={`preview-card-${card.id}`} className="w-[160px] shrink-0 snap-center flex flex-col gap-3">
                  <div className="min-h-0 shadow-lg">
                    {renderVisualNode(
                      getDisplayImageUrl(card as any),
                      formatCardTitle(card.title),
                      'aspect-[4/5]',
                      getSelectableReferenceId(card as any)
                    )}
                  </div>
                  <div className="px-1 text-left space-y-1">
                    <div className="text-sm font-semibold text-white leading-tight line-clamp-1">
                      {formatCardTitle(card.title)}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="truncate">{(card as any).generationClass || 'Asset'}</span> <span className="text-zinc-700 shrink-0">•</span> <span className="text-zinc-400 shrink-0">{(card as any).provider || 'AI'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {supportReferenceItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  Video support assets
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide [scrollbar-width:none] px-2">
                  {supportReferenceItems.map((reference) => (
                    <div key={reference.id} className="h-16 w-16 shrink-0">
                      {renderVisualNode(reference.url, reference.title || 'Support asset', 'aspect-square', undefined)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="mt-4 flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/5 text-sm font-medium text-zinc-300 cursor-pointer active:scale-95 transition-all w-max hover:bg-white/10">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-[6px] border-white/20 bg-black/50 text-[#FF9F1C] focus:ring-[#FF9F1C] focus:ring-offset-0 transition-colors"
                checked={selectedPreviewIds.size > 0 && selectedPreviewIds.size === selectableIds.length}
                onChange={(event) => toggleAllSelection(event.currentTarget.checked)}
                disabled={!isAwaitingApproval || selectableIds.length === 0}
              />
              <span>Select all previews for video</span>
            </label>
          </motion.div>
        )}

        {showFinalVideo && (
          <motion.div {...blockAnimation} key="final-video" className="space-y-2">
            <div className="px-1 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Final render
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 text-center shadow-xl">
              {outputs?.finalVideoUrl ? (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video shadow-2xl">
                  <video src={outputs.finalVideoUrl} controls className="h-full w-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/5 py-8 text-zinc-500">
                  <Play size={20} className={isVideoGenerating ? 'text-[#FF9F1C] animate-pulse' : ''} />
                  <span className="text-[11px] text-zinc-400">
                    {isVideoGenerating ? 'Motion render in progress...' : 'Video render pending'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAwaitingApproval && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-50 flex flex-col items-center justify-end bg-[#0B0B0D]/90 backdrop-blur-xl border-t border-white/10 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 px-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400 font-medium">
                  Выбрано <span className="text-white font-bold text-sm px-1">{selectedPreviewIds.size}</span> превью
                </div>
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                  {ASPECT_RATIO_OPTIONS.map(ratio => (
                    <button
                      key={ratio.value}
                      data-testid={`aspect-ratio-${ratio.value.replace(':','-')}`}
                      onClick={() => setSelectedAspectRatio(ratio.value)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${selectedAspectRatio === ratio.value ? 'bg-[#FF9F1C] text-black shadow-md scale-105' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                data-testid="generate-video-cta"
                onClick={() => canStartVideo && onApproveAndStartVideo(Array.from(selectedPreviewIds), selectedAspectRatio)}
                disabled={!canStartVideo}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                  canStartVideo ? 'bg-[#FF9F1C] text-black shadow-[0_4px_25px_rgba(255,159,28,0.35)]' : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                }`}
              >
                <Sparkles size={16} />
                Generate Video
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
