const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").trim();
const DEV_TOKEN_PATH = "/dev/token";
import type { TemplateMediaConfig } from './types';
import type { BrandCollectionBoard, ChatMessage, GeneratedReferenceCard, SourceAnalysisBoard } from '../features/guided-create/types';

type DevAuthState = "idle" | "active" | "failed";
type DevAuthStatus = { state: DevAuthState; message?: string };
type DevAuthListener = (status: DevAuthStatus) => void;

let devAuthStatus: DevAuthStatus = { state: "idle" };
const devAuthListeners = new Set<DevAuthListener>();
let devTokenPromise: Promise<string> | null = null;

type CreateAssetInput = {
  workspaceId: string;
  file: File;
  metadata?: Record<string, unknown>;
};

type CreatedAsset = {
  id: string;
  status: string;
  key: string;
  uploadUrl: string;
};

type CreateJobIntent = {
  workspaceId?: string;
  templateId?: string;
  templateSlug?: string;
  assetIds?: string[];
  assets?: Array<{ assetId: string; role: string }>;
  uploadSessionId?: string;
  trialGrantId?: string;
  lane?: "cheap" | "standard" | "premium";
  priorityClass?: "free" | "paid";
  input?: Record<string, unknown>;
};

type OpenRouterSmokeTestInput = {
  workspaceId: string;
  uploadSessionId: string;
  assetIds: string[];
  templateSlug: string;
  dryRun: false;
};

type CreateSmmAgentJobInput = {
  workspaceId: string;
  templateId?: string;
  templateSlug?: string;
  uploadSessionId: string;
  assetIds: string[];
  businessType?: string;
  contentGoal?: string;
  userContext?: Record<string, unknown>;
  dryRun?: boolean;
};

type CreativePlanningInput = {
  template_id: string;
  template_category: string;
  creative_mode: string;
  brand_name?: string;
  product_name?: string;
  business_type?: string;
  product_category?: string;
  target_customer?: string;
  brand_aesthetic?: string;
  brand_color_palette?: string[];
  customer_transformation?: string;
  scene_setting?: string;
  number_of_carousel_images?: number;
  output_language?: string;
  uploaded_assets?: Array<{
    asset_id: string;
    slot_id?: string;
    role?: string;
    image_url: string;
    analysis?: unknown;
  }>;
  detected_context?: unknown;
  user_notes?: string;
  dryRun?: boolean;
};

type CreativePlanningOutput = {
  template_id: string;
  template_category: string;
  creative_mode: string;
  brand_name: string;
  product_name: string;
  business_type: string;
  product_category: string;
  target_customer: string;
  brand_aesthetic: string;
  brand_color_palette: string[];
  customer_transformation: string;
  scene_setting: string;
  detected_brand_context: {
    positioning: string;
    brand_story: string;
    brand_values: string[];
    visual_world: string;
    mood: string;
    lighting_direction: string;
    composition_direction: string;
    customer_desire: string;
    commercial_angle: string;
  };
  asset_reference_map: Array<{
    asset_id: string;
    slot_id?: string;
    role?: string;
    how_to_use: string;
    must_preserve: string[];
  }>;
  generation_pack: {
    brand_board: {
      enabled: boolean;
      aspect_ratio: string;
      final_resolution_intent: string;
      prompt: string;
    };
    dtc_ecommerce_hero: {
      enabled: boolean;
      aspect_ratio: string;
      final_resolution_intent: string;
      prompt: string;
    };
    shopify_carousel: {
      enabled: boolean;
      aspect_ratio: string;
      final_resolution_intent: string;
      number_of_images: number;
      images: Array<{
        image_number: number;
        frame_type: string;
        goal: string;
        prompt: string;
      }>;
    };
    social_media_posts: {
      enabled: boolean;
      posts: Array<{
        post_number: number;
        format: string;
        goal: string;
        prompt: string;
      }>;
    };
    poster_ads: {
      enabled: boolean;
      posters: Array<{
        poster_number: number;
        format: string;
        goal: string;
        prompt: string;
      }>;
    };
  };
  negative_prompt: string;
  consistency_rules: string[];
  model_notes: {
    image_model: string;
    important: string;
  };
};

type VideoPromptPlanningInput = {
  job_id: string;
  template_id: string;
  template_category: string;
  creative_mode: string;
  brand_name?: string;
  product_name?: string;
  business_type?: string;
  product_category?: string;
  target_customer?: string;
  brand_aesthetic?: string;
  brand_color_palette?: string[];
  customer_transformation?: string;
  scene_setting?: string;
  output_language?: string;
  video_goal?: string;
  duration_seconds?: number;
  aspect_ratio?: string;
  original_uploaded_assets?: Array<{
    asset_id: string;
    slot_id?: string;
    role?: string;
    image_url: string;
    analysis?: unknown;
  }>;
  generated_images?: Array<{
    generated_image_id: string;
    image_url: string;
    source_type: string;
    source_prompt?: string;
    aspect_ratio?: string;
    role?: string;
    visual_description?: string;
    quality_score?: number;
  }>;
  previous_image_generation_pack?: unknown;
  detected_brand_context?: unknown;
  user_notes?: string;
  provider_preferences?: {
    primary_video_provider?: string;
    primary_video_model?: string;
    fallback_video_provider?: string;
    fallback_video_model?: string;
  };
  dryRun?: boolean;
};

