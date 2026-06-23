import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-md glass-card rounded-[40px] overflow-hidden shadow-glass animate-in zoom-in-95 duration-300">
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              variant === 'danger' ? 'bg-red/10 text-red' : 'bg-orange/10 text-orange'
            }`}>
              <AlertTriangle size={28} />
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl border border-white/5 transition-colors text-muted hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{title}</h2>
            <p className="text-muted text-sm leading-relaxed font-medium">{message}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/5 transition-all order-2 sm:order-1"
            >
              Back
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all order-1 sm:order-2 ${
                variant === 'danger' ? 'bg-red text-white hover:bg-red/90' : 'bg-orange text-obsidian hover:scale-105'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
