import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  slug: string;
  type: 'menu' | 'wall';
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ slug, type }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const baseUrl = window.location.origin;
    const prefix = type === 'menu' ? 'm' : 'w';
    const url = `${baseUrl}/#/${prefix}/${slug}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        copied
          ? 'bg-green-500 text-obsidian shadow-lg shadow-green-500/20'
          : 'bg-white/5 hover:bg-white/10 text-muted hover:text-white'
      }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy Link'}
    </button>
  );
};

export default CopyLinkButton;
