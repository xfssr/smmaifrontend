import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import type { JobTelemetry } from '../components/WorkflowCatalogueCanvas';

type NormalizedReference = {
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

function hasReferenceUrl(reference: NormalizedReference): reference is NormalizedReference & { url: string } {
  return typeof reference.url === 'string' && reference.url.length > 0;
}

function mapSmmAgentJob(data: any): JobTelemetry {
  const outputObj = data.outputJson || {};
  const referenceImages = Array.isArray(outputObj.referenceImages) ? outputObj.referenceImages : [];
  const generatedReferenceCards = Array.isArray(outputObj.generatedReferenceCards) ? outputObj.generatedReferenceCards : [];
  const normalizedReferences: NormalizedReference[] = referenceImages.map((image: any) => {
    const card = generatedReferenceCards.find((item: any) => (
      item?.referenceImageId === image?.id ||
      item?.id === image?.id ||
      item?.assetId === image?.assetId
    ));
    return {
      id: image?.id,
      assetId: image?.assetId,
      url: image?.url,
      title: card?.title,
      role: card?.role,
      campaignRole: card?.campaignRole,
      sourceTruthMatch: card?.sourceTruthMatch,
      selectedForVideo: card?.selectedForVideo,
      selected: image?.selected ?? card?.selected,
      provider: card?.provider,
      modelId: card?.modelId,
      generationClass: card?.generationClass,
    };
  });
  const selectedReferenceById = normalizedReferences.find((image): image is NormalizedReference & { url: string } => (
    image.id === outputObj.selectedReferenceImageId && hasReferenceUrl(image)
  ));
  const selectedReference = selectedReferenceById ?? normalizedReferences.find(hasReferenceUrl);
  const pipelineState = outputObj.pipelineState ?? data.pipelineState ?? data.currentStep ?? 'upload_preparation';

  return {
    jobId: data.id,
    status: data.status as JobTelemetry['status'],
    currentStep: data.currentStep as JobTelemetry['currentStep'],
    pipelineState: pipelineState as string,
    outputs: {
      startFrame: selectedReference
        ? { id: selectedReference.id, imageUrl: selectedReference.url }
        : undefined,
      brandCards: generatedReferenceCards
        .map((card: any) => ({
            id: card.id ?? card.refId ?? card.referenceImageId,
            refId: card.refId,
            promptToken: card.promptToken,
            title: card.title || 'Brand Asset',
            imageUrl: card.internalUrl || card.imageUrl,
            internalUrl: card.internalUrl,
            assetId: card.assetId,
            referenceImageId: card.referenceImageId,
            referenceId: card.referenceImageId,
            description: card.description,
            role: card.role,
            campaignRole: card.campaignRole,
            sourceTruthMatch: card.sourceTruthMatch,
            selectedForVideo: card.selectedForVideo,
            selected: card.selected,
            approved: card.approved,
            provider: card.provider,
            modelId: card.modelId,
            generationClass: card.generationClass,
          })),
      elementClusters: [{
        frontalUrl: selectedReference?.url,
        frontal: selectedReference,
        references: normalizedReferences,
      }],
      finalVideoUrl: outputObj.finalVideoUrl,
      finalVideoRatio: outputObj.finalVideoRatio,
    },
  };
}

export function useJobPolling(jobId?: string | null): JobTelemetry | null {
  const [job, setJob] = useState<JobTelemetry | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const activeJobId = jobId;
    let cancelled = false;
    let timer: number | undefined;
    const terminalStates = ['awaiting_user_approval', 'video_ready', 'completed', 'failed', 'cancelled'];

    const clearPendingTick = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    const scheduleNextTick = () => {
      clearPendingTick();
      timer = window.setTimeout(syncState, 2500);
    };

    async function syncState({ schedule = true } = {}) {
      try {
        const data = await api.getSmmAgentJob(activeJobId);

        if (!cancelled && data) {
          const mappedJob = mapSmmAgentJob(data);
          setJob(mappedJob);

          if (schedule && !terminalStates.includes(mappedJob.pipelineState)) {
            scheduleNextTick();
          }
        }
      } catch (error) {
        if (!cancelled && schedule) scheduleNextTick();
      }
    }

    const syncOnFocus = () => {
      void syncState({ schedule: true });
    };

    const syncOnVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncState({ schedule: true });
      }
    };

    void syncState({ schedule: true });
    window.addEventListener('focus', syncOnFocus);
    document.addEventListener('visibilitychange', syncOnVisibilityChange);

    return () => {
      cancelled = true;
      clearPendingTick();
      window.removeEventListener('focus', syncOnFocus);
      document.removeEventListener('visibilitychange', syncOnVisibilityChange);
    };
  }, [jobId]);

  return job;
}
