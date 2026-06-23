import React from 'react';
import type { ConfirmedSlotAsset, TemplateMediaSlot } from './types';
import { CheckCircle, PlusCircle } from 'lucide-react';

interface MediaSlotCardProps {
  slot: TemplateMediaSlot;
  confirmedAsset: ConfirmedSlotAsset | undefined;
  isSelected: boolean;
  onSelect: (slot: TemplateMediaSlot) => void;
}

const MediaSlotCard: React.FC<MediaSlotCardProps> = ({ slot, confirmedAsset, isSelected, onSelect }) => {
  const isConfirmed = !!confirmedAsset;

  return (
    <div
      className={`slot-card flex-shrink-0 w-40 h-40 relative ${isConfirmed ? 'is-confirmed' : ''} ${isSelected ? 'is-active' : ''}`}
      onClick={() => onSelect(slot)}
    >
      {isConfirmed && confirmedAsset.previewUrl ? (
        <img src={confirmedAsset.previewUrl} alt={slot.label} className="w-full h-full object-cover rounded-[var(--radius)]" />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-center p-2">
          {isConfirmed ? (
            <CheckCircle size={24} className="text-green mb-2" />
          ) : (
            <PlusCircle size={24} className="text-white/40 mb-2" />
          )}
          <span className="slot-card-label text-sm">{slot.label}</span>
          {slot.required && <span className="text-[8px] uppercase tracking-widest text-orange mt-1">Required</span>}
          {!slot.required && <span className="text-[8px] uppercase tracking-widest text-white/40 mt-1">Optional</span>}
        </div>
      )}
      {isConfirmed && <div className="absolute top-2 right-2 bg-green rounded-full p-1"><CheckCircle size={16} className="text-obsidian" /></div>}
    </div>
  );
};

export default MediaSlotCard;
