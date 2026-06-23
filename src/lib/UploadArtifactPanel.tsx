import React from 'react';
import UploadDropzone from '../components/UploadDropzone';
import type { TemplateMediaSlot } from './types';

interface UploadArtifactPanelProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedSlot: TemplateMediaSlot | null;
}

const UploadArtifactPanel: React.FC<UploadArtifactPanelProps> = ({
  onFileSelect,
  isLoading,
  selectedSlot,
}) => {
  const handleFileSelectWrapper = (file: File) => {
    if (selectedSlot) {
      onFileSelect(file);
    }
  };

  return (
    <UploadDropzone
      onFileSelect={handleFileSelectWrapper}
      isLoading={isLoading}
    />
  );
};

export default UploadArtifactPanel;
