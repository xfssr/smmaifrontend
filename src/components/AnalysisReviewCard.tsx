import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Edit3, Save, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import LegacyIcon from './LegacyIcon';

interface AnalysisReviewCardProps {
  analysis: {
    status: 'accepted' | 'needs_retake' | 'rejected' | 'failed';
    description: string;
    rejectionReason?: string;
    confidence: number;
  };
  onConfirm: (description: string) => void;
  onEdit: (description: string) => void;
  onRetake: () => void;
  isSaving?: boolean;
}

const AnalysisReviewCard: React.FC<AnalysisReviewCardProps> = ({
  analysis, onConfirm, onEdit, onRetake, isSaving
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(analysis.description);

  useEffect(() => {
    setDescription(analysis.description);
  }, [analysis.description]);

  const isAccepted = analysis.status === 'accepted';
  const isFailed = analysis.status === 'failed' || analysis.status === 'rejected';
  const isNeedsRetake = analysis.status === 'needs_retake';

  return (
    <div className={`p-10 glass-card space-y-12 animate-in slide-in-from-right-8 duration-700 relative overflow-hidden flex flex-col h-full ${
      isAccepted ? 'border-green/20' : (isFailed || isNeedsRetake) ? 'border-red/20' : ''
    }`}>
      {/* Neural Scan Line Animation */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange to-transparent animate-scan z-20 pointer-events-none opacity-50" />

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-700 border border-white/5 ${
            isAccepted ? 'bg-green/10 text-green shadow-[0_0_40px_rgba(34,197,94,0.2)]' :
            isNeedsRetake ? 'bg-amber/10 text-amber shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'bg-red/10 text-red shadow-[0_0_40px_rgba(239,68,68,0.2)]'
          }`}>
            {isAccepted ? <CheckCircle2 size={40} /> : isNeedsRetake ? <RefreshCw size={40} /> : <XCircle size={40} />}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted mb-1 opacity-60">Neural Intake Analysis</div>
            <h3 className="font-black text-3xl uppercase tracking-tighter leading-none">
              {analysis.status.replace('_', ' ')}
            </h3>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted mb-1 opacity-60">Confidence</div>
          <div className="text-3xl font-black text-orange tracking-tighter leading-none">
            {Math.round(analysis.confidence * 100)}<span className="text-sm ml-1 opacity-40">%</span>
          </div>
          <div className="w-24 h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden border border-white/5">
            <div
              className="h-full bg-orange transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ width: `${analysis.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {analysis.rejectionReason && (
        <div className="p-8 rounded-[32px] bg-red/5 border border-red/10 flex items-start gap-5 text-red animate-in fade-in duration-500">
          <AlertCircle size={24} className="flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Critical Insight</div>
            <p className="text-sm font-black uppercase tracking-tight leading-relaxed">{analysis.rejectionReason}</p>
          </div>
        </div>
      )}

      <div className="space-y-6 flex-1">
        <div className="flex items-center justify-between px-2">
          <label className="text-[10px] font-black uppercase tracking-[0.5em] text-muted opacity-60">Synthesized Manifest</label>
          {!isEditing && isAccepted && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-black uppercase tracking-widest text-orange hover:underline flex items-center gap-2"
            >
              <Edit3 size={14} /> Override Description
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-obsidian border border-white/10 rounded-[32px] p-8 text-base font-bold uppercase tracking-tight focus:border-orange transition-all outline-none resize-none shadow-inner"
              rows={5}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  onEdit(description);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="btn-orange flex-1 py-5 text-xs tracking-widest uppercase font-black"
              >
                <Save size={18} /> Update Manifest
              </button>
              <button onClick={() => setIsEditing(false)} className="px-8 py-5 rounded-[24px] bg-white/5 font-black uppercase tracking-widest text-xs border border-white/5 hover:bg-white/10 transition-all">Abort</button>
            </div>
          </div>
        ) : (
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-white/[0.01] blur-2xl group-hover:bg-orange/[0.02] transition-all rounded-[40px]" />
            <div className="relative h-full text-xl font-bold leading-relaxed text-white p-10 rounded-[40px] border border-white/5 bg-white/[0.02] flex items-center justify-center text-center italic shadow-2xl">
              <span className="opacity-40 text-4xl font-serif absolute top-6 left-8">“</span>
              <span className="relative z-10">{analysis.description || 'System calibrating visual context...'}</span>
              <span className="opacity-40 text-4xl font-serif absolute bottom-4 right-8">”</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-10 border-t border-white/5">
        {isAccepted && !isEditing ? (
          <button
            onClick={() => onConfirm(description)}
            disabled={isSaving}
            className="btn-orange w-full py-6 text-sm tracking-[0.2em] font-black"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <><LegacyIcon name="magic" size={20} /> CONFIRM NEURAL ASSET</>}
          </button>
        ) : !isEditing && (
          <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted leading-relaxed">
              Asset does not meet neural stability thresholds.<br/>Please capture a new sample.
            </p>
          </div>
        )}
        <button
          onClick={onRetake}
          className={`w-full py-6 rounded-[28px] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border ${
            isAccepted ? 'bg-white/5 border-white/5 text-muted hover:bg-white/10' : 'bg-orange/10 border-orange/20 text-orange hover:bg-orange/20'
          }`}
        >
          {isAccepted ? 'RE-SCAN ENVIRONMENT' : 'RE-DEPLOY ASSET'} <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnalysisReviewCard;
