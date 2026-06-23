import React, { useRef, useState } from 'react';
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import LegacyIcon from './LegacyIcon';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div
        className={`relative p-20 border-2 border-dashed transition-all duration-700 text-center space-y-10 glass-card rounded-[60px] overflow-hidden ${
          isDragging ? 'border-orange bg-orange/10 shadow-neon-orange scale-[1.01]' : 'border-white/10 hover:border-white/30'
        } ${isLoading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Scan Effect */}
        {isDragging && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange/10 to-transparent h-40 w-full animate-scan pointer-events-none" />}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        />

        <div className="relative">
          <div className="w-32 h-32 rounded-[40px] bg-white/5 flex items-center justify-center mx-auto text-orange transition-transform duration-700 group-hover:scale-110 border border-white/5 shadow-2xl">
            {isLoading ? <Loader2 size={64} className="animate-spin opacity-40" /> : <Upload size={64} strokeWidth={1} />}
          </div>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-[40px] border-2 border-orange/50 border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">
            {isLoading ? 'Ingesting Artifact' : 'Upload Artifact'}
          </h3>
          <p className="text-muted text-sm max-w-sm mx-auto font-bold uppercase tracking-tight leading-relaxed opacity-60">
            {isLoading ? 'Neural assets are being synchronized into the processing pipeline.' : 'Deploy high-resolution visual evidence into the AI synthesis engine.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted">
            <File size={14} className="text-orange/40" />
            LIMIT 50MB
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-muted">
            <AlertCircle size={14} className="text-orange/40" />
            4K NATIVE
          </div>
        </div>
      </div>


    </div>
  );
};

export default UploadDropzone;
