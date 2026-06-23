import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const baseSvgProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  className
});

// 1. Food & Bar: plate and cocktail hybrid with AI scan ring
export const FoodBarIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="36" r="18" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 36H42" stroke="#A1A1AA" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M28 20L32 30L36 20" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="32" y1="30" x2="32" y2="44" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <line x1="26" y1="44" x2="38" y2="44" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="32" r="26" stroke="#D88A3D" strokeWidth="1.5" strokeDasharray="4 6" className="animate-spin-slow" />
  </svg>
);

// 2. Product: premium product cube with scan frame corners
export const ProductIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M32 10L50 20V42L32 52L14 42V20L32 10Z" stroke="#A1A1AA" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 10V31M32 31L14 20M32 31L50 20" stroke="#A1A1AA" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M10 14V8H16" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 8H54V14" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 50V56H16" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 56H54V50" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// 3. Cinematic: film gate with lens glow and motion line
export const CinematicIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="8" y="14" width="48" height="36" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="32" cy="32" r="10" stroke="#D88A3D" strokeWidth="3" />
    <path d="M14 20H18M14 28H18M14 36H18M14 44H18" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
    <path d="M46 20H50M46 28H50M46 36H50M46 44H50" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
    <circle cx="36" cy="28" r="3" fill="#D88A3D" />
    <path d="M50 14L58 10" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 4. UGC Ads: phone screen with play hook arrow and waveform
export const UGCAdsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="16" y="8" width="32" height="48" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="32" cy="14" r="1.5" fill="#A1A1AA" />
    <path d="M28 26L38 32L28 38V26Z" fill="#D88A3D" stroke="#D88A3D" strokeWidth="2" strokeLinejoin="round" />
    <path d="M22 46V48M27 44V50M32 43V51M37 45V49M42 46V48" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 5. AI Portraits: face silhouette with scan lines and neural ring
export const AIPortraitsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M32 14C23.7 14 18 20.3 18 28.5C18 36.8 23.5 39 27 41.5C28.5 42.5 28 47 28 49H36C36 47 35.5 42.5 37 41.5C40.5 39 46 36.8 46 28.5C46 20.3 40.3 14 32 14Z" stroke="#A1A1AA" strokeWidth="3" strokeLinejoin="round" />
    <path d="M12 28.5H52" stroke="#D88A3D" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="32" cy="28.5" r="20" stroke="#D88A3D" strokeWidth="1" strokeDasharray="2 4" />
    <circle cx="32" cy="22" r="3" fill="#D88A3D" />
    <circle cx="26" cy="30" r="3" fill="#D88A3D" />
    <circle cx="38" cy="30" r="3" fill="#D88A3D" />
  </svg>
);

// 6. Business / Local Business: storefront with small video tile
export const BusinessLocalIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M10 46H54M14 26H50" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <path d="M14 26L18 14H46L50 26" stroke="#A1A1AA" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="22" y="32" width="20" height="14" rx="2" stroke="#D88A3D" strokeWidth="2.5" />
    <polygon points="30,36 34,39 30,42" fill="#D88A3D" />
  </svg>
);

// 7. Community Videos: stacked video cards with play pulse
export const CommunityVideosIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="18" y="16" width="34" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="12" y="24" width="34" height="28" rx="4" stroke="#D88A3D" strokeWidth="2.5" fill="#070706" />
    <polygon points="26,33 34,38 26,43" fill="#D88A3D" />
  </svg>
);

// 8. Premium Templates: layered cards with sparkle and video frame
export const PremiumTemplatesIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="14" y="20" width="30" height="30" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="22" y="12" width="30" height="30" rx="4" stroke="#D88A3D" strokeWidth="3" fill="#070706" />
    <path d="M42 22L47 27L42 32" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 8L42 12L46 13L42 14L40 18L38 14L34 13L38 12L40 8Z" fill="#D88A3D" />
  </svg>
);

// 9. Camera Assistant: camera lens with focus brackets and AI scan line
export const CameraAssistantIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M12 20C12 15.6 15.6 12 20 12H44C48.4 12 52 15.6 52 20V44C52 48.4 48.4 52 44 52H20C15.6 52 12 48.4 12 44V20Z" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="32" cy="32" r="12" stroke="#D88A3D" strokeWidth="3" />
    <circle cx="32" cy="32" r="6" fill="#D88A3D" />
    <path d="M16 16V22M16 16H22" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 16V22M48 16H42" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 48V42M16 48H22" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 48V42M48 48H42" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <line x1="8" y1="32" x2="56" y2="32" stroke="#D88A3D" strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

