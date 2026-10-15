import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { JobQuestionPost } from '../../types';

interface DeleteSafetyModalProps {
  post: JobQuestionPost | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteSafetyModal: React.FC<DeleteSafetyModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
        
        {/* Warning Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Safety Verification Required
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Details */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="font-semibold text-slate-900 truncate">
            {post.organization}
          </div>
          <div className="text-slate-600 truncate">
            {post.postName} ({post.examYear})
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            ID: {post.id}
          </div>
        </div>

        {/* Warning Prompt exact match to requirement */}
        <p className="text-xs sm:text-sm text-rose-600 font-medium leading-relaxed">
          Warning: This action will permanently remove this question, uploaded images, and PDF files from the database instantly. Continue?
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(post.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Permanent Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
