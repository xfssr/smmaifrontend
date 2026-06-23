import React from 'react';
import {
  AccountIcon,
  CreditsIcon,
  PremiumTemplatesIcon,
  CameraAssistantIcon,
  VideoResultIcon,
  HelpGuideIcon,
  AddCreditsIcon,
  QRMenuIcon,
  DisplayWallIcon,
  BusinessToolsIcon,
  BusinessLocalIcon,
  WorkspaceIcon,
  CreateVideoIcon,
  LogoBrandIcon,
  AppDrawerIcon,
  AIStyleIcon,
  PipelineEngineIcon,
  MediaAssetsIcon,
  QRMenuAppIcon,
  ProviderNetworkIcon
} from './icons/custom';

interface LegacyIconProps {
  name: string;
  className?: string;
  size?: number;
}

const LegacyIcon: React.FC<LegacyIconProps> = ({ name, className = "w-5 h-5", size = 24 }) => {
  const baseProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `inline-block align-middle ${className}`,
    xmlns: "http://www.w3.org/2000/svg"
  };

  const icons: Record<string, React.ReactNode> = {
    logoMark: <LogoBrandIcon className={className} size={size} />,
    home: (
      <svg {...baseProps}>
        <path d="M4 10.8L12 4L20 10.8"/><path d="M6.5 10V20H17.5V10"/><path d="M10 20V14H14V20"/>
      </svg>
    ),
    account: <AccountIcon className={className} size={size} />,
    credits: <CreditsIcon className={className} size={size} />,
    templates: <PremiumTemplatesIcon className={className} size={size} />,
    cameraAi: <CameraAssistantIcon className={className} size={size} />,
    videoDone: <VideoResultIcon className={className} size={size} />,
    support: <HelpGuideIcon className={className} size={size} />,
    qrMenu: <QRMenuAppIcon className={className} size={size} />,
    displayWall: <DisplayWallIcon className={className} size={size} />,
    solutions: <BusinessLocalIcon className={className} size={size} />,
    workspace: <WorkspaceIcon className={className} size={size} />,
    createVideo: <CreateVideoIcon className={className} size={size} />,
    aiStyle: <AIStyleIcon className={className} size={size} />,
    pipeline: <PipelineEngineIcon className={className} size={size} />,
    mediaAssets: <MediaAssetsIcon className={className} size={size} />,
    providerNetwork: <ProviderNetworkIcon className={className} size={size} />,
    menu: (
      <svg {...baseProps}>
        <path d="M4 7H20"/><path d="M4 12H20"/><path d="M4 17H20"/>
      </svg>
    ),
    close: (
      <svg {...baseProps}>
        <path d="M6 6L18 18"/><path d="M18 6L6 18"/>
      </svg>
    ),
    plus: <AddCreditsIcon className={className} size={size} />,
    magic: (
      <svg {...baseProps}>
        <path d="M4 20L15.5 8.5"/><path d="M13.5 6.5L17.5 10.5"/><path d="M18 3L18.6 5.4L21 6L18.6 6.6L18 9L17.4 6.6L15 6L17.4 5.4L18 3Z"/><path d="M7 4L7.4 5.6L9 6L7.4 6.4L7 8L6.6 6.4L5 6L6.6 5.6L7 4Z"/>
      </svg>
    ),
    share: (
      <svg {...baseProps}>
        <path d="M18 8C19.4 8 20.5 6.9 20.5 5.5C20.5 4.1 19.4 3 18 3C16.6 3 15.5 4.1 15.5 5.5C15.5 6.9 16.6 8 18 8Z"/>
        <path d="M6 14.5C7.4 14.5 8.5 13.4 8.5 12C8.5 10.6 7.4 9.5 6 9.5C4.6 9.5 3.5 10.6 3.5 12C3.5 13.4 4.6 14.5 6 14.5Z"/>
        <path d="M18 21C19.4 21 20.5 19.9 20.5 18.5C20.5 17.1 19.4 16 18 16C16.6 16 15.5 17.1 15.5 18.5C15.5 19.9 16.6 21 18 21Z"/>
        <path d="M8.2 10.8L15.8 6.7"/><path d="M8.2 13.2L15.8 17.3"/>
      </svg>
    ),
    nav: <AppDrawerIcon className={className} size={size} />
  };

  return icons[name] || icons.magic;
};

export default LegacyIcon;
