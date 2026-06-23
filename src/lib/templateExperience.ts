export type ShotRole =
  | "hero"
  | "closeup"
  | "detail"
  | "wide"
  | "motion"
  | "people"
  | "venue"
  | string;

export type TemplateShotRequirement = {
  role: ShotRole;
  assetRole: string;
  label: string;
  required: boolean;
  exampleHint: string;
  guidance: string[];
};

export type TemplateExperience = {
  previewVideo?: string | null;
  previewImage?: string | null;
  styleTags: string[];
  difficulty?: string | null;
  estimatedDuration?: string | null;
  requiredShots: TemplateShotRequirement[];
  captureGuidance: string[];
  featureBullets: string[];
  publicPricingLabel?: string | null;
};

export type TemplateCatalogItem = {
  id: string;
  slug: string;
  name: string;
  categorySlug?: string | null;
  categoryName?: string | null;
  previewImageUrl?: string | null;
  previewVideoUrl?: string | null;
  publicDescription?: string | null;
  requiredAssetMin?: number;
  requiredAssetMax?: number;
  outputAspectRatio?: string | null;
  outputDurationSec?: number;
  // Legacy fields
  title?: string;
  description?: string | null;
  metadata?: Partial<TemplateExperience> | null;
  version?: {
    inputSchema?: {
      requiredAssetCount?: number;
    };
    outputFormat?: {
      durationSeconds?: number;
      aspectRatio?: string | null;
    };
  } | null;
};

export type ConfirmedShotAsset = {
  id: string;
  previewUrl: string;
  description: string;
  order: number;
  shotRole: string;
  assetRole: string;
  shotLabel: string;
  qualityScore?: number | null;
  confirmed?: boolean;
};

const DEFAULT_REQUIRED_SHOTS: TemplateShotRequirement[] = [
  {
    role: "hero",
    assetRole: "primary",
    label: "Hero shot",
    required: true,
    exampleHint: "Capture the strongest clear image of the main subject.",
    guidance: ["Center object", "Hold steady", "More light"],
  },
  {
    role: "closeup",
    assetRole: "product_detail",
    label: "Close-up detail",
    required: false,
    exampleHint: "Move close enough to show texture, label, or detail.",
    guidance: ["Move closer", "Show detail", "Hold steady"],
  },
  {
    role: "wide",
    assetRole: "venue",
    label: "Wide context",
    required: false,
    exampleHint: "Show the environment around the product or subject.",
    guidance: ["Capture wide shot", "Center subject", "More light"],
  },
];

export function normalizeTemplateExperience(template: TemplateCatalogItem | null | undefined): TemplateExperience {
  const metadata = template?.metadata || {};
  const requiredShots = Array.isArray(metadata.requiredShots) && metadata.requiredShots.length > 0
    ? metadata.requiredShots.map((shot, index) => normalizeShot(shot, index)).slice(0, 5)
    : DEFAULT_REQUIRED_SHOTS.slice(0, Math.max(1, Math.min(5, template?.requiredAssetMin || template?.version?.inputSchema?.requiredAssetCount || 3)));

  return {
    previewVideo: template?.previewVideoUrl || (typeof metadata.previewVideo === "string" ? metadata.previewVideo : null),
    previewImage: template?.previewImageUrl || (typeof metadata.previewImage === "string" ? metadata.previewImage : null),
    styleTags: stringList(metadata.styleTags, ["guided", "9:16"]),
    difficulty: typeof metadata.difficulty === "string" ? metadata.difficulty : "Guided",
    estimatedDuration: typeof metadata.estimatedDuration === "string" ? metadata.estimatedDuration : "10-20 min capture",
    requiredShots,
    captureGuidance: stringList(metadata.captureGuidance, requiredShots.flatMap((shot) => shot.guidance)),
    featureBullets: stringList(metadata.featureBullets, ["Shot-by-shot capture", "AI visual analysis", "Ordered generation"]),
    publicPricingLabel: typeof metadata.publicPricingLabel === "string" ? metadata.publicPricingLabel : null,
  };
}

export function shotLabel(role: string) {
  const labels: Record<string, string> = {
    hero: "Hero shot",
    closeup: "Close-up",
    detail: "Detail shot",
    wide: "Wide shot",
    motion: "Motion shot",
    people: "People shot",
    venue: "Venue shot",
    primary: "Hero shot",
    product_detail: "Close-up",
    extra: "Motion/detail",
  };
  return labels[role] ?? role.replace(/_/g, " ");
}

export function templateDurationLabel(template: TemplateCatalogItem) {
  const experience = normalizeTemplateExperience(template);
  const seconds = template.version?.outputFormat?.durationSeconds;
  if (typeof seconds === "number" && Number.isFinite(seconds)) return `${seconds}s video`;
  return experience.estimatedDuration || "Guided capture";
}

function normalizeShot(value: unknown, index: number): TemplateShotRequirement {
  const raw = value && typeof value === "object" && !Array.isArray(value)
    ? value as Partial<TemplateShotRequirement>
    : {};
  return {
    role: typeof raw.role === "string" ? raw.role : `shot_${index + 1}`,
    assetRole: typeof raw.assetRole === "string" ? raw.assetRole : `asset_${index + 1}`,
    label: typeof raw.label === "string" ? raw.label : `Shot ${index + 1}`,
    required: raw.required !== false,
    exampleHint: typeof raw.exampleHint === "string" ? raw.exampleHint : "Capture a clear, useful angle.",
    guidance: stringList(raw.guidance, ["Center object", "Hold steady"]),
  };
}

function stringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return list.length > 0 ? list.slice(0, 8) : fallback;
}