// 10. Upload / Start with one picture: image tile flying into a pipeline slot
export const StartWithOnePictureIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="12" y="24" width="28" height="28" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="20" cy="32" r="3" fill="#A1A1AA" />
    <path d="M16 46L24 38L36 48" stroke="#A1A1AA" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M36 28L48 16M48 16V24M48 16H40" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 11. Media Slots: three stacked slots connected by orange line
export const MediaSlotsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="18" y="10" width="28" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2.5" />
    <rect x="18" y="27" width="28" height="10" rx="2" stroke="#D88A3D" strokeWidth="2.5" />
    <rect x="18" y="44" width="28" height="10" rx="2" stroke="#A1A1AA" strokeWidth="2.5" />
    <line x1="32" y1="20" x2="32" y2="27" stroke="#D88A3D" strokeWidth="2" />
    <line x1="32" y1="37" x2="32" y2="44" stroke="#D88A3D" strokeWidth="2" />
  </svg>
);

// 12. AI Scan: scan beam crossing an image frame with analysis chips
export const AIScanIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="14" width="44" height="36" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="6" y1="32" x2="58" y2="32" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <circle cx="22" cy="24" r="2.5" fill="#D88A3D" />
    <circle cx="42" cy="40" r="2.5" fill="#D88A3D" />
    <path d="M6 32L12 26M58 32L52 38" stroke="#D88A3D" strokeWidth="2" />
  </svg>
);

// 13. Storyboard / Timeline: connected scene cards on a mini timeline
export const StoryboardTimelineIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="8" y="14" width="14" height="18" rx="2" stroke="#A1A1AA" strokeWidth="2.5" />
    <rect x="25" y="14" width="14" height="18" rx="2" stroke="#D88A3D" strokeWidth="2.5" />
    <rect x="42" y="14" width="14" height="18" rx="2" stroke="#A1A1AA" strokeWidth="2.5" />
    <line x1="8" y1="44" x2="56" y2="44" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <circle cx="15" cy="44" r="4" fill="#A1A1AA" />
    <circle cx="32" cy="44" r="4" fill="#D88A3D" />
    <circle cx="49" cy="44" r="4" fill="#A1A1AA" />
  </svg>
);

// 14. Generate Video: play frame forming from pipeline nodes
export const GenerateVideoIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <polygon points="24,18 48,32 24,46" stroke="#A1A1AA" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="24" cy="18" r="4.5" fill="#D88A3D" stroke="#0A0A09" strokeWidth="2" />
    <circle cx="48" cy="32" r="4.5" fill="#D88A3D" stroke="#0A0A09" strokeWidth="2" />
    <circle cx="24" cy="46" r="4.5" fill="#D88A3D" stroke="#0A0A09" strokeWidth="2" />
    <line x1="12" y1="32" x2="24" y2="32" stroke="#D88A3D" strokeWidth="2" />
  </svg>
);

// 15. Video Result: finished video card with small glow
export const VideoResultIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="12" y="10" width="40" height="44" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <polygon points="26,24 38,32 26,40" fill="#D88A3D" stroke="#D88A3D" strokeWidth="2" strokeLinejoin="round" />
    <path d="M46 14L48 10L52 12" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 16. Regenerate: circular motion arrow around a video frame
export const RegenerateIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="20" y="20" width="24" height="24" rx="4" stroke="#A1A1AA" strokeWidth="2.5" />
    <path d="M46 22C50 26 50 34 46 38C42 42 34 44 28 42L24 46" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 42C14 38 14 30 18 26C22 22 30 20 36 22L40 18" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" />
    <polygon points="40,18 44,24 36,26" fill="#D88A3D" />
    <polygon points="24,46 20,40 28,38" fill="#D88A3D" />
  </svg>
);

// 17. Credits / Balance: credit chip or coin with subtle media sparkle
export const CreditsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="32" r="20" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="32" cy="32" r="14" stroke="#D88A3D" strokeWidth="2.5" />
    <path d="M30 24L34 32H30L34 40" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="48" cy="18" r="2" fill="#D88A3D" />
    <circle cx="44" cy="14" r="1" fill="#D88A3D" />
  </svg>
);