type VideoPromptPlanningOutput = {
  job_id: string;
  template_id: string;
  template_category: string;
  creative_mode: string;
  brand_name: string;
  product_name: string;
  business_type: string;
  product_category: string;
  video_strategy: {
    primary_goal: string;
    commercial_angle: string;
    target_customer: string;
    customer_transformation: string;
    visual_style: string;
    motion_style: string;
    recommended_output_count: number;
  };
  reference_selection: {
    selected_generated_images: Array<{
      generated_image_id: string;
      source_type: string;
      video_role: string;
      why_selected: string;
      use_as: string;
      must_preserve: string[];
    }>;
    secondary_original_assets: Array<{
      asset_id: string;
      role: string;
      use_as: string;
      must_preserve: string[];
    }>;
    rejected_generated_images: Array<{
      generated_image_id: string;
      reason: string;
    }>;
  };
  video_generation_pack: {
    primary_video: {
      enabled: boolean;
      video_type: string;
      provider: string;
      model: string;
      aspect_ratio: string;
      duration_seconds: number;
      reference_images: Array<{
        ref_label: string;
        source: string;
        id: string;
        url: string;
        use: string;
      }>;
      prompt: string;
      negative_prompt: string;
      camera_motion: {
        movement: string;
        speed: string;
        framing: string;
        focus_behavior: string;
        transition_behavior: string;
      };
      subject_motion: {
        main_subject: string;
        allowed_motion: string;
        forbidden_motion: string;
      };
      preservation_rules: string[];
    };
    alternative_videos: VideoPromptPlanningOutput["video_generation_pack"]["primary_video"][];
    carousel_motion_set: {
      enabled: boolean;
      clip_count: number;
      clips: Array<{
        clip_number: number;
        source_generated_image_id: string;
        video_type: string;
        aspect_ratio: string;
        duration_seconds: number;
        prompt: string;
        negative_prompt: string;
        camera_motion: string;
        subject_motion: string;
        transition_to_next: string;
      }>;
    };
  };
  provider_routing: {
    primary: {
      provider: string;
      model: string;
      mode: string;
      use_webhook: boolean;
      requires_public_reference_urls: boolean;
    };
    fallback: {
      provider: string;
      model: string;
      mode: string;
      use_webhook: boolean;
      requires_public_reference_urls: boolean;
    };
    retry_policy: {
      max_attempts: number;
      fallback_after_failure: boolean;
      reuse_same_prompt_on_fallback: boolean;
      fallback_prompt_adjustment: string;
    };
  };
  global_negative_prompt: string;
  final_backend_execution_notes: {
    send_selected_reference_images_to_video_provider: boolean;
    use_generated_images_as_primary_references: boolean;
    use_original_assets_as_identity_references_only: boolean;
    do_not_send_brand_board_as_main_reference_unless_video_type_is_brand_board_reveal: boolean;
    validate_final_video_url_before_marking_job_completed: boolean;
  };
};

export type SmmAgentOutputs = {
  pipelineState?: 'preview_generating' | 'preview_ready' | 'awaiting_user_approval' | 'video_prompt_compiling' | 'video_generating' | 'video_ready';
  stageStates?: {
    preview?: 'preview_generating' | 'preview_ready';
    video?: 'video_prompt_compiling' | 'video_generating' | 'video_ready';
  };
  referenceImages?: Array<{
    id: string;
    assetId: string;
    url: string;
    style: string;
    selected: boolean;
  }>;
  selectedReferenceImageId?: string;
  selectedReferenceImageUrl?: string;
  generatedReferenceCards?: Array<GeneratedReferenceCard & {
    assetId: string;
    internalUrl: string;
    role: 'hook' | 'proof' | 'context' | 'conversion';
    approved: boolean;
  }>;
  sourceAnalysisBoard?: SourceAnalysisBoard | null;
  brandCollectionBoard?: BrandCollectionBoard | null;
  approvedReferenceSet?: {
    referenceImageIds: string[];
    approvedAt: string | null;
  };
  previewReady?: boolean;
  promptCount?: number;
  finalVideoUrl?: string;
  finalVideoRatio?: string;
  finalVideoAssetId?: string;
};

export type SmmAgentVideoAspectRatio = "1:1" | "9:16" | "16:9" | "4:5";

export type OpenRouterSmokeTestResponse = {
  ok: true;
  mode: "openrouter_mini_test";
  videoGeneration: "disabled";
  assetCount: 3;
  telemetry: {
    testId: string;
    model: string;
    workspaceId: string;
    uploadSessionId: string;
    templateSlug: string;
    assetIds: string[];
    textPartCount: number;
    imagePartCount: number;
    promptTextChars: number;
    estimatedImagePayloadBytes: number;
    durationMs: number;
    parseSuccess: boolean;
    outputShape: {
      assetAnalysisCount: number;
      storyboardPreviewFrameCount: number;
      videoGenerationAllowed: false;
      campaignPlatform: string;
      businessType: string;
    };
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      cached_tokens?: number;
      reasoning_tokens?: number;
      cost?: number;
    };
    safety: {
      videoGenerationDisabled: true;
      falCalled: false;
      smmPipelineJobCreated: false;
    };
  };
  result: {
    asset_analysis: Array<{
      assetId: string;
      detected_subject: string;
      quality_status: "accepted" | "needs_retake" | "weak";
      suggested_role: "hook" | "proof" | "context" | "conversion";
      visual_notes: string;
      risks: string[];
    }>;
    campaign_plan: {
      platform: "instagram_reels_tiktok";
      business_type: "restaurant_bar";
      hook: string;
      proof: string;
      context: string;
      conversion: string;
    };
    storyboard_preview_plan: Array<{
      frame: number;
      role: "hook" | "proof" | "context" | "conversion";
      sourceAssetIds: string[];
      shot_description: string;
      camera_motion: string;
      text_safe_zone: string;
    }>;
    video_generation_allowed: false;
    next_action: string;
  };
};

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly requestId?: string | null
  ) {
    super(message);
  }
}

function isDevelopmentRuntime() {
  if (import.meta.env.DEV && import.meta.env.MODE !== "production") return true;
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".trycloudflare.com") ||
    host.endsWith(".local") ||
    host.includes("192.168.") ||
    host.includes("10.0.")
  );
}

function setDevAuthStatus(next: DevAuthStatus) {
  devAuthStatus = next;
  for (const listener of devAuthListeners) {
    listener(next);
  }
}

export function getDevAuthStatus() {
  if (!isDevelopmentRuntime()) return { state: "idle" } as DevAuthStatus;
  return devAuthStatus;
}

export function subscribeDevAuthStatus(listener: DevAuthListener) {
  devAuthListeners.add(listener);
  listener(getDevAuthStatus());
  return () => {
    devAuthListeners.delete(listener);
  };
}

function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getAdminAccessKey() {
  const envKey = import.meta.env.VITE_ADMIN_KEY?.trim();
  if (envKey) return envKey;
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("adminAccessKey")?.trim() || undefined;
}

