import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  GraduationCap
} from 'lucide-react';
import { ExamSyllabus, JobQuestionPost } from '../../types';

interface SyllabusPortalProps {
  syllabuses: ExamSyllabus[];
  onOpenPdfViewer: (post: JobQuestionPost) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SyllabusPortal: React.FC<SyllabusPortalProps> = ({
  syllabuses,
  onOpenPdfViewer,
  onNotify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic unique categories
  const categoriesList = useMemo(() => {
    const base = ['All', 'BCS', 'Bank', 'Govt Job', 'Teacher Recruitment', 'IT/CSE'];
    const dynamic = syllabuses.map(s => s.category).filter(Boolean);
    return Array.from(new Set([...base, ...dynamic]));
  }, [syllabuses]);

  // Filtered list
  const filteredSyllabuses = useMemo(() => {
    return syllabuses.filter((s) => {
      if (selectedCategory !== 'All' && s.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = s.title.toLowerCase().includes(q);
        const inOrg = s.organization.toLowerCase().includes(q);
        const inCat = s.category.toLowerCase().includes(q);
        const inContent = (s.plainTextContent || '').toLowerCase().includes(q);
        if (!inTitle && !inOrg && !inCat && !inContent) return false;
      }
      return true;
    });
  }, [syllabuses, selectedCategory, searchQuery]);

  const handleCopySyllabus = async (s: ExamSyllabus) => {
    let text = `==============================\n${s.title}\nOrganization: ${s.organization} | Category: ${s.category}\nTotal Marks: ${s.totalMarks} Marks\n==============================\n\n`;
    if (s.markBreakdown && s.markBreakdown.length > 0) {
      text += `MARKS DISTRIBUTION:\n`;
      s.markBreakdown.forEach((m) => {
        text += `- ${m.subject}: ${m.marks} Marks (${m.topics || ''})\n`;
      });
      text += `\n`;
    }
    if (s.plainTextContent) {
      text += s.plainTextContent;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(s.id);
      onNotify('Syllabus copied to clipboard', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onNotify('Failed to copy text', 'error');
    }
  };

  const handleViewPdf = (s: ExamSyllabus) => {
    // Transform into JobQuestionPost structure so our Page-by-Page PDF viewer handles it seamlessly
    const dummyPost: JobQuestionPost = {
      id: s.id,
      organization: s.organization,
      postName: s.title,
      category: s.category,
      examYear: 2026,
      examDate: s.uploadDate,
      examType: s.examType === 'Preliminary' ? 'Preliminary (MCQ)' : 'Written',
      durationMinutes: 120,
      totalMarks: s.totalMarks,
      summary: `Official Examination Syllabus & Marks Distribution for ${s.title}`,
      plainTextContent: s.plainTextContent || (s.markBreakdown ? s.markBreakdown.map(m => `${m.subject}: ${m.marks} Marks\n${m.topics || ''}`).join('\n\n') : ''),
      questions: [],
      images: [],
      hasPdf: Boolean(s.pdfDataUrl),
      pdfDataUrl: s.pdfDataUrl,
      pdfFileName: s.pdfFileName || `${s.organization}_Syllabus.pdf`,
      pdfFileSize: 'Syllabus PDF',
      uploadDate: s.uploadDate,
    };
    onOpenPdfViewer(dummyPost);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Competitive Examination Curriculums</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
          Exam Syllabus & Marks Distribution
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Official recruitment test patterns, subject-wise marks distribution, and syllabus guidelines for BCS, Central Bank, Ministries, and Primary Teachers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'All' ? 'All Syllabuses' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syllabus by exam name, organization, or topic..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Syllabus Cards Grid */}
      {filteredSyllabuses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display">বর্তমানে কোনো সিলেবাস পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            অ্যাডমিন প্যানেল থেকে বিভিন্ন পরীক্ষা ও ক্যাটাগরি অনুযায়ী নতুন সিলেবাস ও বিষয়ভিত্তিক মানবণ্টন আপলোড করা হলে তা এখানে শিক্ষার্থীরা দেখতে পারবেন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSyllabuses.map((syl) => {
            const isExpanded = expandedId === syl.id;
            return (
              <div 
                key={syl.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">
                      {syl.category} · {syl.examType}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {syl.totalMarks} Marks
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-snug">
                    {syl.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {syl.organization} · Uploaded: {syl.uploadDate}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  
                  {/* Mark breakdown items */}
                  {syl.markBreakdown && syl.markBreakdown.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">
                        Subject-wise Marks Distribution:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {syl.markBreakdown.slice(0, isExpanded ? undefined : 4).map((m, mIdx) => (
                          <div 
                            key={mIdx} 
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between text-xs gap-3"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 block">{m.subject}</span>
                              {m.topics && (
                                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                                  {m.topics}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-indigo-600 shrink-0">
                              {m.marks} M
                            </span>
                          </div>
                        ))}
                      </div>

                      {syl.markBreakdown.length > 4 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : syl.id)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 pt-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>Show All {syl.markBreakdown.length} Subjects</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Plain Text guidelines */}
                  {syl.plainTextContent && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Curriculum Outline & Details:
                      </span>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-sans whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                        {syl.plainTextContent}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopySyllabus(syl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 transition-colors shadow-sm"
                  >
                    {copiedId === syl.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Syllabus</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleViewPdf(syl)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Syllabus PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
