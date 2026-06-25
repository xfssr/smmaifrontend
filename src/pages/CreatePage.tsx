import React, { useState, useEffect, useRef } from 'react';
import { api, ApiError, isAbsoluteHttpUrl, resolveMediaUrl, selectAssetPreviewUrl, type SmmAgentOutputs, type SmmAgentVideoAspectRatio } from '../lib/api';
import ConfirmedAssetStrip from '../components/ConfirmedAssetStrip';
import RecommendationPanel from '../components/RecommendationPanel';
import SelectedSolutionBanner from '../components/SelectedSolutionBanner';
import CreateFlowShell from '../components/CreateFlowShell';
import GenerateTimeline from '../components/GenerateTimeline';
import LegacyIcon from '../components/LegacyIcon';
import {
  Aperture,
  AlertCircle,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import {
  normalizeTemplateExperience,
  type ConfirmedShotAsset,
  type TemplateCatalogItem,
} from '../lib/templateExperience';
import type { ConfirmedSlotAsset, TemplateMediaConfig, TemplateMediaSlot } from '../lib/types';
import { CreateWorkflowPage } from '../features/guided-create/CreateWorkflowPage';
import type { BrandCollectionBoard, GeneratedReferenceCard, MediaSlotState, BrandState, CombinedContentDirection, SourceAnalysisBoard } from '../features/guided-create/types';
import { frontendBridge } from '../lib/frontendBridge';
import { invalidateAccountBalance } from '../hooks/useAccountBalance';

type FlowState = 'initializing' | 'idle' | 'uploading' | 'analyzing' | 'reviewing' | 'recommending' | 'creating_job' | 'error';

const defaultMediaConfig: TemplateMediaConfig = {
  templateSlug: 'default',
  displayName: 'AI Dynamic Pipeline',
  maxAssets: 5,
  mediaSlots: [
    { slotId: 'hero_1', role: 'hero', label: 'Hero photo', description: 'Main subject shot', required: true, cameraGuidance: [], min: 1, max: 1, acceptedObjects: [], avoid: [] },
    { slotId: 'detail_2', role: 'detail', label: 'Detail photo', description: 'Close-up texture or detail', required: false, cameraGuidance: [], min: 0, max: 1, acceptedObjects: [], avoid: [] },
    { slotId: 'logo_3', role: 'logo', label: 'Logo', description: 'Brand or signage', required: false, cameraGuidance: [], min: 0, max: 1, acceptedObjects: [], avoid: [] },
    { slotId: 'atmosphere_4', role: 'atmosphere', label: 'Atmosphere', description: 'Environment or mood', required: false, cameraGuidance: [], min: 0, max: 1, acceptedObjects: [], avoid: [] },
    { slotId: 'reference_5', role: 'reference', label: 'Reference', description: 'Style or framing reference', required: false, cameraGuidance: [], min: 0, max: 1, acceptedObjects: [], avoid: [] },
  ]
};

function getAssetPreviewUrl(asset: any): string | undefined {
  if (!asset) return undefined;
  // UI image priority: browserUrl > thumbnailUrl > server/blob previewUrl.
  // Never reconstruct the protected /api/assets/:id/view route for previews.
  return (
    resolveMediaUrl(asset.browserUrl) ||
    resolveMediaUrl(asset.thumbnailUrl) ||
    resolveMediaUrl(asset.previewUrl) ||
    resolveMediaUrl(asset.asset?.browserUrl) ||
    resolveMediaUrl(asset.asset?.thumbnailUrl)
  );
}

function assetFromSessionItem(item: any, _mediaSlots: TemplateMediaSlot[]): ConfirmedSlotAsset {
  const analysis = item.asset?.analysis;
  const browserUrl = resolveMediaUrl(item.asset?.browserUrl);
  const thumbnailUrl = resolveMediaUrl(item.asset?.thumbnailUrl);
  // Restore preview from backend-provided URLs only (browserUrl || thumbnailUrl ||
  // url). Do not reconstruct the protected /api/assets/:id/view route.
  const previewUrl = selectAssetPreviewUrl(item.asset);
  return {
    assetId: item.assetId,
    slotId: item.slotId!,
    previewUrl,
    browserUrl,
    thumbnailUrl,
    analysisTitle: analysis?.title || 'Confirmed asset',
    analysisDescription: analysis?.description || 'Confirmed asset',
  };
}

type UploadStage =
  | 'create_asset_failed'
  | 'upload_file_failed'
  | 'complete_asset_failed'
  | 'analyze_asset_failed'
  | 'attach_to_session_failed'
  | 'create_job_failed'
  | 'start_preview_failed';

class UploadStageError extends Error {
  constructor(
    message: string,
    public readonly stage: UploadStage,
    public readonly httpStatus?: number,
    public readonly path?: string,
  ) {
    super(message);
    this.name = 'UploadStageError';
  }
}

// Run a single upload-pipeline stage, surfacing the real failed stage with HTTP
// status and request path in console logs (and on the thrown error for the UI).
async function runUploadStage<T>(stage: UploadStage, path: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = err instanceof ApiError ? err.status : (typeof err?.status === 'number' ? err.status : undefined);
    const detail = err?.message || 'request failed';
    console.error('[upload] stage failed', { stage, status: status ?? 'n/a', path, detail }, err);
    const wrapped = new UploadStageError(detail, stage, status, path);
    (wrapped as any).nextPhotoSuggestion = err?.nextPhotoSuggestion;
    throw wrapped;
  }
}