// 18. Add Credits Plus: plus symbol inside soft orange credit orbit
export const AddCreditsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="32" r="20" stroke="#A1A1AA" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="32" cy="32" r="14" stroke="#D88A3D" strokeWidth="2" />
    <path d="M32 26V38M26 32H38" stroke="#D88A3D" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

// 19. Account: profile circle with small dashboard card
export const AccountIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="24" r="10" stroke="#A1A1AA" strokeWidth="3" />
    <path d="M18 48C18 38 24.3 36 32 36C39.7 36 46 38 46 48" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <rect x="42" y="12" width="14" height="10" rx="2" stroke="#D88A3D" strokeWidth="2" fill="#070706" />
    <line x1="46" y1="17" x2="52" y2="17" stroke="#D88A3D" strokeWidth="1.5" />
  </svg>
);

// 20. My Videos: stacked video cards with play marker
export const MyVideosIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="18" width="34" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="20" y="12" width="34" height="34" rx="4" stroke="#D88A3D" strokeWidth="3" fill="#070706" />
    <polygon points="32,24 40,29 32,34" fill="#D88A3D" />
  </svg>
);

// 21. My Stories / Projects: layered storyboard documents
export const MyStoriesIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="18" width="32" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="22" y="10" width="32" height="34" rx="4" stroke="#D88A3D" strokeWidth="3" fill="#070706" />
    <line x1="28" y1="18" x2="48" y2="18" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="26" x2="40" y2="26" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="34" x2="44" y2="34" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 22. Transactions: receipt/card with credit pulse
export const TransactionsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="14" y="10" width="36" height="44" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="22" y1="20" x2="42" y2="20" stroke="#A1A1AA" strokeWidth="2" />
    <line x1="22" y1="28" x2="34" y2="28" stroke="#A1A1AA" strokeWidth="2" />
    <circle cx="38" cy="38" r="6" stroke="#D88A3D" strokeWidth="2.5" />
    <line x1="38" y1="35" x2="38" y2="41" stroke="#D88A3D" strokeWidth="1.5" />
  </svg>
);

// 23. Business Tools: grid/toolbox with QR and media tiles
export const BusinessToolsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="10" width="18" height="18" rx="3" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="36" y="10" width="18" height="18" rx="3" stroke="#D88A3D" strokeWidth="3" />
    <rect x="10" y="36" width="18" height="18" rx="3" stroke="#D88A3D" strokeWidth="3" />
    <rect x="36" y="36" width="18" height="18" rx="3" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="27" cy="27" r="4" fill="#D88A3D" />
  </svg>
);

// 24. Workspace: small team/workspace frame with connected nodes
export const WorkspaceIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="12" y="12" width="40" height="40" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="24" cy="24" r="4" fill="#D88A3D" />
    <circle cx="40" cy="24" r="4" fill="#D88A3D" />
    <circle cx="32" cy="40" r="4" fill="#D88A3D" />
    <line x1="24" y1="24" x2="32" y2="40" stroke="#A1A1AA" strokeWidth="2" />
    <line x1="40" y1="24" x2="32" y2="40" stroke="#A1A1AA" strokeWidth="2" />
    <line x1="24" y1="24" x2="40" y2="24" stroke="#A1A1AA" strokeWidth="2" />
  </svg>
);

// 25. QR Menu: clean QR-like grid combined with a menu card
export const QRMenuIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="10" width="20" height="20" rx="3" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="15" y="15" width="10" height="10" rx="1" fill="#D88A3D" />
    <rect x="38" y="10" width="16" height="44" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="44" y1="20" x2="48" y2="20" stroke="#D88A3D" strokeWidth="2" />
    <line x1="44" y1="28" x2="48" y2="28" stroke="#D88A3D" strokeWidth="2" />
    <line x1="44" y1="36" x2="48" y2="36" stroke="#D88A3D" strokeWidth="2" />
    <rect x="10" y="38" width="16" height="16" rx="2" stroke="#D88A3D" strokeWidth="2" />
  </svg>
);

