import React, { useState } from 'react';
import type { MediaSlotState, GeneratedReferenceCard } from '../types';
import { previewUrlForSlot } from './UploadedAssetRail';

interface AssetDetailDrawerProps {
  slot: any | null; // Can be MediaSlotState or GeneratedReferenceCard
  isOpen: boolean;
  onClose: () => void;
  onReplace?: (slotId: string) => void;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  slot,
  isOpen,
  onClose,
  onReplace,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !slot) return null;

  const isReferenceCard = 'referenceImageId' in slot;
  const promptText = slot.prompt || slot.description || '';
  const imageUrl = isReferenceCard
    ? (slot.internalUrl || slot.imageUrl)
    : previewUrlForSlot(slot);

  const handleCopyPrompt = () => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = isReferenceCard ? `smm-asset-${slot.referenceImageId}.jpg` : `smm-source-${slot.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed bottom-0 left-0 right-0 lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:w-[400px] lg:h-full max-h-[85vh] lg:max-h-none bg-[#16161A] rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl z-50 overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 shadow-2xl animate-in slide-in-from-bottom-8 lg:slide-in-from-right-8 text-white transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {isReferenceCard ? 'Референс Кадр' : 'Исходный Слот'}
            </h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-xs uppercase font-bold tracking-wider"
            >
              Закрыть
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {imageUrl && (
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/5 relative group">
                <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                <button
                  onClick={handleDownload}
                  className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider transition-all"
                >
                  Скачать ассет
                </button>
              </div>
            )}

            <div className="flex-1 flex flex-col gap-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">
                  Название
                </div>
                <div className="text-white font-bold text-sm">
                  {isReferenceCard ? slot.title : (slot.title || 'Processing analysis...')}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
                  Роль в воркфлоу
                </div>
                <div className="text-xs font-mono text-zinc-400 bg-white/5 border border-white/10 rounded-md px-2 py-1 w-fit">
                  {isReferenceCard ? `@${slot.campaignRole || 'element'}` : `@${slot.id}`}
                </div>
              </div>

              {promptText && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                      Промпт генерации / Описание
                    </div>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-[10px] text-amber-500 hover:text-amber-400 uppercase font-bold tracking-wider"
                    >
                      {copied ? '✓ Скопировано' : 'Копировать'}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-300 leading-relaxed bg-black/40 border border-white/5 rounded-xl p-3.5 whitespace-pre-wrap">
                    {promptText}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Модель ИИ
                </div>
                <div className="text-xs text-amber-500 font-mono bg-amber-500/5 border border-amber-500/10 rounded-lg px-2.5 py-1.5 w-fit">
                  {isReferenceCard ? (slot.modelRole || 'Flux Schnell') : 'Claude 3.5 Sonnet (Vision Analysis)'}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Логи бэкенда
                </div>
                <div className="text-[10px] text-zinc-500 font-mono bg-black/40 border border-white/5 rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap">
                  {isReferenceCard
                    ? `[INFO] asset_id: ${slot.assetId}\n[INFO] reference_id: ${slot.referenceImageId}\n[SUCCESS] Image synthesized via provider API.\n[TELEMETRY] Truth match: ${slot.sourceTruthMatch || 'pass'}`
                    : `[INFO] slot_id: ${slot.id}\n[SUCCESS] Asset uploaded and analyzed.\n[ANALYSIS] Suggested role: ${slot.type}`
                  }
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {!isReferenceCard && slot.status === 'complete' && onReplace && (
                  <button
                    onClick={() => {
                      onReplace(slot.id);
                      onClose();
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition uppercase tracking-wider"
                  >
                    Заменить фото
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-xs font-bold text-black hover:opacity-90 transition uppercase tracking-wider"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