export function getGuidedUploadPrerequisiteError(input: {
  sessionId?: string | null;
  workspaceId?: string | null;
  templateMediaConfig?: Partial<TemplateMediaConfig> | null;
}): string | undefined {
  const missing = [
    input.sessionId ? undefined : 'sessionId',
    input.workspaceId ? undefined : 'workspaceId',
    input.templateMediaConfig ? undefined : 'templateMediaConfig',
  ].filter(Boolean);

  if (missing.length === 0) return undefined;
  return `Upload session is not ready: missing ${missing.join(', ')}.`;
}

function getNextOpenSlot(mediaSlots: TemplateMediaSlot[], confirmedAssets: ConfirmedSlotAsset[]): TemplateMediaSlot | undefined {
  const confirmedSlotIds = new Set(confirmedAssets.map(a => a.slotId));

  // Find first required, unconfirmed slot
  const requiredUnconfirmed = mediaSlots.find(slot => slot.required && !confirmedSlotIds.has(slot.slotId));
  if (requiredUnconfirmed) return requiredUnconfirmed;

  // Find first optional, unconfirmed slot
  const optionalUnconfirmed = mediaSlots.find(slot => !slot.required && !confirmedSlotIds.has(slot.slotId));
  if (optionalUnconfirmed) return optionalUnconfirmed;

  // All slots filled, return the first one or undefined
  return undefined;
}

const CREATE_PERF_ENABLED = import.meta.env.DEV;

function createPerfMark(name: string) {
  if (!CREATE_PERF_ENABLED || typeof performance === 'undefined') return;
  performance.mark(name);
}

function createPerfMeasure(name: string, start: string, end: string) {
  if (!CREATE_PERF_ENABLED || typeof performance === 'undefined') return undefined;
  try {
    performance.measure(name, start, end);
    const entries = performance.getEntriesByName(name, 'measure');
    return entries[entries.length - 1]?.duration;
  } catch {
    return undefined;
  }
}

function logCreatePerfTable(rows: Array<{ step: string; ms?: number }>) {
  if (!CREATE_PERF_ENABLED) return;
  console.table(rows.map(row => ({
    step: row.step,
    ms: row.ms == null ? 'n/a' : Math.round(row.ms),
  })));
}

function resolveAutoSlotForAnalysis({
  analysis,
  templateMediaConfig,
  guidedSlots,
  confirmedAssets,
}: {
  analysis: any;
  templateMediaConfig?: any;
  guidedSlots: MediaSlotState[];
  confirmedAssets: any[];
}): string | undefined {
  // 1. If slotId was explicitly returned by analysis at top level or inside vision/raw
  const suggestedSlotId = analysis.slotId || analysis.vision?.slotId || (analysis.rawVisionJson || analysis.raw)?.slotId;
  if (suggestedSlotId) {
    const target = guidedSlots.find(s => s.id === suggestedSlotId);
    const isFilled = confirmedAssets.some(a => a.slotId === suggestedSlotId);
    if (target && !isFilled) {
      return target.id;
    }
  }

  // 2. Extract suggested role and detected subjects/details
  const assetRole = (
    analysis.role ||
    analysis.suggestedRole ||
    analysis.suggested_role ||
    analysis.vision?.suggestedRole ||
    analysis.vision?.role ||
    ""
  ).toLowerCase();

  const subjectsArray = analysis.vision?.detectedSubjects || analysis.detectedObjects || [];
  const subjectsStr = Array.isArray(subjectsArray) ? subjectsArray.join(" ") : String(subjectsArray);
  const titleAndDesc = `${analysis.title || analysis.vision?.title || ""} ${analysis.description || analysis.vision?.description || ""}`;
  const tags = `${assetRole} ${subjectsStr} ${titleAndDesc}`.toLowerCase();

  const isSlotOpen = (slotId: string) => !confirmedAssets.some(a => a.slotId === slotId);
  const openSlots = guidedSlots.filter(s => isSlotOpen(s.id));
  if (openSlots.length === 0) return undefined;

  const findOpenSlotByKey = (key: 'main' | 'close' | 'life' | 'brand' | 'story') => {
    return openSlots.find(slot => {
      const title = slot.title.toLowerCase();
      const id = slot.id.toLowerCase();
      if (key === 'main') return title.includes('main') || title.includes('hero') || id.includes('primary') || id.includes('main');
      if (key === 'close') return title.includes('close') || title.includes('detail') || id.includes('secondary') || id.includes('close') || id.includes('angle');
      if (key === 'life') return title.includes('life') || title.includes('venue') || title.includes('atmo') || id.includes('context') || id.includes('atmosphere') || id.includes('lifestyle');
      if (key === 'brand') return title.includes('brand') || title.includes('logo') || title.includes('menu') || id.includes('brand') || id.includes('logo') || id.includes('menu');
      if (key === 'story') return title.includes('story') || title.includes('bonus') || id.includes('story') || id.includes('bonus') || id.includes('extra') || id.includes('reference');
      return false;
    });
  };

  if (/dish[_-]?primary|drink[_-]?asset|hero|main|product[_-]?detail|portrait[_-]?subject|person|model/.test(tags)) {
    const s = findOpenSlotByKey('main');
    if (s) return s.id;
  }
  if (/dish[_-]?secondary|closeup|detail|texture|angle|outfit[_-]?detail|accessory/.test(tags)) {
    const s = findOpenSlotByKey('close');
    if (s) return s.id;
  }
  if (/venue|atmosphere|interior|exterior|location|background|lifestyle/.test(tags)) {
    const s = findOpenSlotByKey('life');
    if (s) return s.id;
  }
  if (/brand|logo|signage|menu/.test(tags)) {
    const s = findOpenSlotByKey('brand');
    if (s) return s.id;
  }
  if (/supporting|human[_-]?context|reference|pose|story|bonus/.test(tags)) {
    const s = findOpenSlotByKey('story');
    if (s) return s.id;
  }

  const requiredOpen = openSlots.find(s => s.required);
  if (requiredOpen) return requiredOpen.id;

  return openSlots[0].id;
}

