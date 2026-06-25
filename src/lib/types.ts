export type TemplateMediaSlot = {
  slotId: string;
  role: string;
  label: string;
  description: string;
  required: boolean;
  min: number;
  max: number;
  cameraGuidance: string[];
  acceptedObjects: string[];
  avoid: string[];
};

export type TemplateMediaConfig = {
  templateSlug: string;
  displayName: string;
  maxAssets: number;
  mediaSlots: TemplateMediaSlot[];
};

export type ConfirmedSlotAsset = {
  assetId: string;
  slotId: string;
  previewUrl?: string;
  browserUrl?: string;
  thumbnailUrl?: string;
  analysisTitle: string;
  analysisDescription: string;
  detectedObjects?: string[];
  qualityIssues?: string[];
  userEdited?: boolean;
};
