import React from 'react';
import type { TemplateCatalogItem } from '../lib/templateExperience';

interface CreateFlowShellProps {
  template: TemplateCatalogItem | null;
  children: React.ReactNode;
}

const CreateFlowShell: React.FC<CreateFlowShellProps> = ({ template, children }) => {
  return (
    <div className="h-full min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {children}
    </div>
  );
};

export default CreateFlowShell;
