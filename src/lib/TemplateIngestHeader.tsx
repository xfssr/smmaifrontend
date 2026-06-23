import React from 'react';
import LegacyIcon from '../components/LegacyIcon';
import type { TemplateCatalogItem } from './templateExperience';
import type { TemplateMediaConfig } from './types';

interface TemplateIngestHeaderProps {
  selectedTemplate: TemplateCatalogItem | null;
  templateMediaConfig: TemplateMediaConfig | null;
}

const TemplateIngestHeader: React.FC<TemplateIngestHeaderProps> = ({ selectedTemplate, templateMediaConfig }) => {
  return (
    <div className="space-y-4">
      <div className="pill">
        <LegacyIcon name="magic" size={14} className="text-orange" />
        AI Production Pipeline
      </div>
      <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">{templateMediaConfig?.displayName || selectedTemplate?.name || 'Template Ingest'}</h1>
      {selectedTemplate && <p className="text-sm font-bold uppercase tracking-tight text-white/40">Upload your photos to make a video like this template.</p>}
    </div>
  );
};

export default TemplateIngestHeader;
