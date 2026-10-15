import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, RotateCcw, Award, Clock } from 'lucide-react';
import { JobQuestionPost } from '../types';

interface PracticeQuizModalProps {
  post: JobQuestionPost | null;
  onClose: () => void;
}

export const PracticeQuizModal: React.FC<PracticeQuizModalProps> = ({
  post,
  onClose,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);

  useEffect(() => {
    if (post) {
      setSelectedAnswers({});
      setIsSubmitted(false);
      setSecondsRemaining((post.questions.length || 5) * 60);
    }
  }, [post]);

  useEffect(() => {
    if (isSubmitted || !post) return;
    const interval = setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, post]);

  if (!post) return null;

  const handleSelect = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const mcqQuestions = post.questions.filter((q) => q.options && q.options.length > 0);

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  mcqQuestions.forEach((q) => {
    const sel = selectedAnswers[q.id];
    if (sel === undefined) {
      skippedCount++;
    } else if (sel === q.correctOption) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const calculatedScore = Math.max(0, correctCount * 1 - wrongCount * 0.25);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400">
              Interactive Self-Test Mode
            </span>
            <h3 className="text-sm sm:text-base font-bold font-display truncate">
              {post.organization} — {post.postName}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Close practice quiz"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quiz Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Result Card when submitted */}
          {isSubmitted && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900 font-display">
                    Exam Performance Summary
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setIsSubmitted(false);
                    setSecondsRemaining((post.questions.length || 5) * 60);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retake Test</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="block text-slate-400">Final Score</span>
                  <strong className="text-base font-mono text-indigo-600 tabular-nums">
                    {calculatedScore.toFixed(2)}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="block text-emerald-600">Correct</span>
                  <strong className="text-base font-mono text-emerald-700 tabular-nums">
                    {correctCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="block text-rose-600">Incorrect</span>
                  <strong className="text-base font-mono text-rose-700 tabular-nums">
                    {wrongCount}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="block text-slate-400">Skipped</span>
                  <strong className="text-base font-mono text-slate-700 tabular-nums">
                    {skippedCount}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {mcqQuestions.map((q, idx) => {
              const selected = selectedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      Question {q.questionNumber || idx + 1}
                    </span>
                    {q.subject && (
                      <span className="text-slate-500 font-medium">
                        {q.subject}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options?.map((opt, oIdx) => {
                      const isChosen = selected === oIdx;
                      const isCorrect = q.correctOption === oIdx;

                      let style = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400';

                      if (isSubmitted) {
                        if (isCorrect) {
                          style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                        } else if (isChosen && !isCorrect) {
                          style = 'bg-rose-50 border-rose-500 text-rose-900';
                        } else {
                          style = 'bg-slate-50 border-slate-200 opacity-60 text-slate-500';
                        }
                      } else if (isChosen) {
                        style = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isSubmitted}
                          onClick={() => handleSelect(q.id, oIdx)}
                          className={`text-left p-3 rounded-lg border text-xs sm:text-sm flex items-center justify-between transition-colors ${style}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                              {['A', 'B', 'C', 'D', 'E'][oIdx]}
                            </span>
                            <span>{opt.replace(/^[A-E]\)\s*/i, '')}</span>
                          </div>

                          {isSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isSubmitted && isChosen && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && q.answerExplanation && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                      <strong className="text-indigo-950 font-semibold">
                        Explanation:
                      </strong>{' '}
                      {q.answerExplanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Answered {Object.keys(selectedAnswers).length} of {mcqQuestions.length} questions
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
            >
              Submit & Review Results
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              Finish & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
