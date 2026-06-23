import React, { useState } from 'react';
import { CheckCircle, Edit, RefreshCw, Save } from 'lucide-react';
import type { TemplateMediaSlot } from './types';

interface AnalysisReviewCardProps {
  asset: any;
  onConfirm: (description: string) => void;
  onEdit: (description: string) => void;
  onRetake: () => void;
  isSaving?: boolean;
  selectedSlot: TemplateMediaSlot | null;
}

const AssetReviewDialog: React.FC<AnalysisReviewCardProps> = ({
  asset,
  onConfirm,
  onEdit,
  onRetake,
  isSaving,
  selectedSlot,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(asset.analysis?.description || '');

  const handleSave = () => {
    onConfirm(editedDescription);
    setIsEditing(false);
  };

  const previewUrl = asset.previewUrl || asset.viewUrl || asset.url;
  if (!previewUrl) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8">
      <div className="aspect-[3/4] rounded-[44px] overflow-hidden bg-black border border-white/10 shadow-2xl relative group">
        <img src={previewUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" alt="Preview" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange/5 to-transparent h-20 w-full animate-scan pointer-events-none" />
      </div>
      <div className="camera-panel-strong p-6 rounded-[32px] space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange">AI analyzed your photo</div>
          {selectedSlot && <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">For slot: {selectedSlot.label}</div>}
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">
            {asset.analysis?.title || 'Untitled Capture'}
          </h3>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-[24px] p-4 text-sm focus:border-orange transition-all outline-none resize-none shadow-inner"
              rows={4}
            />
          ) : (
            <p className="text-sm text-white/80 leading-relaxed">
              {editedDescription || 'No description available.'}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-4 border-t border-white/5">
          {isEditing ? (
            <button onClick={handleSave} disabled={isSaving} className="btn-orange flex-1">
              <Save size={16} /> Save & Confirm
            </button>
          ) : (
            <button onClick={() => onConfirm(editedDescription)} disabled={isSaving} className="btn-orange flex-1">
              <CheckCircle size={16} /> Confirm for this shot
            </button>
          )}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn">
              <Edit size={16} /> Edit
            </button>
          )}
          <button
            onClick={onRetake}
            className="btn"
          >
            <RefreshCw size={16} /> Retake
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetReviewDialog;
