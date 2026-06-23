import React from 'react';
import type { ConfirmedSlotAsset, TemplateMediaSlot } from './types';
import MediaSlotCard from './MediaSlotCard';

interface MediaSlotCarouselProps {
  mediaSlots: TemplateMediaSlot[];
  confirmedAssets: ConfirmedSlotAsset[];
  selectedSlot: TemplateMediaSlot | null;
  onSelectSlot: (slot: TemplateMediaSlot) => void;
}

const MediaSlotCarousel: React.FC<MediaSlotCarouselProps> = ({
  mediaSlots,
  confirmedAssets,
  selectedSlot,
  onSelectSlot,
}) => {
  if (mediaSlots.length === 0) {
    return null;
  }

  return (
    <div className="slot-carousel-container">
      <h2 className="text-xl font-black uppercase tracking-tight text-white/80 mb-4">Media Slots</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4">
        {mediaSlots.map((slot) => {
          const confirmedAsset = confirmedAssets.find(a => a.slotId === slot.slotId);
          return (
            <MediaSlotCard
              key={slot.slotId}
              slot={slot}
              confirmedAsset={confirmedAsset}
              isSelected={selectedSlot?.slotId === slot.slotId}
              onSelect={onSelectSlot}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MediaSlotCarousel;
