import React from 'react';
import MediaSlot from './MediaSlot';
import MediaSlotThumbnail from './MediaSlotThumbnail';
import AssistantMessagePanel from './AssistantMessagePanel';
import StepProgress from './StepProgress';
import type { MediaSlotState, CombinedContentDirection } from './types';
import LegacyIcon from '../../components/LegacyIcon';

interface GuidedMediaFlowProps {
  slots: MediaSlotState[];
  onUpload: (slotId: string, file: File) => void;
  onReplace: (slotId: string) => void;
  templateSlug?: string;
  direction?: CombinedContentDirection;
  brandMode: string;
}

const GuidedMediaFlow: React.FC<GuidedMediaFlowProps> = ({
  slots, onUpload, onReplace, templateSlug, direction, brandMode
}) => {
  const activeSlot = slots.find(s => s.status === 'active' || s.status === 'uploading' || s.status === 'analyzing' || s.status === 'error');
  const completeSlots = slots.filter(s => s.status === 'complete');
  const allComplete = slots.every(s => s.status === 'complete');

  const currentStepIndex = activeSlot ? slots.indexOf(activeSlot) : (allComplete ? slots.length : 0);


  const getAssistantMessage = () => {
    if (allComplete) {
      return {
        message: "Content direction ready",
        subMessage: "We've analyzed your photos. Review the direction below."
      };
    }
    if (activeSlot) {
      if (activeSlot.status === 'uploading') {
        return { message: `Uploading ${activeSlot.title}...`, isLoading: true };
      }
      if (activeSlot.status === 'analyzing') {
        return { message: `Analyzing ${activeSlot.title}...`, subMessage: "Scanning details and composition.", isLoading: true };
      }
      if (activeSlot.status === 'error') {
        return { message: "Transmission Error", subMessage: activeSlot.error || "Upload failed. Please try again." };
      }

      const lastCompleteIndex = slots.findLastIndex(s => s.status === 'complete');
      if (lastCompleteIndex >= 0) {
        const lastSlot = slots[lastCompleteIndex];
        return {
          message: `Excellent. ${lastSlot.analysis?.shortSummary || 'Asset captured.'}`,
          subMessage: activeSlot.prompt
        };
      }

      return {
        message: activeSlot.prompt,
        subMessage: "Follow the guidance for the best AI generation result."
      };
    }
    return { message: "Assistant Syncing...", isLoading: true };
  };

  const assistant = getAssistantMessage();

  return (
    <div className="space-y-6">
      <StepProgress
        slots={slots}
        currentStepIndex={currentStepIndex}
        brandMode={brandMode}
      />

      {/* Main Composer Area */}
      <div className="space-y-6">

        {/* Active Upload Slot */}
        {activeSlot && (
          <div className="animate-in zoom-in-95 duration-500">
            <MediaSlot
              slot={activeSlot}
              onUpload={(file) => onUpload(activeSlot.id, file)}
            />
          </div>
        )}

        {/* Completed Media Strip */}
        {completeSlots.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Completed Media</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green">{completeSlots.length}/{slots.length}</span>
            </div>
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 lg:gap-4 overflow-x-auto no-scrollbar pb-2">
              {slots.map(slot => (
                <MediaSlotThumbnail
                  key={slot.id}
                  slot={slot}
                  onReplace={() => onReplace(slot.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AssistantMessagePanel
        message={assistant.message}
        subMessage={assistant.subMessage}
        isLoading={assistant.isLoading}
      />
    </div>
  );
};

export default GuidedMediaFlow;
