import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  FileCheck2,
  AlignLeft
} from 'lucide-react';
import { JobQuestionPost, JobCategory } from '../../types';
import { ALL_CATEGORIES, ALL_YEARS } from '../../data/seedQuestions';

interface QuestionFormModalProps {
  isOpen: boolean;
  editingPost: JobQuestionPost | null;
  onClose: () => void;
  onSave: (post: JobQuestionPost) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  editingPost,
  onClose,
  onSave,
  onNotify,
}) => {
  const [organization, setOrganization] = useState('');
  const [postName, setPostName] = useState('');
  const [category, setCategory] = useState<JobCategory>('BCS');
  const [examYear, setExamYear] = useState<number>(2026);
  const [examDate, setExamDate] = useState('2026-03-15');
  const [examType, setExamType] = useState<'Preliminary (MCQ)' | 'Written' | 'Technical/Viva'>('Preliminary (MCQ)');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [totalMarks, setTotalMarks] = useState(100);
  const [summary, setSummary] = useState('');
  
  // Plain text question content (OPTIONAL)
  const [plainTextContent, setPlainTextContent] = useState('');

  // Media
  const [hasPdf, setHasPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileSize, setPdfFileSize] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [images, setImages] = useState<Array<{ id: string; url: string; caption: string }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPost) {
      setOrganization(editingPost.organization);
      setPostName(editingPost.postName);
      setCategory(editingPost.category);
      setExamYear(editingPost.examYear);
      setExamDate(editingPost.examDate);
      setExamType(editingPost.examType);
      setDurationMinutes(editingPost.durationMinutes);
      setTotalMarks(editingPost.totalMarks);
      setSummary(editingPost.summary || '');
      setPlainTextContent(editingPost.plainTextContent || '');
      setImages(editingPost.images || []);
      setHasPdf(Boolean(editingPost.hasPdf || editingPost.pdfDataUrl));
      setPdfFileName(editingPost.pdfFileName || '');
      setPdfFileSize(editingPost.pdfFileSize || '');
      setPdfDataUrl(editingPost.pdfDataUrl || '');
    } else {
      // Clean, empty default states for Add New Question
      setOrganization('');
      setPostName('');
      setCategory('BCS');
      setExamYear(2026);
      setExamDate(new Date().toISOString().split('T')[0]);
      setExamType('Preliminary (MCQ)');
      setDurationMinutes(120);
      setTotalMarks(100);
      setSummary('');
      setPlainTextContent(''); // Start empty by default!
      setImages([]);
      setHasPdf(false);
      setPdfFileName('');
      setPdfFileSize('');
      setPdfDataUrl('');
    }
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  // Handle image upload from file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: base64,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          },
        ]);
        onNotify(`Uploaded image: ${file.name}`, 'info');
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle PDF upload and store actual base64 file data
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        onNotify('Please select a valid PDF file (.pdf)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        setPdfDataUrl(base64);
        setHasPdf(true);
        setPdfFileName(file.name);
        setPdfFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
        onNotify(`Uploaded PDF: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePdf = () => {
    setPdfDataUrl('');
    setPdfFileName('');
    setPdfFileSize('');
    setHasPdf(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
    onNotify('Attached PDF removed', 'info');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    onNotify('Image removed', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization.trim()) {
      onNotify('Please enter the Organization name', 'error');
      return;
    }
    if (!postName.trim()) {
      onNotify('Please enter the Designation / Post name', 'error');
      return;
    }

    // Check that at least one form of question content or media is provided
    const hasText = Boolean(plainTextContent.trim());
    const hasMedia = hasPdf || images.length > 0;
    if (!hasText && !hasMedia) {
      onNotify('Please provide at least a PDF upload, question pictures, or plain text.', 'error');
      return;
    }

    const finalPost: JobQuestionPost = {
      id: editingPost 
        ? editingPost.id 
        : `${organization.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${postName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${examYear}-${Date.now().toString(36)}`,
      organization: organization.trim(),
      postName: postName.trim(),
      category,
      examYear: Number(examYear),
      examDate,
      examType,
      durationMinutes: Number(durationMinutes) || 90,
      totalMarks: Number(totalMarks) || 100,
      summary: summary.trim() || `Official examination question archive for ${organization.trim()} ${postName.trim()} recruitment exam.`,
      plainTextContent: plainTextContent.trim(),
      questions: editingPost?.questions || [],
      images,
      hasPdf: hasPdf || Boolean(pdfDataUrl),
      pdfFileName: pdfFileName.trim() || (hasPdf ? `${organization.replace(/\s+/g, '_')}_${examYear}.pdf` : undefined),
      pdfFileSize: pdfFileSize || (hasPdf ? '1.5 MB' : undefined),
      pdfDataUrl: pdfDataUrl || undefined,
      uploadDate: editingPost ? editingPost.uploadDate : new Date().toISOString().split('T')[0],
      viewsCount: editingPost ? editingPost.viewsCount : 1,
    };

    onSave(finalPost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400">
              Content Management Center
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display">
              {editingPost ? 'Edit Job Question Post' : 'Add New Job Question to Database'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Details Selectors */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Organization & Exam Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category (User Typed Input) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Category * (Type any category)
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Type category (e.g. BCS, Bank, Railway, Primary School, Medical)..."
                  list="category-options-list"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <datalist id="category-options-list">
                  {['BCS', 'Bank', 'Govt Job', 'IT/CSE', 'Teacher Recruitment', 'Railway', 'Defence/NSI', 'Ministry', 'Autonomous', 'Medical'].map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['BCS', 'Bank', 'Govt Job', 'Teacher Recruitment', 'Railway'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                        category.toLowerCase() === cat.toLowerCase()
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Ministry Name *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. BPSC, Bangladesh Bank, NSI, Pubali Bank"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Designation / Post */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Post Name *
                </label>
                <input
                  type="text"
                  required
                  value={postName}
                  onChange={(e) => setPostName(e.target.value)}
                  placeholder="e.g. 47th BCS Preliminary Exam, Assistant Director"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Exam Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Year *
                </label>
                <select
                  value={examYear}
                  onChange={(e) => setExamYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                >
                  {ALL_YEARS.filter((y) => y !== 'All').map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Preliminary (MCQ)">Preliminary (MCQ)</option>
                  <option value="Written">Written Examination</option>
                  <option value="Technical/Viva">Technical / Viva</option>
                </select>
              </div>

              {/* Duration & Marks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="360"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Scope Summary */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief Summary / Note
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Official question paper with solutions"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media Attachments (Pictures & PDF) - Placed prominently */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Upload Question PDF Document & Pictures
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload your actual exam PDF file (so seekers can download your exact uploaded PDF) and question pictures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* PDF Document Upload */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Upload Exam Question PDF File</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Upload your exact PDF file. When users click "Download PDF", this exact file will download.
                  </p>

                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={handlePdfFileChange}
                    accept="application/pdf,.pdf"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{hasPdf ? 'Change PDF File' : 'Select PDF File to Upload'}</span>
                  </button>
                </div>

                {hasPdf && pdfFileName && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-emerald-900 block truncate">
                          {pdfFileName}
                        </span>
                        {pdfFileSize && (
                          <span className="font-mono text-emerald-700 text-[11px]">
                            {pdfFileSize} · Ready for direct download
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePdf}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove PDF"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Picture / Image Upload */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Upload Pictures / Question Sheets (PNG, JPG)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Upload photos of question sheets, diagrams, or math problems.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Pictures to Upload</span>
                  </button>
                </div>

                {/* Previews */}
                {images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Uploaded Pictures ({images.length}):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((img, iIdx) => (
                        <div key={img.id} className="relative group rounded-lg border border-slate-200 overflow-hidden aspect-video bg-white shadow-sm">
                          <img
                            src={img.url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(iIdx)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Plain Text Question Input (OPTIONAL) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-indigo-600" />
                  <span>3. Question Paper Content (Optional - Plain Text)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional: If you have text/solutions you'd like to type or paste, you can add it here. Otherwise, leave it blank.
                </p>
              </div>
              {plainTextContent && (
                <button
                  type="button"
                  onClick={() => setPlainTextContent('')}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Clear Text
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={plainTextContent}
              onChange={(e) => setPlainTextContent(e.target.value)}
              placeholder="Optional: Type or paste question paper text, solutions, or notes here... (Leave empty if you only want to share PDF or pictures)"
              className="w-full p-4 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors"
            >
              {editingPost ? 'Save Changes to Database' : 'Publish & Save to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
