import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CompactChatComposerProps {
  onSendMessage: (text: string) => void;
  agentStatus: 'idle' | 'sending' | 'error';
  agentError: string | null;
  placeholder?: string;
}

export const CompactChatComposer: React.FC<CompactChatComposerProps> = ({
  onSendMessage,
  agentStatus,
  agentError,
  placeholder,
}) => {
  const [composerText, setComposerText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || agentStatus === 'sending') return;
    onSendMessage(composerText.trim());
    setComposerText('');
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/95 to-transparent p-3 sm:p-4">
      <div className="w-full max-w-lg mx-auto">
        {agentStatus === 'sending' && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2 text-[11px] sm:text-xs text-amber-400 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Agent is thinking...
          </div>
        )}
        {agentError && (
          <div className="mb-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] sm:text-xs text-red-400">
            {agentError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="glass-panel flex items-end gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl p-1 shadow-2xl transition-colors focus-within:border-amber-500/50">
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder || "Add business notes or creative direction..."}
            className="flex-1 min-h-[40px] sm:min-h-[44px] max-h-24 sm:max-h-32 bg-transparent resize-none py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!composerText.trim() || agentStatus === 'sending'}
            className="mb-1 mr-1 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-30 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