const CreatePage: React.FC = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  if (CREATE_PERF_ENABLED) {
    console.debug('[CreatePage render]', renderCount.current);
  }

  const [state, setState] = useState<FlowState>('initializing');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAsset, setCurrentAsset] = useState<any>(null);
  const [confirmedAssets, setConfirmedAssets] = useState<ConfirmedSlotAsset[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [shootingCategory, setShootingCategory] = useState<string | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCatalogItem | null>(null);
  const [templateMediaConfig, setTemplateMediaConfig] = useState<TemplateMediaConfig | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('Demo workspace');

  const [guidedSlots, setGuidedSlots] = useState<MediaSlotState[]>([]);
  const [brand, setBrand] = useState<BrandState>({ mode: 'none' });
  const [direction, setDirection] = useState<CombinedContentDirection | undefined>();
  const [availableTemplates, setAvailableTemplates] = useState<TemplateCatalogItem[]>([]);
  const [smmAgentJobId, setSmmAgentJobId] = useState<string | null>(null);
  const [generatedReferenceCards, setGeneratedReferenceCards] = useState<GeneratedReferenceCard[]>([]);
  const [sourceAnalysisBoard, setSourceAnalysisBoard] = useState<SourceAnalysisBoard | null>(null);
  const [brandCollectionBoard, setBrandCollectionBoard] = useState<BrandCollectionBoard | null>(null);
  const [approvedReferenceImageIds, setApprovedReferenceImageIds] = useState<string[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const guidedSlotsRef = useRef<MediaSlotState[]>([]);
  const confirmedAssetsRef = useRef<ConfirmedSlotAsset[]>([]);
  const localBlobUrlsRef = useRef<Set<string>>(new Set());
  const initStartedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const applyPreviewCollectionBoards = (payload: any) => {
    const session = payload?.session ?? payload;
    if (!session || typeof session !== 'object') return;
    if ('sourceAnalysisBoard' in session) {
      setSourceAnalysisBoard(session.sourceAnalysisBoard ?? null);
    }
    if ('brandCollectionBoard' in session) {
      setBrandCollectionBoard(session.brandCollectionBoard ?? null);
    }
  };

  useEffect(() => {
    createPerfMark('create_mount_start');
    return () => {
      for (const url of localBlobUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      localBlobUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    guidedSlotsRef.current = guidedSlots;
  }, [guidedSlots]);

  useEffect(() => {
    confirmedAssetsRef.current = confirmedAssets;
  }, [confirmedAssets]);

  const allSlots = templateMediaConfig?.mediaSlots ?? [];
  const requiredSlots = allSlots.filter(slot => slot.required);
  const confirmedBySlotId = new Map(confirmedAssets.map(a => [a.slotId, a]));
  const completedSlotIds = new Set(confirmedAssets.map(a => a.slotId));
  const requiredComplete = requiredSlots.every(slot => completedSlotIds.has(slot.slotId));
  const activeSlot = allSlots.find(slot => !completedSlotIds.has(slot.slotId)) ?? null;
  const uploadCount = confirmedBySlotId.size;
  const maxAssets = templateMediaConfig?.maxAssets ?? allSlots.length;

  // Initialize guidedSlots from templateMediaConfig
  useEffect(() => {
    if (!templateMediaConfig) return;

    const slots: MediaSlotState[] = templateMediaConfig.mediaSlots.map((s, idx) => {
      // Check if we already have a confirmed asset for this slot
      const confirmed = confirmedAssets.find(a => a.slotId === s.slotId);

      return {
        id: s.slotId,
        type: (s.role as any) || 'dish_main',
        title: s.label,
        prompt: s.description || s.cameraGuidance?.[0] || `Upload a photo for ${s.label}`,
        required: s.required,
        status: confirmed ? 'complete' : 'locked',
        assetId: confirmed?.assetId,
        previewUrl: confirmed?.previewUrl,
        browserUrl: confirmed?.browserUrl,
        thumbnailUrl: confirmed?.thumbnailUrl,
        analysis: confirmed ? { shortSummary: confirmed.analysisTitle || 'Asset confirmed' } : undefined
      };
    });

    // Unlock the first incomplete slot
    const firstIncomplete = slots.find(s => s.status !== 'complete');
    if (firstIncomplete) {
      firstIncomplete.status = 'active';
    }

    setGuidedSlots(slots);
  }, [templateMediaConfig, confirmedAssets.length]); // Re-sync when config or assets count changes

  // Initialize session
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const init = async () => {
      try {
        const me = await api.me();
        setBusinessName(me.workspace?.name || me.user?.workspace?.name || 'Demo workspace');

        const hash = window.location.hash;
        const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const solSlug = params.get('solution');
        const templateSlug = params.get('template');
        const categorySlug = params.get('category');
        let initialCategory = categorySlug || null;
        let initialTemplate: any = null;

        let catalogRes = await api.templates();
        createPerfMark('templates_loaded');
        setAvailableTemplates(catalogRes.templates || []);

        if (solSlug) {
          const sol = await api.solution(solSlug);
          setSelectedSolution(sol.solution);
        }

        if (templateSlug) {
          initialTemplate = catalogRes.templates.find((template: any) => template.slug === templateSlug) || null;
          if (initialTemplate) {
            initialCategory = initialCategory || initialTemplate.categorySlug || initialTemplate.category?.slug || null;
          }
        }

        if (initialCategory) {
          setShootingCategory(initialCategory);
        }

        const returnedSession = params.get('sessionId') || params.get('session');
        const storedSession = returnedSession;
        if (storedSession) {
          sessionStorage.setItem('upload_session_id', storedSession);
          setSessionId(storedSession);
          const res: any = await api.getUploadSession(storedSession);
          applyPreviewCollectionBoards(res);
          createPerfMark('create_session_loaded');
          let activeTemplate = initialTemplate;

          if (!activeTemplate && res.session?.selectedTemplateSlug) {
            activeTemplate = catalogRes.templates.find((template: any) => template.slug === res.session.selectedTemplateSlug) || null;
          }
          if (!activeTemplate) {
            const storedTemplateSlug = res.session?.metadata?.selectedTemplateSlug || res.session?.selectedTemplate?.slug;
            if (storedTemplateSlug) {
              activeTemplate = catalogRes.templates.find((template: any) => template.slug === storedTemplateSlug) || null;
            }
          }

          let activeMediaConfig: TemplateMediaConfig;
          if (activeTemplate) {
            activeMediaConfig = await api.getTemplateMediaConfig(activeTemplate.slug);
            createPerfMark('media_config_loaded');
            setSelectedTemplate(activeTemplate);
          } else {
            activeMediaConfig = defaultMediaConfig;
            createPerfMark('media_config_loaded');
          }
          setTemplateMediaConfig(activeMediaConfig);

          const activeMediaSlots = activeMediaConfig.mediaSlots;
          if (res.session?.workspaceId) {
            setWorkspaceId(res.session.workspaceId);
          } else if (me.workspace?.id) {
            setWorkspaceId(me.workspace.id);
          }
          if (res.session?.assets) {
            const sessionAssets = res.session.assets.map((a: any) => assetFromSessionItem(a, activeMediaSlots));
            setConfirmedAssets(sessionAssets);
          }

          if (!initialCategory && res.session?.metadata?.shootingCategory) {
            setShootingCategory(res.session.metadata.shootingCategory);
            initialCategory = res.session.metadata.shootingCategory;
          }
          if (!initialCategory && res.session?.selectedCategory) {
            setShootingCategory(res.session.selectedCategory);
            initialCategory = res.session.selectedCategory;
          }

          await api.updateUploadSession(storedSession, {
            selectedTemplateId: activeTemplate?.id ?? res.session?.selectedTemplateId ?? null,
            selectedCategory: initialCategory ?? res.session?.selectedCategory ?? null,
            selectedTemplateSlug: activeTemplate?.slug ?? res.session?.selectedTemplateSlug ?? null,
          });

          setState('idle');
          logCreatePerfTable([
            { step: 'templates', ms: createPerfMeasure('create_templates_ms', 'create_mount_start', 'templates_loaded') },
            { step: 'session', ms: createPerfMeasure('create_session_ms', 'templates_loaded', 'create_session_loaded') },
            { step: 'media config', ms: createPerfMeasure('create_media_config_ms', 'create_session_loaded', 'media_config_loaded') },
          ]);
          return;
        }

        const activeWorkspaceId = me.workspace.id;
        setWorkspaceId(activeWorkspaceId);

        const session = await api.createUploadSession({
          workspaceId: activeWorkspaceId
        });
        const sid = session.session.id;
        setSessionId(sid);
        sessionStorage.setItem('upload_session_id', sid);
        createPerfMark('create_session_loaded');

        let activeMediaConfig: TemplateMediaConfig;
        if (initialTemplate) {
          activeMediaConfig = await api.getTemplateMediaConfig(initialTemplate.slug);
          createPerfMark('media_config_loaded');
          setSelectedTemplate(initialTemplate);
        } else {
          activeMediaConfig = defaultMediaConfig;
          createPerfMark('media_config_loaded');
        }
        setTemplateMediaConfig(activeMediaConfig);

        await api.updateUploadSession(sid, {
          selectedTemplateId: initialTemplate?.id ?? null,
          selectedCategory: initialCategory,
          selectedTemplateSlug: initialTemplate?.slug ?? null,
        });

        setState('idle');
        logCreatePerfTable([
          { step: 'templates', ms: createPerfMeasure('create_templates_ms', 'create_mount_start', 'templates_loaded') },
          { step: 'session', ms: createPerfMeasure('create_session_ms', 'templates_loaded', 'create_session_loaded') },
          { step: 'media config', ms: createPerfMeasure('create_media_config_ms', 'create_session_loaded', 'media_config_loaded') },
        ]);
      } catch (err) {
        console.error(err);
        setError('NEURAL LINK INITIALIZATION FAILED');
        setState('error');
      }
    };
    init();
  }, []);

  // Handle frontendBridge auto-upload
  useEffect(() => {
    if (state === 'idle' && sessionId && frontendBridge.pendingUploadFile) {
      const file = frontendBridge.pendingUploadFile;
      frontendBridge.pendingUploadFile = null;
      if (activeSlot || guidedSlots.length > 0) {
        handleGuidedUpload(undefined, file);
      }
    }
  }, [state, sessionId, guidedSlots, activeSlot]);

  // Sync direction when required slots are complete
  useEffect(() => {
    if (!templateMediaConfig || guidedSlots.length === 0) return;

    if (requiredComplete) {
      const dir: CombinedContentDirection = {
        heroSubject: guidedSlots[0].analysis?.shortSummary,
        suggestedStyle: selectedTemplate?.name || 'Cinematic UGC',
        shotSequence: guidedSlots.filter(s => s.status === 'complete').map(s => `Include ${s.analysis?.shortSummary || s.title}`),
      };
      setDirection(dir);
    } else {
      setDirection(undefined);
    }
  }, [guidedSlots, requiredComplete, selectedTemplate, templateMediaConfig]);

  const handleConfirmSlot = (
    slotId: string,
    assetId: string,
    previewUrl: string,
    title: string,
    description: string
  ) => {
    // previewUrl passed here is the final public preview URL (browserUrl/thumbnailUrl)
    // for confirmed assets, or a blob URL only while upload is still in progress.
    const isPublicPreview = isAbsoluteHttpUrl(previewUrl || '');
    setConfirmedAssets(prev => {
      const filtered = prev.filter(a => a.slotId !== slotId);
      const updated = [...filtered, {
        assetId,
        slotId,
        previewUrl,
        browserUrl: isPublicPreview ? previewUrl : undefined,
        analysisTitle: title,
        analysisDescription: description,
      }];
      confirmedAssetsRef.current = updated;
      return updated;
    });
  };

  const handleGuidedUpload = async (slotId: string | undefined, file: File) => {
    const prerequisiteError = getGuidedUploadPrerequisiteError({ sessionId, workspaceId, templateMediaConfig });
    if (prerequisiteError || !sessionId || !workspaceId || !templateMediaConfig) {
      const message = prerequisiteError || 'Upload session is not ready.';
      console.error('Guided upload blocked:', {
        missingSessionId: !sessionId,
        missingWorkspaceId: !workspaceId,
        missingTemplateMediaConfig: !templateMediaConfig,
      });
      return {
        slotId: slotId || 'error',
        status: 'error' as const,
        message,
        nextPhotoSuggestion: 'Wait for the upload session to finish loading, then try again.',
        analysisTitle: 'Upload not ready',
        analysisDescription: message,
      };
    }

    createPerfMark('upload_start');
    const previewUrl = URL.createObjectURL(file);
    localBlobUrlsRef.current.add(previewUrl);

    try {
      const asset = await runUploadStage('create_asset_failed', '/assets/upload', () =>
        api.createAsset({
          workspaceId,
          file,
          metadata: {
            source: 'guided_upload',
            templateId: selectedTemplate?.id,
            templateSlug: selectedTemplate?.slug || templateMediaConfig.templateSlug,
            uploadSessionId: sessionId,
            ...(slotId ? { slotId } : {}),
          },
        }),
      );
      createPerfMark('asset_created');

      await runUploadStage('upload_file_failed', `/assets/${asset.id}/upload`, () =>
        api.uploadFile(asset.uploadUrl, file, asset.id),
      );
      createPerfMark('file_uploaded');

      const completed = await runUploadStage('complete_asset_failed', `/assets/${asset.id}/complete`, () =>
        api.completeAsset(asset.id),
      );
      createPerfMark('asset_completed');

      // Public, browser-safe preview URL for the uploaded asset. Prefer the
      // canonical fields returned by /complete, then fall back to /upload.
      const publicPreviewUrl =
        resolveMediaUrl(completed.browserUrl) ||
        resolveMediaUrl(completed.thumbnailUrl) ||
        resolveMediaUrl(asset.browserUrl) ||
        resolveMediaUrl(asset.thumbnailUrl);

      if (!publicPreviewUrl) {
        throw new Error('Backend did not return browserUrl/thumbnailUrl for uploaded asset.');
      }

      createPerfMark('analysis_start');
      const res = await runUploadStage('analyze_asset_failed', `/smm-agent/assets/${asset.id}/analyze`, () =>
        api.analyzeAsset(asset.id),
      );
      applyPreviewCollectionBoards(res);
      createPerfMark('analysis_completed');
      const analysis = res.analysis;

      if (!analysis) {
        throw new Error("AI analysis did not return any results");
      }

      if (analysis.status === 'accepted') {
        const resolvedSlotId = slotId || resolveAutoSlotForAnalysis({
          analysis,
          templateMediaConfig,
          guidedSlots: guidedSlotsRef.current,
          confirmedAssets: confirmedAssetsRef.current,
        });

        if (!resolvedSlotId) {
          return {
            slotId: 'unassigned',
            assetId: asset.id,
            previewUrl: publicPreviewUrl,
            analysisTitle: analysis?.title || 'Unassigned Photo',
            analysisDescription: analysis?.description || '',
            status: 'unassigned' as const,
          };
        }

        await api.updateAssetAnalysis(asset.id, { confirmed: true });
        createPerfMark('asset_confirmed');

        const sessionResponse = await runUploadStage('attach_to_session_failed', `/uploads/sessions/${sessionId}/assets`, () =>
          api.addAssetToSession(sessionId, asset.id, resolvedSlotId),
        );
        applyPreviewCollectionBoards(sessionResponse);
        createPerfMark('asset_attached_to_session');

        // Prefer a backend-confirmed public URL from the session asset if present,
        // otherwise use the public URL captured after complete. Never the blob.
        const sessionAsset = Array.isArray(sessionResponse?.session?.assets)
          ? sessionResponse.session.assets.find((a: any) => a.assetId === asset.id)
          : undefined;
        const finalPreviewUrl =
          resolveMediaUrl(sessionAsset?.asset?.browserUrl) ||
          resolveMediaUrl(sessionAsset?.asset?.thumbnailUrl) ||
          publicPreviewUrl;

        handleConfirmSlot(resolvedSlotId, asset.id, finalPreviewUrl, analysis?.title || 'Confirmed Asset', analysis?.description || '');

        createPerfMark('ui_slot_updated');
        return {
          slotId: resolvedSlotId,
          assetId: asset.id,
          previewUrl: finalPreviewUrl,
          analysisTitle: analysis?.title || 'Confirmed Asset',
          analysisDescription: analysis?.description || '',
          nextPhotoSuggestion: analysis?.vision?.nextPhotoSuggestion || analysis?.nextPhotoSuggestion || undefined,
          status: 'accepted' as const,
        };
      }

      if (analysis.status === 'needs_retake') {
        const suggestion = analysis?.vision?.nextPhotoSuggestion || analysis?.nextPhotoSuggestion;
        const reason = analysis.userMessage || 'Image quality check requires a clearer photo.';
        return {
          slotId: slotId || 'error',
          status: 'needs_retake' as const,
          message: suggestion ? `${reason} ${suggestion}` : reason,
          nextPhotoSuggestion: suggestion,
          analysisTitle: analysis?.title || 'Uploaded photo',
          analysisDescription: analysis?.description || '',
        };
      }

      const suggestion = analysis?.vision?.nextPhotoSuggestion || analysis?.nextPhotoSuggestion;
      const rejectionMessage = analysis.userMessage || `Image was not accepted (AI status: ${analysis.status})`;
      throw new Error(suggestion ? `${rejectionMessage} ${suggestion}` : rejectionMessage);

    } catch (err: any) {
      const stage = err instanceof UploadStageError ? err.stage : undefined;
      const status = err instanceof UploadStageError ? err.httpStatus : undefined;
      const path = err instanceof UploadStageError ? err.path : undefined;
      const baseMessage = err?.message || 'Upload failed';
      const message = stage
        ? `${stage}${status ? ` (${status})` : ''}${path ? ` ${path}` : ''}: ${baseMessage}`
        : baseMessage;
      console.error('Guided upload failed:', { stage, status, path, message }, err);
      return {
        slotId: slotId || 'error',
        status: 'error' as const,
        message,
        nextPhotoSuggestion: (err as any).nextPhotoSuggestion || 'Try a clearer photo for the required slot.',
        analysisTitle: 'Upload failed',
        analysisDescription: message,
      };
    }
  };

  const handleReplace = (slotId: string) => {
    setConfirmedAssets(prev => prev.filter(a => a.slotId !== slotId));
    setDirection(undefined);
  };


  const handleBrandChange = (newBrand: BrandState) => {
    setBrand(newBrand);
    if (newBrand.mode === 'text' && newBrand.businessName) {
      setBusinessName(newBrand.businessName);
    }
  };


  const updateSessionMetadata = async (metadata: any) => {
    if (!sessionId) return;
    try {
      await api.updateUploadSession(sessionId, { metadata });
    } catch (err) {
      console.warn('Failed to sync metadata to edge', err);
    }
  };

  const waitForSmmAgentOutputs = async (
    jobId: string,
    predicate: (outputs: SmmAgentOutputs) => boolean,
    timeoutMs = 45_000
  ): Promise<SmmAgentOutputs> => {
    const startedAt = Date.now();
    let lastError: unknown;
    const isOutputsPending = (err: any) => {
      const message = typeof err?.message === 'string' ? err.message : '';
      return err?.status === 400 && /outputs are not ready|not ready yet|not_completed/i.test(message);
    };

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const job = await api.getSmmAgentJob(jobId);
        if (job.status === "failed") {
          const rawErr = job.errorJson || job.error_json;
          const errMsg = rawErr?.message || rawErr?.error?.message || (typeof rawErr === 'string' ? rawErr : null) || "Job execution failed";
          throw new Error(`Analysis failed: ${errMsg}`);
        }
        if (job.status === "cancelled") {
          throw new Error("Analysis job was cancelled.");
        }

        const outputs = await api.getSmmAgentOutputs(jobId);
        if (predicate(outputs)) return outputs;
      } catch (err: any) {
        if (err instanceof Error && (err.message.startsWith("Analysis failed") || err.message.startsWith("Analysis job"))) {
          throw err;
        }
        if (!isOutputsPending(err)) {
          lastError = err;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 900));
    }

    if (lastError instanceof Error) throw lastError;
    throw new Error('SMM Agent output timed out.');
  };

  const applySmmAgentOutputs = (outputs: SmmAgentOutputs) => {
    setGeneratedReferenceCards(outputs.generatedReferenceCards || []);
    setApprovedReferenceImageIds(outputs.approvedReferenceSet?.referenceImageIds || []);
    setFinalVideoUrl(outputs.finalVideoUrl || null);
    applyPreviewCollectionBoards(outputs);
  };

  const handleCreateJob = async (templateId: string) => {
    const completeSlots = confirmedAssets.length;
    if (!sessionId || !workspaceId || !requiredComplete || completeSlots === 0 || !selectedTemplate) return;

    try {
      setIsSaving(true);

      let logoAssetId = null;
      if (brand.mode === 'logo' && brand.logoFile) {
        const logoAsset = await api.createAsset({
          workspaceId,
          file: brand.logoFile,
          metadata: { type: 'logo' }
        });
        await api.uploadFile(logoAsset.uploadUrl, brand.logoFile, logoAsset.id);
        await api.completeAsset(logoAsset.id);
        logoAssetId = logoAsset.id;
      }

      setGeneratedReferenceCards([]);
      setApprovedReferenceImageIds([]);
      setFinalVideoUrl(null);

      const created = await runUploadStage('create_job_failed', '/smm-agent/jobs', () =>
        api.createSmmAgentJob({
          workspaceId,
          uploadSessionId: sessionId,
          templateId: selectedTemplate.id,
          templateSlug: selectedTemplate.slug,
          assetIds: confirmedAssets.map(asset => asset.assetId),
          businessType: businessName,
          contentGoal: selectedSolution?.name || selectedTemplate?.name || shootingCategory || 'AI content video',
          userContext: {
            businessName: brand.businessName || businessName,
            offer: selectedSolution?.name || selectedTemplate?.name || shootingCategory || 'AI content video',
            brandMode: brand.mode,
            brandLogoAssetId: logoAssetId,
            brandText: brand.businessName
          },
        }),
      );
      const jobId = created.jobId;
      setSmmAgentJobId(jobId);
      await runUploadStage('start_preview_failed', `/smm-agent/jobs/${jobId}/start`, () =>
        api.startSmmAgentPreview(jobId),
      );
      const outputs = await waitForSmmAgentOutputs(
        jobId,
        next => Boolean(next.generatedReferenceCards?.length),
        900_000
      );
      applySmmAgentOutputs(outputs);
      invalidateAccountBalance();
      setIsSaving(false);
    } catch (err: any) {
      const stage = err instanceof UploadStageError ? err.stage : undefined;
      const status = err instanceof UploadStageError ? err.httpStatus : undefined;
      const path = err instanceof UploadStageError ? err.path : undefined;
      const baseMessage = err?.message || 'Failed to start generation. Please check your assets and try again.';
      const message = stage
        ? `${stage}${status ? ` (${status})` : ''}${path ? ` ${path}` : ''}: ${baseMessage}`
        : baseMessage;
      console.error("Job creation failed:", { stage, status, path, message }, err);
      setError(message);
      setState('recommending');
      setIsSaving(false);
    }
  };

  const handleApproveReference = async (referenceImageId: string) => {
    if (!smmAgentJobId) return;
    try {
      const outputs = await api.selectSmmAgentReferenceImage(smmAgentJobId, referenceImageId);
      applySmmAgentOutputs(outputs);
    } catch (err) {
      console.error('Failed to approve reference image', err);
    }
  };

  const handleStartFinalVideo = async (selectedReferenceImageIds: string[], aspectRatio: SmmAgentVideoAspectRatio) => {
    if (!smmAgentJobId || selectedReferenceImageIds.length === 0) return;
    try {
      setIsSaving(true);
      await api.approveSmmAgentPreviews(smmAgentJobId, selectedReferenceImageIds);
      await api.startSmmAgentVideo(smmAgentJobId, selectedReferenceImageIds, aspectRatio);
      const outputs = await waitForSmmAgentOutputs(
        smmAgentJobId,
        next => Boolean(next.finalVideoUrl),
        90_000
      );
      applySmmAgentOutputs(outputs);
      invalidateAccountBalance();
      setIsSaving(false);
    } catch (err: any) {
      console.error("Final video generation failed:", err);
      setError(err.message || 'Failed to generate final video.');
      setIsSaving(false);
    }
  };

  const runOpenRouterSmokeTest = async (assetIds: string[]) => {
    if (!workspaceId || !sessionId) {
      throw new Error('Upload session is not ready.');
    }
    return api.runOpenRouterSmokeTest({
      workspaceId,
      uploadSessionId: sessionId,
      assetIds: assetIds.slice(0, 3),
      templateSlug: selectedTemplate?.slug || templateMediaConfig?.templateSlug || displayTemplate.slug,
      dryRun: false,
    });
  };

  const handleTemplateChange = async (template: TemplateCatalogItem) => {
    if (!sessionId) return;
    try {
      setSelectedTemplate(template);
      const mediaConfig = await api.getTemplateMediaConfig(template.slug);
      setTemplateMediaConfig(mediaConfig);
      await api.updateUploadSession(sessionId, {
        selectedTemplateId: template.id,
        selectedTemplateSlug: template.slug,
      });
    } catch (err) {
      console.error('Failed to change template', err);
    }
  };

  const generationStage = isSaving
    ? 'processing'
    : state === 'creating_job'
      ? 'assembling'
      : state === 'recommending'
        ? 'idle'
        : 'idle';

  const displayTemplate = selectedTemplate || ({
    id: 'default-ai',
    name: 'AI Dynamic Pipeline',
    slug: 'default',
    categorySlug: shootingCategory || 'dynamic',
    duration: 10,
    aspectRatio: '9:16',
    previewImageUrl: undefined
  } as unknown as TemplateCatalogItem);

  return (
    <div className="h-full min-h-0 w-full animate-in fade-in duration-700">

      <CreateFlowShell template={displayTemplate}>
        <div className="h-full min-h-0">
          {state === 'idle' && (
            <CreateWorkflowPage
              template={displayTemplate}
              availableTemplates={availableTemplates}
              slots={guidedSlots}
              brand={brand}
              direction={direction}
              onUpload={handleGuidedUpload}
              onReplace={handleReplace}
              onConfirmSlot={handleConfirmSlot}
              onBrandChange={handleBrandChange}
              onCreateJob={() => handleCreateJob(displayTemplate.id)}
              onApproveReference={handleApproveReference}
              onStartFinalVideo={handleStartFinalVideo}
              onChangeTemplate={handleTemplateChange}
              onRunOpenRouterSmokeTest={runOpenRouterSmokeTest}
              uploadSessionId={sessionId}
              smmAgentJobId={smmAgentJobId}
              workspaceId={workspaceId}
              businessName={businessName}
              maxAssets={maxAssets}
              generatedReferenceCards={generatedReferenceCards}
              sourceAnalysisBoard={sourceAnalysisBoard}
              brandCollectionBoard={brandCollectionBoard}
              onPreviewCollectionChange={({ sourceAnalysisBoard, brandCollectionBoard }) => {
                setSourceAnalysisBoard(sourceAnalysisBoard ?? null);
                setBrandCollectionBoard(brandCollectionBoard ?? null);
              }}
              approvedReferenceImageIds={approvedReferenceImageIds}
              finalVideoUrl={finalVideoUrl}
              isSaving={isSaving}
              isGenerating={isSaving}
            />
          )}

          {state === 'initializing' && (
            <div className="p-16 md:p-24 glass-card flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-orange/10 border-t-orange animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-orange">
                  <LegacyIcon name="magic" size={38} />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase tracking-tight">Template Ingest</h2>
                <p className="text-muted text-xs max-w-sm mx-auto font-bold uppercase tracking-tight leading-relaxed opacity-60">
                  Syncing media protocols with secure backend.
                </p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="p-12 glass-card border-red/20 text-center space-y-8 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-[32px] bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
                <AlertCircle size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase tracking-tight">Signal Interrupted</h2>
                <p className="text-muted text-sm font-bold uppercase tracking-tight max-w-sm mx-auto">{error || 'NEURAL HANDSHAKE FAILED'}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-orange px-12 h-14 text-xs font-black tracking-widest uppercase"
              >
                Restart Session
              </button>
            </div>
          )}
        </div>
      </CreateFlowShell>

    </div>
  );
};

export default CreatePage;
