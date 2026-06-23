import React, { useState } from 'react';
import { Paperclip, Send, Loader2 } from 'lucide-react';

interface CompactChatComposerProps {
  onSendMessage: (text: string) => void;
  onAttach?: () => void;
  agentStatus: 'idle' | 'sending' | 'error';
  agentError: string | null;
  placeholder?: string;
}

export const CompactChatComposer: React.FC<CompactChatComposerProps> = ({
  onSendMessage,
  onAttach,
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
    <div className="sticky bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-[#06070B] via-[#06070B]/95 to-transparent p-3">
      <div className="w-full">
        {agentStatus === 'sending' && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2 text-[11px] text-[#FB923C] animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Agent is thinking…
          </div>
        )}
        {agentError && (
          <div className="mb-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400">
            {agentError}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-[#111827] px-2 py-1.5 shadow-2xl transition-colors focus-within:border-[#F97316]/40"
        >
          {/* Attachment icon */}
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              aria-label="Attach file"
              className="mb-1 p-2 rounded-xl text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          )}
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder || 'Ask the SMM Agent…'}
            className="flex-1 min-h-[40px] max-h-28 bg-transparent resize-none py-2 px-2 text-sm text-white placeholder-white/30 focus:outline-none"
            rows={1}
          />
          {/* Orange send button */}
          <button
            type="submit"
            disabled={!composerText.trim() || agentStatus === 'sending'}
            aria-label="Send message"
            className="mb-1 p-2.5 rounded-xl bg-[#F97316] text-white hover:bg-[#FB923C] disabled:opacity-30 transition-all flex items-center justify-center shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