// 26. Display Wall: large screen rectangle with multiple video tiles
export const DisplayWallIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="8" y="12" width="48" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="32" y1="46" x2="32" y2="56" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="20" y1="56" x2="44" y2="56" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="14" y="18" width="14" height="10" rx="1" fill="#D88A3D" />
    <rect x="36" y="18" width="14" height="10" rx="1" fill="#A1A1AA" />
    <rect x="14" y="32" width="14" height="10" rx="1" fill="#A1A1AA" />
    <rect x="36" y="32" width="14" height="10" rx="1" fill="#D88A3D" />
  </svg>
);

// 27. Restaurant Menu: menu sheet with dish/video accent
export const RestaurantMenuIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="14" y="8" width="36" height="48" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <line x1="20" y1="18" x2="44" y2="18" stroke="#D88A3D" strokeWidth="2.5" />
    <line x1="20" y1="28" x2="36" y2="28" stroke="#A1A1AA" strokeWidth="2" />
    <line x1="20" y1="36" x2="40" y2="36" stroke="#A1A1AA" strokeWidth="2" />
    <circle cx="40" cy="40" r="4" fill="#D88A3D" />
  </svg>
);

// 28. Logo / Brand Slot: brand tile inside focus brackets
export const LogoBrandSlotIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="16" y="16" width="32" height="32" rx="4" stroke="#A1A1AA" strokeWidth="2.5" />
    <path d="M12 24V12H24" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 24V12H40" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 40V52H24" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 40V52H40" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="8" stroke="#D88A3D" strokeWidth="3" />
  </svg>
);

// 29. Atmosphere Slot: venue/interior frame with mood glow
export const AtmosphereSlotIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="12" y="14" width="40" height="36" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <path d="M16 46C20 40 28 36 32 40C36 44 44 40 48 46" stroke="#D88A3D" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="38" cy="24" r="5" fill="#D88A3D" />
    <circle cx="22" cy="24" r="3" fill="#A1A1AA" />
  </svg>
);

// 30. Reference Slot: reference image stack with style spark
export const ReferenceSlotIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="10" y="20" width="34" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="20" y="10" width="34" height="34" rx="4" stroke="#D88A3D" strokeWidth="2.5" fill="#070706" />
    <path d="M42 22L47 27" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="24" r="5" stroke="#D88A3D" strokeWidth="2" />
  </svg>
);

// 31. Save / Export: video frame moving into saved tray
export const SaveExportIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M16 42H48" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 46V52H54V46" stroke="#A1A1AA" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 10V34M32 34L24 26M32 34L40 26" stroke="#D88A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 32. Help / Guide: guide compass with small pipeline nodes
export const HelpGuideIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="32" r="22" stroke="#A1A1AA" strokeWidth="3" />
    <path d="M32 18L35 29L46 32L35 35L32 46L29 35L18 32L29 29Z" fill="#D88A3D" stroke="#D88A3D" strokeWidth="1" />
    <circle cx="32" cy="32" r="3" fill="#0A0A09" />
  </svg>
);

// 33. Product showcase: pedestal with spotlight cone and focus cues
export const ProductStudioIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M14 48H50" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <rect x="22" y="24" width="20" height="24" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="32" cy="34" r="5" stroke="#D88A3D" strokeWidth="2.5" />
    <path d="M10 16L18 22" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M54 16L46 22" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="10" cy="16" r="3" fill="#D88A3D" />
    <circle cx="54" cy="16" r="3" fill="#D88A3D" />
    <path d="M6 32H10M54 32H58" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 34. Beauty & Wellness: elegant wellness oil droplet enclosing organic core
export const BeautyWellnessIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M32 12C32 12 18 28 18 38C18 45.7 24.3 52 32 52C39.7 52 46 45.7 46 38C46 28 32 12 32 12Z" stroke="#A1A1AA" strokeWidth="3" strokeLinejoin="round" />
    <path d="M32 20C32 20 24 32 24 38C24 42.4 27.6 46 32 46C36.4 46 40 42.4 40 38C40 32 32 20 32 20Z" stroke="#D88A3D" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M32 30V40" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 38H16M48 38H52" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="32" cy="6" r="2" fill="#D88A3D" />
    <circle cx="48" cy="14" r="2.5" fill="#D88A3D" />
    <circle cx="16" cy="14" r="2.5" fill="#D88A3D" />
  </svg>
);