const BLOCKED_JOB_FIELDS = new Set([
  "provider",
  "model",
  "modelAlias",
  "prompt",
  "negativePrompt",
  "negative_prompt",
  "callback_url",
  "callbackUrl",
  "sourceUrl",
  "outputUrl",
  "providerJobId",
]);

function sanitizeCreateJobIntent(data: CreateJobIntent) {
  const allowed: CreateJobIntent = {
    workspaceId: data.workspaceId,
    templateId: data.templateId,
    templateSlug: data.templateSlug,
    assetIds: data.assetIds,
    assets: data.assets,
    uploadSessionId: data.uploadSessionId,
    trialGrantId: data.trialGrantId,
    lane: data.lane,
    priorityClass: data.priorityClass,
    input: sanitizeBusinessInput(data.input ?? {}),
  };
  return allowed;
}

function sanitizeBusinessInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !BLOCKED_JOB_FIELDS.has(key))
      .map(([key, entry]) => [key, sanitizeNestedInput(entry)])
  );
}

function sanitizeNestedInput(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeNestedInput);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !BLOCKED_JOB_FIELDS.has(key))
      .map(([key, entry]) => [key, sanitizeNestedInput(entry)])
  );
}

const CHAT_HISTORY_BLOCKED_PHRASES = [
  "Uploaded image",
  "PHOTOS ASSIGNED",
  "Generate Content",
  "OpenRouter Smoke Test",
] as const;

export function sanitizeChatHistoryForBackend(history: ChatMessage[]): ChatMessage[] {
  return history
    .filter((message) => !!message && message.text && message.text.trim().length > 0)
    .filter((message) => message.source === "user" || message.source === "backend_agent")
    .filter((message) => !CHAT_HISTORY_BLOCKED_PHRASES.some((phrase) => message.text.includes(phrase)))
    .map((message) => ({
      id: message.id,
      sender: message.sender,
      text: message.text,
      source: message.source,
    }))
    .slice(-8);
}

function isDevTokenPath(path: string) {
  return path === DEV_TOKEN_PATH || path.endsWith("/dev/token");
}

function persistDevIdentity(payload: { token: string; user?: { id?: string; workspaceId?: string | null } }) {
  localStorage.setItem("token", payload.token);
  if (payload.user?.id) localStorage.setItem("demoUser", payload.user.id);
  if (payload.user?.workspaceId) localStorage.setItem("workspaceId", payload.user.workspaceId);
}

async function ensureDevToken() {
  if (!isDevelopmentRuntime()) return "";

  const existing = localStorage.getItem("token");
  if (existing) {
    if (devAuthStatus.state !== "active") setDevAuthStatus({ state: "active", message: "Dev session active" });
    return existing;
  }

  if (devTokenPromise) return devTokenPromise;

  devTokenPromise = (async () => {
    try {
      const tokenEndpoints = [DEV_TOKEN_PATH, `${API_BASE}${DEV_TOKEN_PATH}`];

      for (const endpoint of tokenEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-request-id": createRequestId(),
            },
          });

          const contentType = response.headers.get("content-type") || "";
          const payload = contentType.includes("application/json")
            ? await response.json()
            : { error: { message: await response.text() } };

          if (response.ok && payload?.token) {
            persistDevIdentity(payload);
            setDevAuthStatus({ state: "active", message: "Dev session active" });
            return payload.token as string;
          }
        } catch (e) {
          console.warn(`Dev auth endpoint ${endpoint} unreachable`);
        }
      }

      const error = new Error("Dev auth failed - run seed or check NODE_ENV");
      setDevAuthStatus({ state: "failed", message: error.message });
      throw error;
    } catch (err) {
      console.error("Critical dev auth failure:", err);
      setDevAuthStatus({
        state: "failed",
        message: err instanceof Error ? err.message : "Dev auth failed - run seed or check NODE_ENV",
      });
      throw err;
    }
  })().finally(() => {
    devTokenPromise = null;
  });

  return devTokenPromise;
}

