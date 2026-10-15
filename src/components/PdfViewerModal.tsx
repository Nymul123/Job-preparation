import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText,
  Eye,
  AlignLeft
} from 'lucide-react';
import { JobQuestionPost } from '../types';
import { downloadJobQuestionPdf } from '../utils/pdfGenerator';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface PdfViewerModalProps {
  post: JobQuestionPost | null;
  onClose: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  post,
  onClose,
  onNotify,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'pdf' | 'reader'>('pdf');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;

  const handleDownload = () => {
    try {
      downloadJobQuestionPdf(post);
      onNotify(`Downloading ${post.pdfFileName || 'Question_Paper.pdf'}`, 'success');
    } catch {
      onNotify('Download failed', 'error');
    }
  };

  const hasPlainText = Boolean(post.plainTextContent && post.plainTextContent.trim());
  const hasStructuredQuestions = Boolean(post.questions && post.questions.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-6xl h-[94vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar: Clean, distraction-free (No Print, No Native PDF options) */}
        <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold truncate text-slate-100">
                {post.pdfFileName || `${post.organization} - ${post.postName} (${post.examYear}).pdf`}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                {post.organization} · {post.examYear} · Full PDF Document View
              </p>
            </div>
          </div>

          {/* Controls: View Tabs & Download */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher if text is also available */}
            {(hasPlainText || hasStructuredQuestions) && (
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setActiveViewTab('pdf')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeViewTab === 'pdf'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>PDF View</span>
                </button>
                <button
                  onClick={() => setActiveViewTab('reader')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeViewTab === 'reader'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3 h-3" />
                  <span>Text View</span>
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              title="Download PDF Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full PDF View Area: Students can read and scroll the full PDF directly without downloading */}
        <div className="flex-1 bg-slate-900 p-2 sm:p-4 overflow-hidden flex flex-col items-center justify-center relative">
          {activeViewTab === 'pdf' ? (
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl relative flex flex-col">
              <PdfCanvasViewer post={post} />
            </div>
          ) : (
            /* Formatted Reader View for seamless mobile reading */
            <div className="w-full h-full rounded-xl overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 shadow-2xl border border-slate-700 space-y-6">
              <div className="border-b border-slate-200 pb-4 text-center space-y-1">
                <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                  {post.category} · {post.examType}
                </span>
                <h1 className="text-lg sm:text-2xl font-bold font-display text-slate-900">
                  {post.organization}
                </h1>
                <p className="text-sm font-semibold text-slate-700">
                  {post.postName} ({post.examYear})
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-mono pt-1">
                  <span>Duration: {post.durationMinutes} Mins</span>
                  <span>·</span>
                  <span>Total Marks: {post.totalMarks}</span>
                </div>
              </div>

              {hasPlainText && (
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed max-w-4xl mx-auto">
                  {post.plainTextContent}
                </div>
              )}

              {hasStructuredQuestions && (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {post.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                      <div className="font-semibold text-slate-900 mb-1.5">
                        Q{q.questionNumber || idx + 1}. {q.questionText}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="p-2 rounded border border-slate-200 bg-white text-xs">
                              <span className="font-bold mr-1.5">{['A', 'B', 'C', 'D'][oIdx] || oIdx + 1})</span>
                              {opt.replace(/^[A-D]\)\s*/i, '')}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.answerExplanation && (
                        <div className="mt-2 p-2.5 rounded bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950">
                          <strong>Solution: </strong>{q.answerExplanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
