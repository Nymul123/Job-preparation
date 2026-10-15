import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Maximize2, 
  Bookmark, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Clock,
  Award,
  FileCheck,
  AlignLeft
} from 'lucide-react';
import { JobQuestionPost } from '../types';
import { downloadJobQuestionPdf } from '../utils/pdfGenerator';

interface QuestionCardProps {
  post: JobQuestionPost;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenPdfViewer: (post: JobQuestionPost) => void;
  onOpenImageLightbox: (imageUrl: string, caption: string) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
  onStartPractice?: (post: JobQuestionPost) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  post,
  isBookmarked,
  onToggleBookmark,
  onOpenPdfViewer,
  onOpenImageLightbox,
  onNotify,
  onStartPractice,
}) => {
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  const toggleQuestionAnswer = (qId: string) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setUserSelectedOptions((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const handleCopyText = async () => {
    let textToCopy = `==============================\n${post.organization.toUpperCase()}\n${post.postName} (${post.examYear})\nCategory: ${post.category} | Exam Type: ${post.examType}\nDuration: ${post.durationMinutes} Mins | Marks: ${post.totalMarks}\n==============================\n\n`;

    if (post.plainTextContent && post.plainTextContent.trim()) {
      textToCopy += post.plainTextContent + '\n';
    } else if (post.questions && post.questions.length > 0) {
      post.questions.forEach((q, idx) => {
        textToCopy += `Q${q.questionNumber || idx + 1}: ${q.questionText}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt) => {
            textToCopy += `  ${opt}\n`;
          });
        }
        if (q.correctOption !== undefined && q.options && q.options[q.correctOption]) {
          textToCopy += `Correct Answer: Option ${['A', 'B', 'C', 'D'][q.correctOption]} (${q.options[q.correctOption]})\n`;
        }
        if (q.answerExplanation) {
          textToCopy += `Explanation: ${q.answerExplanation}\n`;
        }
        textToCopy += `\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onNotify('Question paper text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('Could not copy to clipboard. Please copy manually.', 'error');
    }
  };

  const handleDownloadPdf = () => {
    try {
      downloadJobQuestionPdf(post);
      onNotify(`Downloading ${post.pdfFileName || 'Question_Paper.pdf'}...`, 'success');
    } catch (err) {
      console.error(err);
      onNotify('Failed to generate PDF. Please try again.', 'error');
    }
  };

  const hasStructuredQuestions = post.questions && post.questions.length > 0;
  const hasPlainText = Boolean(post.plainTextContent && post.plainTextContent.trim());

  return (
    <article className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      
      {/* Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            {/* Zero-Pill metadata: unboxed text with subtle typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mb-1.5">
              <span className="text-indigo-600 font-semibold uppercase tracking-wider">
                {post.category}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono tabular-nums">{post.examYear}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{post.examType}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono tabular-nums">{post.durationMinutes}m</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-3 h-3 text-slate-400" />
                <span className="font-mono tabular-nums">{post.totalMarks} Marks</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
              {post.organization}
            </h2>
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 mt-0.5">
              {post.postName}
            </h3>
            
            {post.summary && (
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                {post.summary}
              </p>
            )}
          </div>

          {/* Action buttons: Bookmark & Copy */}
          <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
            <button
              onClick={() => onToggleBookmark(post.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={isBookmarked ? 'Remove from Saved' : 'Bookmark Question Set'}
              aria-label="Bookmark Question"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleCopyText}
              className="p-2 rounded-lg border bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Copy Formatted Question Text & Solutions"
              aria-label="Copy question text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            
            {onStartPractice && hasStructuredQuestions && post.questions.some(q => q.options && q.options.length > 0) && (
              <button
                onClick={() => onStartPractice(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                title="Practice as a timed quiz"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Test Mode</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-6">

        {/* 1. Plain Text Question Content View */}
        {hasPlainText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-indigo-600" />
                Question Paper & Solutions (Plain Text)
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Text</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
              {post.plainTextContent}
            </div>
          </div>
        )}

        {/* 2. Structured Questions (if available and not overridden) */}
        {!hasPlainText && hasStructuredQuestions && (
          <div className="space-y-5">
            {/* Global Answer Visibility Toggle Bar */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-semibold text-slate-700">
                  Exam Questions ({post.questions.length})
                </span>
                <span aria-hidden="true">·</span>
                <span>Click any option to self-check</span>
              </div>

              <button
                onClick={() => setShowAllAnswers(!showAllAnswers)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAllAnswers ? 'Hide All Solutions' : 'Reveal All Solutions'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {post.questions.map((q, idx) => {
                const isAnswerVisible = showAllAnswers || revealedQuestions[q.id];
                const selectedOpt = userSelectedOptions[q.id];

                return (
                  <div 
                    key={q.id || idx}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          Q{q.questionNumber || idx + 1}.
                        </span>
                        {q.subject && (
                          <span className="text-slate-600 font-medium">
                            {q.subject}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleQuestionAnswer(q.id)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium"
                      >
                        {isAnswerVisible ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide Key</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Show Key</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOpt === oIdx;
                          const isCorrect = q.correctOption === oIdx;
                          
                          let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300';

                          if (isAnswerVisible) {
                            if (isCorrect) {
                              optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optionStyle = 'bg-rose-50 border-rose-300 text-rose-800';
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold';
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(q.id, oIdx)}
                              className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${optionStyle}`}
                            >
                              <span className="font-mono font-bold shrink-0 text-slate-500">
                                {['A', 'B', 'C', 'D', 'E'][oIdx] || `${oIdx + 1}`}
                              </span>
                              <span className="flex-1">{opt.replace(/^[A-E]\)\s*/i, '')}</span>
                              {isAnswerVisible && isCorrect && (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isAnswerVisible && q.answerExplanation && (
                      <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-slate-800 leading-relaxed animate-in fade-in">
                        <div className="font-semibold text-indigo-900 mb-1 flex items-center justify-between">
                          <span>Detailed Solution & Analysis:</span>
                          {q.correctOption !== undefined && (
                            <span className="font-mono text-emerald-700 font-bold">
                              Answer: Option {['A', 'B', 'C', 'D', 'E'][q.correctOption]}
                            </span>
                          )}
                        </div>
                        <p>{q.answerExplanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thumbnail Grid for Image / Picture Attachments */}
        {post.images && post.images.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Scanned Question Paper & Diagram Attachments ({post.images.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {post.images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onOpenImageLightbox(img.url, img.caption)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center"
                >
                  <img
                    src={img.url}
                    alt={img.caption || 'Question paper attachment'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5 backdrop-blur-[1px]">
                    <Maximize2 className="w-4 h-4" />
                    <span>Zoom Image</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Embedded PDF Viewer Component & Download Banner */}
        {(post.hasPdf || hasPlainText || hasStructuredQuestions) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Official Exam PDF Document
                  </span>
                  <span className="text-xs font-mono text-emerald-700">
                    {post.pdfFileSize || 'Verified Document'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium truncate max-w-md">
                  {post.pdfFileName || `${post.organization}_${post.postName}_${post.examYear}.pdf`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => onOpenPdfViewer(post)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm cursor-pointer"
                title="View full PDF document on screen without downloading"
              >
                <Eye className="w-4 h-4" />
                <span>View Full PDF (No Download Required)</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-sm transition-colors"
                title="Save PDF file to device"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
