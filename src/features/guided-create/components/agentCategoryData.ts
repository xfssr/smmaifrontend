import type { LucideIcon } from 'lucide-react';
import {
  Aperture,
  Brush,
  Camera,
  Film,
  Globe,
  Image as ImageIcon,
  Megaphone,
  MessageCircle,
  Music2,
  Palette,
  PlaySquare,
  Smartphone,
  Users,
} from 'lucide-react';

/**
 * Generation status for a single agent output. Drives the status pill colour.
 * Replace this mock catalogue with live generation telemetry when the API
 * contract is available – the shape is intentionally simple to map onto.
 */
export type OutputStatus = 'queued' | 'in_progress' | 'ready' | 'failed';

export interface CategoryOutput {
  id: string;
  title: string;
  /** User-friendly status label shown on the pill (e.g. "Generating", "Rendering"). */
  statusLabel: string;
  status: OutputStatus;
  progress: number;
  icon: LucideIcon;
}

export interface CategoryGroup {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Accent colour used for the category icon chip and progress bar. */
  accent: string;
  defaultExpanded: boolean;
  outputs: CategoryOutput[];
}

export const STATUS_STYLES: Record<
  OutputStatus,
  { dot: string; text: string; bar: string; chip: string }
> = {
  queued: {
    dot: 'bg-zinc-400',
    text: 'text-zinc-300',
    bar: 'bg-zinc-400',
    chip: 'bg-white/5 border-white/10',
  },
  in_progress: {
    dot: 'bg-[#FF9F1C]',
    text: 'text-[#FF9F1C]',
    bar: 'bg-[#FF9F1C]',
    chip: 'bg-[#FF9F1C]/10 border-[#FF9F1C]/25',
  },
  ready: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    bar: 'bg-emerald-400',
    chip: 'bg-emerald-400/10 border-emerald-400/25',
  },
  failed: {
    dot: 'bg-red-500',
    text: 'text-red-400',
    bar: 'bg-red-500',
    chip: 'bg-red-500/10 border-red-500/25',
  },
};

export function categoryProgress(group: CategoryGroup): number {
  if (group.outputs.length === 0) return 0;
  const total = group.outputs.reduce((sum, output) => sum + output.progress, 0);
  return Math.round(total / group.outputs.length);
}

/**
 * Mock agent-generated category catalogue. Mirrors the reference design and is
 * the single source the UI renders until live status data replaces it.
 */
export const AGENT_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'instagram',
    title: 'Instagram',
    description: 'Stories and feed posts tuned for reach.',
    icon: Camera,
    accent: '#FF9F1C',
    defaultExpanded: true,
    outputs: [
      { id: 'ig-story', title: 'Instagram Story', statusLabel: 'In Progress', status: 'in_progress', progress: 68, icon: Smartphone },
      { id: 'ig-post', title: 'Instagram Post', statusLabel: 'Generating', status: 'in_progress', progress: 54, icon: ImageIcon },
    ],
  },
  {
    id: 'facebook',
    title: 'Facebook',
    description: 'Organic posts and paid ad creative.',
    icon: Users,
    accent: '#06B6D4',
    defaultExpanded: false,
    outputs: [
      { id: 'fb-post', title: 'Facebook Post', statusLabel: 'In Progress', status: 'in_progress', progress: 36, icon: MessageCircle },
      { id: 'fb-ad', title: 'Facebook Ad', statusLabel: 'Generating', status: 'in_progress', progress: 41, icon: Megaphone },
    ],
  },
  {
    id: 'social-video',
    title: 'Social Video',
    description: 'Short-form vertical video for TikTok and Shorts.',
    icon: Film,
    accent: '#7C3AED',
    defaultExpanded: false,
    outputs: [
      { id: 'tiktok', title: 'TikTok Video', statusLabel: 'Rendering', status: 'in_progress', progress: 22, icon: Music2 },
      { id: 'yt-short', title: 'YouTube Short', statusLabel: 'In Progress', status: 'in_progress', progress: 15, icon: PlaySquare },
    ],
  },
  {
    id: 'brand-system',
    title: 'Brand System',
    description: 'Reusable brand kit and supporting placements.',
    icon: Palette,
    accent: '#22C55E',
    defaultExpanded: false,
    outputs: [
      { id: 'brand-kit', title: 'Brand Kit', statusLabel: 'In Progress', status: 'in_progress', progress: 48, icon: Brush },
      { id: 'website-banner', title: 'Website Banner', statusLabel: 'In Progress', status: 'in_progress', progress: 30, icon: Globe },
    ],
  },
];

/** Compact, user-friendly pipeline stages (no backend/technical labels). */
export const PIPELINE_STAGES = ['Analyze', 'Brand', 'Preview', 'Generate', 'Finalize'] as const;
export const PIPELINE_PROGRESS = 62;

/** Brand kit facets surfaced when Brand System is expanded. */
export const BRAND_KIT_FACETS: Array<{ id: string; label: string; icon: LucideIcon; progress: number }> = [
  { id: 'logo', label: 'Logo', icon: Aperture, progress: 60 },
  { id: 'colors', label: 'Colors', icon: Palette, progress: 52 },
  { id: 'typography', label: 'Typography', icon: Brush, progress: 33 },
];

export const BRAND_KIT_SWATCHES = ['#FF9F1C', '#22C55E', '#06B6D4', '#7C3AED', '#F8FAFC'];
