export type MediaSlotStatus = "locked" | "active" | "uploading" | "analyzing" | "complete" | "error";

export type MediaSlotType = string;

export type MediaSlotState = {
  id: string;
  type: MediaSlotType;
  title: string;
  prompt: string;
  required?: boolean;
  status: MediaSlotStatus;
  file?: File;
  previewUrl?: string;
  browserUrl?: string;
  thumbnailUrl?: string;
  assetId?: string;
  analysis?: {
    shortSummary?: string;
    detectedObjects?: string[];
    lighting?: string;
    composition?: string;
    background?: string;
    quality?: "poor" | "usable" | "good" | "excellent";
    recommendations?: string[];
  };
  error?: string;
};

export type BrandState = {
  mode: "none" | "logo" | "text" | "skipped";
  logoFile?: File;
  logoPreviewUrl?: string;
  businessName?: string;
};

export type CombinedContentDirection = {
  heroSubject?: string;
  closeupDetails?: string;
  atmosphere?: string;
  suggestedStyle?: string;
  shotSequence?: string[];
  promptContext?: string;
};

export type ChatMessageSender = "ai" | "user";
export type ChatMessageSource = "user" | "backend_agent" | "local_ui" | "debug";
export type UiWorkflowEvent =
  | {
      type: "photo_uploaded";
      assetId: string;
      slotId: string;
      previewUrl: string;
    }
  | {
      type: "photo_analyzed";
      assetId: string;
      slotId: string;
      status: string;
    }
  | {
      type: "slot_assigned";
      assetId: string;
      slotId: string;
      slotLabel: string;
    };

export type ChatMessage = {
  id: string;
  sender: ChatMessageSender;
  text: string;
  source?: ChatMessageSource;
};

export type GeneratedReferenceCard = {
  id: string;
  refId?: "gen_ref_1" | "gen_ref_2" | "gen_ref_3" | "gen_ref_4" | "gen_ref_5";
  promptToken?: "#Image1" | "#Image2" | "#Image3" | "#Image4" | "#Image5";
  modelRole?:
    | "nano_banana_2"
    | "nano_banana_pro"
    | "nano_banana_legacy"
    | "mock_image"
    | "gpt_image_2";
  sourceStrategy?: "single_best_hero_source" | "single_secondary_source" | "all_uploaded_sources";
  sourceAssetIds?: string[];
  referenceImageId: string;
  assetId: string;
  imageUrl: string;
  internalUrl: string;
  title: "Product Hero" | "Atmosphere Angle" | "Six-Shot Storyboard" | "Logo/Typography Concept" | "Marketing Post Concept";
  sourceSummary: string;
  description: string;
  role: "hook" | "proof" | "context" | "conversion";
  campaignRole: "hook" | "proof" | "context" | "conversion";
  acceptedForVideo: boolean;
  selectedForVideo?: boolean;
  sourceTruthMatch: "pass" | "weak" | "fail";
  selected: boolean;
  approved: boolean;
  provider?: "google" | "mock" | "fal" | "openrouter";
  modelId?: string;
  generationClass?: "photoreal" | "brand_design";
  actionLabels: ["Use this", "Regenerate", "Edit direction"];
};

export type SourceAssetPreviewCard = {
  assetId: string;
  slotId?: string;
  imageUrl: string;
  role: "dish_primary" | "dish_secondary_angle" | "venue_atmosphere" | "brand_asset" | "supporting_context";
  status: "accepted" | "needs_retake" | "rejected";
  qualityScore?: number;
  title: string;
  description: string;
  detectedObjects: string[];
  brandSignals: string[];
  preserve: string[];
  avoid: string[];
  sourceTruthWeight: "hero" | "secondary" | "brand" | "atmosphere" | "support";
};

export type SourceAnalysisBoard = {
  status: "partial" | "ready";
  uploadedCount: number;
  requiredComplete: boolean;
  cards: SourceAssetPreviewCard[];
};

export type BrandCollectionBoard = {
  mainSubject: string;
  businessType: string;
  atmosphere: string;
  visualStyle: string;
  brandSignals: string[];
  strongestAssetId: string;
  missingSignals: string[];
  preserveRules: string[];
  avoidRules: string[];
  generationReadiness: "weak" | "usable" | "strong";
};