// 35. Create Video: video frame forming from small camera spark and pipeline nodes
export const CreateVideoIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="8" y="10" width="48" height="38" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <path d="M26 21L42 29L26 37V21Z" fill="#D88A3D" stroke="#D88A3D" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="14" cy="54" r="2.5" fill="#A1A1AA" />
    <circle cx="32" cy="54" r="2.5" fill="#D88A3D" />
    <circle cx="50" cy="54" r="2.5" fill="#A1A1AA" />
    <path d="M16 54H48" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
  </svg>
);

// 36. Logo / Brand: brand tile inside focus brackets with a small orange verification spark
export const LogoBrandIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M12 22V12H22" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 22V12H42" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 42V52H22" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 42V52H42" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 18L44 32L32 46L20 32Z" stroke="#A1A1AA" strokeWidth="2.5" strokeLinejoin="round" fill="#080807" />
    <circle cx="32" cy="32" r="5" fill="#D88A3D" />
  </svg>
);

// 37. Main Menu / App Drawer: layered app panels sliding from left, with orange active rail
export const AppDrawerIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <path d="M8 14H32" stroke="#D88A3D" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M8 26H48" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <path d="M8 38H42" stroke="#A1A1AA" strokeWidth="3" strokeLinecap="round" />
    <path d="M8 50H26" stroke="#D88A3D" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="48" cy="14" r="3" fill="#D88A3D" />
    <circle cx="56" cy="38" r="3" fill="#A1A1AA" />
  </svg>
);

// 38. Want AI Style / Style Spark: magic style card, small AI sparkle, orange scan ring
export const AIStyleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="12" y="12" width="40" height="40" rx="8" stroke="#A1A1AA" strokeWidth="3" />
    <path d="M26 32L29 23L38 20L29 17L26 8L23 17L14 20L23 23Z" fill="#D88A3D" stroke="#D88A3D" strokeWidth="1" />
    <circle cx="42" cy="42" r="6" stroke="#D88A3D" strokeWidth="2.5" />
    <circle cx="24" cy="42" r="3" fill="#A1A1AA" />
    <circle cx="42" cy="24" r="3" fill="#A1A1AA" />
  </svg>
);

// 39. Pipeline Engine: connected nodes flowing into a video frame
export const PipelineEngineIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="16" cy="22" r="6" stroke="#A1A1AA" strokeWidth="3" />
    <circle cx="16" cy="42" r="6" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="38" y="24" width="18" height="16" rx="4" stroke="#D88A3D" strokeWidth="3" />
    <path d="M22 22H30V32H38" stroke="#D88A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 42H30V32" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 40. Media Assets: stacked image/video asset cards with small slot connector
export const MediaAssetsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="8" y="20" width="36" height="34" rx="4" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="20" y="10" width="36" height="34" rx="4" stroke="#D88A3D" strokeWidth="2.5" fill="#070706" />
    <circle cx="30" cy="20" r="3" fill="#D88A3D" />
    <path d="M24 38L32 30L44 40" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 41. QR Menu App: clean QR-like grid combined with menu card
export const QRMenuAppIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <rect x="14" y="8" width="36" height="48" rx="6" stroke="#A1A1AA" strokeWidth="3" />
    <rect x="20" y="14" width="10" height="10" rx="1.5" stroke="#D88A3D" strokeWidth="2" />
    <rect x="34" y="14" width="10" height="10" rx="1.5" stroke="#A1A1AA" strokeWidth="2" />
    <rect x="20" y="28" width="10" height="10" rx="1.5" stroke="#A1A1AA" strokeWidth="2" />
    <rect x="34" y="28" width="10" height="10" rx="1.5" stroke="#D88A3D" strokeWidth="2" fill="#D88A3D" />
    <line x1="20" y1="44" x2="44" y2="44" stroke="#A1A1AA" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 42. Provider Network: secure GPU / AI provider nodes / cloud compute links
export const ProviderNetworkIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg {...baseSvgProps(size, className)}>
    <circle cx="32" cy="18" r="7" stroke="#D88A3D" strokeWidth="3" />
    <circle cx="16" cy="44" r="5" stroke="#A1A1AA" strokeWidth="2.5" />
    <circle cx="32" cy="46" r="5" stroke="#A1A1AA" strokeWidth="2.5" />
    <circle cx="48" cy="44" r="5" stroke="#A1A1AA" strokeWidth="2.5" />
    <path d="M32 25V41" stroke="#D88A3D" strokeWidth="2" strokeLinecap="round" />
    <path d="M32 25L18 40" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M32 25L46 40" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