export async function ensureDevSession() {
  if (!isDevelopmentRuntime()) return;
  const token = localStorage.getItem("token");
  if (token) {
    if (devAuthStatus.state !== "active") setDevAuthStatus({ state: "active", message: "Dev session active" });
    return;
  }
  await ensureDevToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = localStorage.getItem("token");
  const adminKey = path.startsWith("/admin-api") ? getAdminAccessKey() : undefined;

  if (!token && !isDevTokenPath(path) && isDevelopmentRuntime()) {
    try {
      token = await ensureDevToken();
    } catch {
      // Keep request flow; protected routes will return explicit 401/409.
    }
  }

  const url = `${API_BASE}${path}`;
  const send = (jwtToken: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-request-id": createRequestId(),
        ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
        ...(adminKey ? { "x-admin-key": adminKey } : {}),
        ...(options.headers || {}),
      },
    });

  let res = await send(token);

  if (res.status === 401 && isDevelopmentRuntime() && !isDevTokenPath(path)) {
    localStorage.removeItem("token");
    try {
      token = await ensureDevToken();
      res = await send(token);
    } catch {
      setDevAuthStatus({ state: "failed", message: "Dev auth failed - run seed or check NODE_ENV" });
    }
  }

  if (!res.ok) {
    const requestId = res.headers.get("x-request-id");
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await res.json();
      throw new ApiError(error.error?.message || error.message || `API error ${res.status}`, res.status, requestId);
    }
    throw new ApiError(`API error ${res.status}: ${res.statusText}`, res.status, requestId);
  }

  if (isDevelopmentRuntime() && !isDevTokenPath(path) && token && devAuthStatus.state !== "active") {
    setDevAuthStatus({ state: "active", message: "Dev session active" });
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

async function requestWithRetry<T>(path: string, options: RequestInit = {}, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request<T>(path, options);
    } catch (error) {
      lastError = error;
      const status = error instanceof ApiError ? error.status : 0;
      const retryable = status === 0 || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}

type AdminAiSetting = {
  section: string;
  key: string;
  value: string | null;
  effectiveValue: string;
  source: "database" | "environment";
  isSecret: boolean;
  metadata: unknown;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizeAdminSection(section?: string | null) {
  return (section?.trim().toLowerCase() || "dashboard");
}

function isAdminSection(section: string | null | undefined, target: string) {
  const current = normalizeAdminSection(section);
  return current === "dashboard" || current === "all" || current === target;
}

function serializeAdminValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseAdminValue(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asAdminSettingRow(
  section: string,
  key: string,
  row: Record<string, unknown>
): AdminAiSetting {
  const serialized = serializeAdminValue(row);
  const source = (row.source as AdminAiSetting["source"]) ?? "database";
  return {
    section,
    key,
    value: serialized,
    effectiveValue: serialized,
    source: source === "environment" ? "environment" : "database",
    isSecret: Boolean(row.isSecret),
    metadata: row.metadata ?? {},
    createdByUserId: (row.createdByUserId as string | null) ?? null,
    updatedByUserId: (row.updatedByUserId as string | null) ?? null,
    createdAt: (row.createdAt as string | null) ?? null,
    updatedAt: (row.updatedAt as string | null) ?? null
  };
}

function pickString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function pickNumber(value: unknown): number | null {
  const candidate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(candidate) ? candidate : null;
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isLocalObjectStorageUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function shouldUseBackendUpload(url: string) {
  return isLocalObjectStorageUrl(url);
}

async function uploadFileThroughBackend(assetId: string, file: File) {
  let token = localStorage.getItem("token");
  if (!token && isDevelopmentRuntime()) token = await ensureDevToken();

  const response = await fetch(`${API_BASE}/assets/${assetId}/upload`, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      Accept: "application/json",
      "x-request-id": createRequestId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend upload failed ${response.status}`);
  }
}

let meCache: { value: any; expiresAt: number } | null = null;
let mePromise: Promise<any> | null = null;

async function getCurrentAccount() {
  const now = Date.now();
  if (meCache && meCache.expiresAt > now) return meCache.value;
  if (mePromise) return mePromise;

  mePromise = (async () => {
    try {
      const value = await request<any>("/me");
      meCache = { value, expiresAt: Date.now() + 10_000 };
      return value;
    } catch (err) {
      throw err;
    }
  })().finally(() => {
    mePromise = null;
  });

  return mePromise;
}

export const api = {
  clientConfig: () => request<{ config: { apiBaseUrl: string } }>("/client-config"),
  devToken: () => request<{ token: string; user: any }>("/dev/token"),
  features: () => request<{ features: Record<string, boolean> }>("/features"),
  me: getCurrentAccount,
  credits: () => request<any>("/me/credits"),
  myVideos: () => requestWithRetry<any>("/me/videos"),
  solutions: () => request<{ solutions: any[] }>("/solutions"),
  solution: (slug: string) => request<any>(`/solutions/${slug}`),
  templates: () => request<{ templates: any[] }>("/templates"),
  topUp: (amount: number) =>
    request<any>("/me/credits/top-up", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  // QR Menu
  qrMenus: async () => {
    const response = await request<any>("/qr-menus");
    if (Array.isArray(response)) return response;
    return response.menu ? [response.menu] : [];
  },
  qrMenu: async (id: string) => {
    const response = await request<any>("/qr-menus");
    const menu = response.menu ?? response;
    if (!menu || menu.id !== id) {
      throw new Error("QR menu not found");
    }
    return menu;
  },
  createQrMenu: (data: any) =>
    request<any>("/qr-menus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQrMenu: (id: string, data: any) =>
    request<any>(`/qr-menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  addQrMenuSection: (id: string, title: string) =>
    request<any>(`/qr-menus/${id}/sections`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  updateQrMenuSection: (sectionId: string, data: any) =>
    request<any>(`/qr-menus/sections/${sectionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteQrMenuSection: (sectionId: string) =>
    request<any>(`/qr-menus/sections/${sectionId}`, {
      method: "DELETE",
    }),
  addQrMenuItem: (sectionId: string, data: any) =>
    request<any>(`/qr-menus/sections/${sectionId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQrMenuItem: (itemId: string, data: any) =>
    request<any>(`/qr-menus/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteQrMenuItem: (itemId: string) =>
    request<any>(`/qr-menus/items/${itemId}`, {
      method: "DELETE",
    }),
  deleteQrMenu: (id: string) =>
    request<any>(`/qr-menus/${id}`, {
      method: "DELETE",
    }),
  publishQrMenu: (id: string) =>
    request<any>(`/qr-menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    }),
  unpublishQrMenu: (id: string) =>
    request<any>(`/qr-menus/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paused" }),
    }),
  publicMenu: (slug: string) => request<any>(`/public/menus/${slug}`),
  // Display Wall
  displayWalls: async () => {
    const response = await request<any>("/display-wall");
    if (Array.isArray(response)) return response;
    return response.wall ? [response.wall] : [];
  },
  displayWall: async (id: string) => {
    const response = await request<any>("/display-wall");
    const wall = response.wall ?? response;
    if (!wall || wall.id !== id) {
      throw new Error("Display wall not found");
    }
    return wall;
  },
  createDisplayWall: (data: any) =>
    request<any>("/display-wall", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDisplayWall: (id: string, data: any) =>
    request<any>(`/display-wall/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteDisplayWall: (id: string) =>
    request<any>(`/display-wall/${id}`, {
      method: "DELETE",
    }),
  publishDisplayWall: (id: string) =>
    request<any>(`/display-wall/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
    }),
  unpublishDisplayWall: (id: string) =>
    request<any>(`/display-wall/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paused" }),
    }),
  attachToWall: (id: string, outputId: string) =>
    request<any>("/display-wall/items", {
      method: "POST",
      body: JSON.stringify({ wallId: id, outputId }),
    }),
  removeFromWall: (_id: string, itemId: string) =>
    request<any>(`/display-wall/items/${itemId}`, {
      method: "DELETE",
    }),
  publicWall: (slug: string) => request<any>(`/public/display-walls/${slug}`),
  // Upload & Jobs
  createUploadSession: (data: any) =>
    request<any>("/uploads/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getUploadSession: (id: string) => request<any>(`/uploads/sessions/${id}`),
  updateUploadSession: (id: string, data: any) =>
    request<any>(`/uploads/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  createAsset: async (data: CreateAssetInput): Promise<CreatedAsset> => {
    const response = await request<{
      asset: { id: string; status: string; key: string };
      upload: { uploadUrl: string };
    }>("/assets/upload", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: data.workspaceId,
        mimeType: data.file.type,
        byteSize: data.file.size,
        metadata: {
          filename: data.file.name,
          ...(data.metadata || {}),
        },
      }),
    });
    return {
      id: response.asset.id,
      status: response.asset.status,
      key: response.asset.key,
      uploadUrl: response.upload.uploadUrl,
    };
  },
  uploadFile: async (url: string, file: File, assetId?: string) => {
    if (assetId && shouldUseBackendUpload(url)) {
      await uploadFileThroughBackend(assetId, file);
      return;
    }

    try {
      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!response.ok) {
        throw new Error(`Upload failed ${response.status}`);
      }
    } catch (error) {
      if (assetId && isLocalObjectStorageUrl(url)) {
        await uploadFileThroughBackend(assetId, file);
        return;
      }
      throw error;
    }
  },
  completeAsset: (id: string) =>
    request<any>(`/assets/${id}/complete`, {
      method: "POST",
    }),
  analyzeAsset: (id: string) =>
    requestWithRetry<any>(`/smm-agent/assets/${id}/analyze`, {
      method: "POST",
    }),
  updateAssetAnalysis: (id: string, analysis: any) =>
    request<any>(`/assets/${id}/analysis`, {
      method: "PATCH",
      body: JSON.stringify(analysis),
    }),
  addAssetToSession: (sessionId: string, assetId: string, slotId: string) =>
    request<any>(`/uploads/sessions/${sessionId}/assets`, {
      method: "POST",
      body: JSON.stringify({ assetId, slotId }),
    }),
  getRecommendations: (sessionId: string) =>
    requestWithRetry<any>(`/uploads/sessions/${sessionId}/recommendations`, {
      method: "POST",
    }),
  sessionChat: (sessionId: string, message: string, history: ChatMessage[]) =>
    request<{ response: string }>(`/uploads/sessions/${sessionId}/chat`, {
      method: "POST",
      body: JSON.stringify({
        message,
        history: sanitizeChatHistoryForBackend(history),
      }),
    }),
  getTemplateMediaConfig: (templateSlug: string) =>
    request<TemplateMediaConfig>(`/templates/${templateSlug}/media-config`, {
      method: "GET",
    }),
  createJob: (data: CreateJobIntent) =>
    request<any>("/jobs/create", {
      method: "POST",
      headers: { "Idempotency-Key": createIdempotencyKey() },
      body: JSON.stringify(sanitizeCreateJobIntent(data)),
    }),
  runOpenRouterSmokeTest: (data: OpenRouterSmokeTestInput) =>
    request<OpenRouterSmokeTestResponse>("/smm-agent/dev/openrouter-mini-test", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  creativePlanningGenerate: (data: CreativePlanningInput) =>
    request<CreativePlanningOutput>("/smm-agent/creative-planning/generate", {
      method: "POST",
      body: JSON.stringify({ ...data, dryRun: data.dryRun !== undefined ? data.dryRun : true }),
    }),
  videoPromptPlanningGenerate: (data: VideoPromptPlanningInput) =>
    request<VideoPromptPlanningOutput>("/smm-agent/video-prompt-planning/generate", {
      method: "POST",
      body: JSON.stringify({ ...data, dryRun: data.dryRun !== undefined ? data.dryRun : true }),
    }),
  createSmmAgentJob: (data: CreateSmmAgentJobInput) =>
    request<any>("/smm-agent/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  startSmmAgentPreview: (jobId: string) =>
    request<any>(`/smm-agent/jobs/${jobId}/start`, {
      method: "POST",
      body: JSON.stringify({ targetStage: "preview" }),
    }),
  getSmmAgentJob: (jobId: string) => request<any>(`/smm-agent/jobs/${jobId}`),
  getSmmAgentOutputs: (jobId: string) => request<SmmAgentOutputs>(`/smm-agent/jobs/${jobId}/outputs`),
  selectSmmAgentReferenceImage: (jobId: string, referenceImageId: string) =>
    request<SmmAgentOutputs>(`/smm-agent/jobs/${jobId}/select-reference-image`, {
      method: "POST",
      body: JSON.stringify({ referenceImageId }),
    }),
  approveSmmAgentPreviews: (jobId: string, approvedReferenceImageIds: string[]) =>
    request<SmmAgentOutputs>(`/smm-agent/jobs/${jobId}/approve-previews`, {
      method: "POST",
      body: JSON.stringify({ approvedReferenceImageIds }),
    }),
  startSmmAgentVideo: (jobId: string, approvedReferenceImageIds: string[], aspectRatio?: SmmAgentVideoAspectRatio) =>
    request<any>(`/smm-agent/jobs/${jobId}/start-video`, {
      method: "POST",
      body: JSON.stringify({
        approvedReferenceImageIds,
        ...(aspectRatio ? { aspectRatio } : {}),
      }),
    }),
  job: (id: string) => request<any>(`/jobs/${id}`),
  jobResult: (id: string) => request<any>(`/jobs/${id}/result`),
  checkoutSolution: (slug: string) =>
    request<any>(`/solutions/${slug}/checkout`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  // Admin
  adminAiSettings: async (params: { section?: string; includeSecrets?: boolean | string } = {}) => {
    const section = normalizeAdminSection(params.section);
    const [
      dashboardData,
      providersData,
      modelsData,
      routesData,
      promptsData,
      secretsData,
      callsData,
      usageData,
      costsData,
      usersData
    ] = await Promise.all([
      isAdminSection(section, "dashboard") || isAdminSection(section, "costs-tokens")
        ? request<any>("/admin-api/ai/dashboard")
        : Promise.resolve({}),
      isAdminSection(section, "providers")
        ? request<{ providers: Array<Record<string, unknown>> }>("/admin-api/ai/providers")
        : Promise.resolve({ providers: [] }),
      isAdminSection(section, "models")
        ? request<{ models: Array<Record<string, unknown>> }>("/admin-api/ai/models")
        : Promise.resolve({ models: [] }),
      isAdminSection(section, "routes")
        ? request<{ routes: Array<Record<string, unknown>> }>("/admin-api/ai/routes")
        : Promise.resolve({ routes: [] }),
      isAdminSection(section, "prompts")
        ? request<{ prompts: Array<Record<string, unknown>> }>("/admin-api/ai/prompts")
        : Promise.resolve({ prompts: [] }),
      isAdminSection(section, "api-keys-secrets")
        ? request<{ secrets: Array<Record<string, unknown>> }>("/admin-api/ai/secrets")
        : Promise.resolve({ secrets: [] }),
      isAdminSection(section, "logs-provider-calls")
        ? request<{ calls: Array<Record<string, unknown>> }>("/admin-api/ai/calls")
        : Promise.resolve({ calls: [] }),
      isAdminSection(section, "costs-tokens") || isAdminSection(section, "usage")
        ? request<any>("/admin-api/ai/usage")
        : Promise.resolve({ usage: [] }),
      isAdminSection(section, "costs-tokens")
        ? request<any>("/admin-api/ai/costs")
        : Promise.resolve({}),
      isAdminSection(section, "users")
        ? request<{ users: Array<Record<string, unknown>> }>("/admin-api/ai/users")
        : Promise.resolve({ users: [] }),
    ]);

    const settings: AdminAiSetting[] = [];
    const env = {
      VITE_API_BASE_URL: API_BASE,
      VITE_LOCAL_DEV_AUTH_BYPASS: import.meta.env.VITE_LOCAL_DEV_AUTH_BYPASS || ""
    };

    for (const provider of providersData.providers || []) {
      settings.push(
        asAdminSettingRow("providers", String(provider.key ?? provider.id), {
          ...provider,
          metadata: {
            key: provider.key,
            name: provider.name,
            kind: provider.kind,
            modelCount: provider.modelCount,
            routeCount: provider.routeCount
          }
        })
      );
    }

    for (const model of modelsData.models || []) {
      settings.push(
        asAdminSettingRow("models", String(model.id), {
          ...model,
          metadata: {
            providerKey: model.providerKey,
            providerName: model.providerName,
            capability: model.capability
          }
        })
      );
    }

    for (const route of routesData.routes || []) {
      const routeMetadata = {
        ...route,
        providerKey: String(route.providerKey ?? ""),
        modelKey: String(route.modelKey ?? ""),
      };
      const routeKey = pickString(route.routeKey, String(route.id ?? ""));
      const routeDisplay = `${routeMetadata.providerKey}/${routeMetadata.modelKey}`;
      settings.push({
        ...asAdminSettingRow("routes", routeKey, routeMetadata),
        value: routeDisplay,
        effectiveValue: routeDisplay
      });
    }

    for (const prompt of promptsData.prompts || []) {
      const promptMetadata = {
        ...prompt,
        promptKey: String(prompt.promptKey ?? ""),
        routeKey: String(prompt.routeKey ?? ""),
        status: String(prompt.status ?? "draft"),
        title: prompt.title ?? null,
        systemPrompt: prompt.systemPrompt ?? "",
        userTemplate: String(prompt.userTemplate ?? ""),
        version: Number(prompt.version ?? 1),
      };
      const promptKey = `${promptMetadata.promptKey || "prompt"}:${String(promptMetadata.version ?? "new")}`;
      const userTemplate = pickString(promptMetadata.userTemplate, "");
      settings.push({
        ...asAdminSettingRow("prompts", promptKey, promptMetadata),
        value: userTemplate,
        effectiveValue: userTemplate
      });
    }

    for (const secret of secretsData.secrets || []) {
      settings.push(
        asAdminSettingRow("api-keys-secrets", String(secret.id), {
          ...secret,
          metadata: {
            providerKey: secret.providerKey,
            providerName: secret.providerName,
            status: secret.status
          }
        })
      );
    }

    for (const call of callsData.calls || []) {
      const callKey = `${call.routeKey || ""}:${call.providerKey || ""}:${call.modelKey || ""}:${call.id || ""}`;
      settings.push(
        asAdminSettingRow("logs-provider-calls", callKey, {
          ...call,
          metadata: {
            routeKey: call.routeKey,
            providerKey: call.providerKey,
            modelKey: call.modelKey
          }
        })
      );
    }

    for (const user of usersData.users || []) {
      settings.push(
        asAdminSettingRow("users", String(user.id), {
          ...user,
          metadata: {
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt
          }
        })
      );
    }

    for (const usageItem of usageData.usage || []) {
      const usageKey = `${usageItem.routeKey || ""}:${usageItem.providerKey || ""}:${usageItem.modelKey || ""}`;
      settings.push(
        asAdminSettingRow("usage", usageKey, {
          ...usageItem,
          metadata: {
            routeKey: usageItem.routeKey,
            providerKey: usageItem.providerKey,
            modelKey: usageItem.modelKey
          }
        })
      );
    }

    for (const aiCost of costsData.aiCosts || []) {
      const costKey = `${aiCost.providerKey || ""}:${aiCost.modelKey || ""}:${aiCost.routeKey || ""}`;
      settings.push(
        asAdminSettingRow("costs-tokens", costKey, {
          ...aiCost,
          metadata: {
            providerKey: aiCost.providerKey,
            modelKey: aiCost.modelKey,
            routeKey: aiCost.routeKey
          }
        })
      );
    }

    if (costsData.legacyCosts) {
      for (const legacyCost of costsData.legacyCosts) {
        const legacyCostKey = `${legacyCost.provider || ""}:${legacyCost.type || ""}`;
        settings.push(
          asAdminSettingRow("costs-tokens", legacyCostKey, {
            ...legacyCost,
            metadata: {
              provider: legacyCost.provider,
              type: legacyCost.type
            }
          })
        );
      }
    }

    const relevant = section === "dashboard" ? settings : settings.filter((item) => item.section === section);

    return {
      env,
      settings: relevant
    };
  },
  adminAiUpsertSetting: (section: string, _key: string, payload: { value: string; isSecret?: boolean; metadata?: Record<string, unknown> }) => {
    const normalizedSection = normalizeAdminSection(section);
    const parsed = parseAdminValue(payload.value);
    const metadata = payload.metadata ?? {};

    if (normalizedSection === "providers") {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Provider payload must be JSON object");
      }
      const provider = parsed as Record<string, unknown>;
      return request("/admin-api/ai/providers", {
        method: "POST",
        body: JSON.stringify({
          key: typeof provider.key === "string" ? provider.key : String(provider.key ?? provider.id ?? ""),
          name: typeof provider.name === "string" ? provider.name : String(provider.key ?? ""),
          kind: typeof provider.kind === "string" ? provider.kind : "openai",
          baseUrl: typeof provider.baseUrl === "string" ? provider.baseUrl : null,
          enabled: provider.enabled === undefined ? true : Boolean(provider.enabled),
          priority: Number.isFinite(Number(provider.priority)) ? Number(provider.priority) : 100,
          settings: (provider.settings as Record<string, unknown>) ?? metadata
        }),
      });
    }

    if (normalizedSection === "models") {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Model payload must be JSON object");
      }
      const model = parsed as Record<string, unknown>;
      const providerKey = typeof model.providerKey === "string" ? model.providerKey : "";
      const modelKey = typeof model.modelKey === "string" ? model.modelKey : "";
      const capability = typeof model.capability === "string" ? model.capability : "image_generation";
      if (!providerKey || !modelKey) throw new Error("Model payload requires providerKey and modelKey");
      const body = {
        providerKey,
        modelKey,
        displayName: typeof model.displayName === "string" ? model.displayName : model.modelKey,
        capability,
        enabled: model.enabled === undefined ? true : Boolean(model.enabled),
        inputPriceUsd: model.inputPriceUsd ?? null,
        outputPriceUsd: model.outputPriceUsd ?? null,
        unitPriceUsd: model.unitPriceUsd ?? null,
        maxOutputTokens: Number.isFinite(Number(model.maxOutputTokens)) ? Number(model.maxOutputTokens) : null,
        defaultParams: model.defaultParams ?? metadata ?? {}
      };
      if (looksLikeUuid(_key)) {
        return request(`/admin-api/ai/models/${_key}`, {
          method: "PATCH",
          body: JSON.stringify({
            modelKey,
            capability,
            displayName: body.displayName,
            enabled: body.enabled,
            inputPriceUsd: body.inputPriceUsd,
            outputPriceUsd: body.outputPriceUsd,
            unitPriceUsd: body.unitPriceUsd,
            maxOutputTokens: body.maxOutputTokens,
            defaultParams: body.defaultParams
          }),
        });
      }
      return request("/admin-api/ai/models", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    if (normalizedSection === "routes") {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Route payload must be JSON object");
      }
      const route = parsed as Record<string, unknown>;
      const routeKey = typeof route.routeKey === "string" ? route.routeKey : String(route.title ?? "");
      const providerKey = typeof route.providerKey === "string" ? route.providerKey : "";
      const modelKey = typeof route.modelKey === "string" ? route.modelKey : "";
      const capability = typeof route.capability === "string" ? route.capability : "image_generation";
      if (!routeKey || !providerKey || !modelKey) throw new Error("Route payload requires routeKey, providerKey and modelKey");
      const body = {
        routeKey,
        title: typeof route.title === "string" ? route.title : routeKey,
        capability,
        providerKey,
        modelKey,
        fallbackRouteKey: typeof route.fallbackRouteKey === "string" ? route.fallbackRouteKey : null,
        enabled: route.enabled === undefined ? true : Boolean(route.enabled),
        timeoutMs: Number.isFinite(Number(route.timeoutMs)) ? Number(route.timeoutMs) : null,
        maxOutputTokens: Number.isFinite(Number(route.maxOutputTokens)) ? Number(route.maxOutputTokens) : null,
        params: route.params ?? route.meta ?? metadata ?? {},
      };
      return request(`/admin-api/ai/routes/${routeKey}`, {
        method: "PATCH",
        body: JSON.stringify({
          routeKey,
          title: body.title,
          capability,
          providerKey,
          modelKey,
          fallbackRouteKey: body.fallbackRouteKey,
          enabled: body.enabled,
          timeoutMs: body.timeoutMs,
          maxOutputTokens: body.maxOutputTokens,
          params: body.params
        }),
      }).catch(() =>
        request("/admin-api/ai/routes", {
          method: "POST",
          body: JSON.stringify(body),
        })
      );
    }

    if (normalizedSection === "prompts") {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Prompt payload must be JSON object");
      }
      const prompt = parsed as Record<string, unknown>;
      const promptKey = typeof prompt.promptKey === "string" ? prompt.promptKey : "prompt";
      const routeKey = typeof prompt.routeKey === "string" ? prompt.routeKey : "";
      const userTemplate = typeof prompt.userTemplate === "string" ? prompt.userTemplate : "";
      if (!routeKey || !userTemplate) throw new Error("Prompt payload requires routeKey and userTemplate");
      const version = Number.isFinite(Number(prompt.version)) ? Number(prompt.version) : undefined;
      const body = {
        promptKey,
        routeKey,
        version,
        status: prompt.status ?? "draft",
        title: typeof prompt.title === "string" ? prompt.title : null,
        systemPrompt: typeof prompt.systemPrompt === "string" ? prompt.systemPrompt : null,
        userTemplate,
        jsonSchema: (prompt.jsonSchema as Record<string, unknown>) ?? null,
        variables: (prompt.variables as unknown[]) ?? [],
        metadata,
      };
      if (looksLikeUuid(_key)) {
        return request(`/admin-api/ai/prompts/${_key}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      return request("/admin-api/ai/prompts", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    if (normalizedSection === "api-keys-secrets") {
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Secret payload must be JSON object");
      }
      const secret = parsed as Record<string, unknown>;
      const providerKey = typeof secret.providerKey === "string" ? secret.providerKey : "";
      const name = typeof secret.name === "string" ? secret.name : String(secret.label || "secret");
      const rawValue = typeof secret.rawValue === "string" ? secret.rawValue : "";
      if (!providerKey || !name || !rawValue) throw new Error("Secret payload requires providerKey, name and rawValue");
      return request("/admin-api/ai/secrets", {
        method: "POST",
        body: JSON.stringify({
          providerKey,
          name,
          rawValue,
          secretRef: typeof secret.secretRef === "string" ? secret.secretRef : null,
          status: secret.status ?? "active"
        }),
      });
    }

    throw new Error(`Unsupported admin section for upsert: ${normalizedSection}`);
  },
  adminAiUpdateRoute: (routeKey: string, payload: {
    routeKey?: string;
    title: string;
    capability: string;
    providerKey: string;
    modelKey: string;
    fallbackRouteKey?: string | null;
    enabled: boolean;
    timeoutMs?: number | null;
    maxOutputTokens?: number | null;
    params?: Record<string, unknown>;
  }) =>
    request(`/admin-api/ai/routes/${routeKey}`, {
      method: "PATCH",
      body: JSON.stringify({
        routeKey: payload.routeKey,
        title: payload.title,
        capability: payload.capability,
        providerKey: payload.providerKey,
        modelKey: payload.modelKey,
        fallbackRouteKey: payload.fallbackRouteKey ?? null,
        enabled: payload.enabled,
        timeoutMs: payload.timeoutMs ?? null,
        maxOutputTokens: payload.maxOutputTokens ?? null,
        params: payload.params ?? {}
      }),
    }),
  adminAiCreateRoute: (payload: {
    routeKey: string;
    title: string;
    capability: string;
    providerKey: string;
    modelKey: string;
    fallbackRouteKey?: string | null;
    enabled: boolean;
    timeoutMs?: number | null;
    maxOutputTokens?: number | null;
    params?: Record<string, unknown>;
  }) =>
    request("/admin-api/ai/routes", {
      method: "POST",
      body: JSON.stringify({
        routeKey: payload.routeKey,
        title: payload.title,
        capability: payload.capability,
        providerKey: payload.providerKey,
        modelKey: payload.modelKey,
        fallbackRouteKey: payload.fallbackRouteKey ?? null,
        enabled: payload.enabled,
        timeoutMs: payload.timeoutMs ?? null,
        maxOutputTokens: payload.maxOutputTokens ?? null,
        params: payload.params ?? {}
      }),
    }),
  adminAiTestRoute: (routeKey: string, payload: Record<string, unknown> = {}) =>
    request(`/admin-api/ai/routes/${routeKey}/test`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminAiUpdatePrompt: (promptId: string, payload: {
    promptKey: string;
    routeKey: string;
    version?: number;
    status?: "draft" | "active" | "archived";
    title?: string | null;
    systemPrompt?: string | null;
    userTemplate: string;
    jsonSchema?: Record<string, unknown> | null;
    variables?: unknown[];
    metadata?: Record<string, unknown>;
  }) =>
    request(`/admin-api/ai/prompts/${promptId}`, {
      method: "PATCH",
      body: JSON.stringify({
        promptKey: payload.promptKey,
        routeKey: payload.routeKey,
        version: payload.version ?? null,
        status: payload.status ?? "draft",
        title: payload.title,
        systemPrompt: payload.systemPrompt,
        userTemplate: payload.userTemplate,
        jsonSchema: payload.jsonSchema ?? null,
        variables: payload.variables ?? [],
        metadata: payload.metadata ?? {}
      }),
    }),
  adminAiCreatePrompt: (payload: {
    promptKey: string;
    routeKey: string;
    version?: number;
    status?: "draft" | "active" | "archived";
    title?: string | null;
    systemPrompt?: string | null;
    userTemplate: string;
    jsonSchema?: Record<string, unknown> | null;
    variables?: unknown[];
    metadata?: Record<string, unknown>;
  }) =>
    request("/admin-api/ai/prompts", {
      method: "POST",
      body: JSON.stringify({
        promptKey: payload.promptKey,
        routeKey: payload.routeKey,
        version: payload.version,
        status: payload.status ?? "draft",
        title: payload.title,
        systemPrompt: payload.systemPrompt,
        userTemplate: payload.userTemplate,
        jsonSchema: payload.jsonSchema ?? null,
        variables: payload.variables ?? [],
        metadata: payload.metadata ?? {}
      }),
    }),
  adminAiTestPrompt: (promptId: string, payload: Record<string, unknown> = {}) =>
    request(`/admin-api/ai/prompts/${promptId}/test`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminAiActivatePrompt: (promptId: string) =>
    request(`/admin-api/ai/prompts/${promptId}/activate`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  adminAiDeleteSetting: (section: string, key: string) => {
    const normalizedSection = normalizeAdminSection(section);
    if (normalizedSection === "prompts") {
      throw new Error("Prompt delete is not available in current API");
    }
    if (normalizedSection === "api-keys-secrets") {
      return request(`/admin-api/ai/secrets/${key}`, { method: "DELETE" });
    }
    throw new Error(`Unsupported admin section for delete: ${normalizedSection}`);
  },
  adminAiRoutes: () => request<{ routes: Array<Record<string, unknown>> }>("/admin-api/ai/routes"),
  adminAiProviders: () => request<{ providers: Array<Record<string, unknown>> }>("/admin-api/ai/providers"),
  adminAiModels: () => request<{ models: Array<Record<string, unknown>> }>("/admin-api/ai/models"),
  adminAiPrompts: () => request<{ prompts: Array<Record<string, unknown>> }>("/admin-api/ai/prompts"),
  adminAiCalls: (params: { routeKey?: string; providerKey?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.routeKey) query.set("routeKey", params.routeKey);
    if (params.providerKey) query.set("providerKey", params.providerKey);
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query}` : "";
    return request<{ calls: Array<Record<string, unknown>> }>(`/admin-api/ai/calls${suffix}`);
  },
  adminAiUsers: () => request<{ users: Array<Record<string, unknown>> }>("/admin-api/ai/users"),
  adminAiUsage: (params: { days?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.days !== undefined) query.set("days", String(params.days));
    const suffix = query.toString() ? `?${query}` : "";
    return request<any>(`/admin-api/ai/usage${suffix}`);
  },
  adminAiCosts: (params: { days?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.days !== undefined) query.set("days", String(params.days));
    const suffix = query.toString() ? `?${query}` : "";
    return request<any>(`/admin-api/ai/costs${suffix}`);
  },
  adminAiDashboard: () => request<any>("/admin-api/ai/dashboard"),
  adminTemplates: () => request<{ templates: any[] }>("/admin-api/templates"),
};
