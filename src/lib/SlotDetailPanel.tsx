import React from 'react';
import type { TemplateMediaSlot } from './types';
import { Aperture, Upload } from 'lucide-react';

interface SlotDetailPanelProps {
  slot: TemplateMediaSlot;
  onUploadClick: () => void;
}

const SlotDetailPanel: React.FC<SlotDetailPanelProps> = ({ slot, onUploadClick }) => {
  return (
    <div className="slot-detail-panel">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange text-obsidian">
          <Aperture size={22} />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">
            {slot.required ? 'Required Slot' : 'Optional Slot'}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{slot.label}</h2>
          <p className="text-sm font-bold uppercase leading-relaxed tracking-tight text-white/55">
            {slot.description}
          </p>
        </div>
      </div>

      {slot.cameraGuidance.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-tight text-white/65">Camera Guidance:</h3>
          <ul className="list-disc list-inside text-xs text-white/55">
            {slot.cameraGuidance.map((guidance: string, index: number) => (
              <li key={index}>{guidance}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button onClick={onUploadClick} className="btn flex-1">
          <Upload size={16} /> Upload Artifact
        </button>
      </div>
    </div>
  );
};

export default SlotDetailPanel;
