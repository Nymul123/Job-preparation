import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, Plus, BookOpen, Layers } from 'lucide-react';
import { ExamSyllabus } from '../../types';

interface SyllabusFormModalProps {
  isOpen: boolean;
  editingSyllabus: ExamSyllabus | null;
  onClose: () => void;
  onSave: (syllabus: ExamSyllabus) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SyllabusFormModal: React.FC<SyllabusFormModalProps> = ({
  isOpen,
  editingSyllabus,
  onClose,
  onSave,
  onNotify,
}) => {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('BCS');
  const [examType, setExamType] = useState<'Preliminary' | 'Written' | 'Special' | 'General'>('Preliminary');
  const [totalMarks, setTotalMarks] = useState<number>(200);
  const [plainTextContent, setPlainTextContent] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [markBreakdown, setMarkBreakdown] = useState<Array<{ subject: string; marks: number; topics?: string }>>([]);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSyllabus) {
      setTitle(editingSyllabus.title);
      setOrganization(editingSyllabus.organization);
      setCategory(editingSyllabus.category);
      setExamType(editingSyllabus.examType);
      setTotalMarks(editingSyllabus.totalMarks);
      setPlainTextContent(editingSyllabus.plainTextContent || '');
      setPdfDataUrl(editingSyllabus.pdfDataUrl || '');
      setPdfFileName(editingSyllabus.pdfFileName || '');
      setMarkBreakdown(editingSyllabus.markBreakdown || []);
    } else {
      setTitle('');
      setOrganization('');
      setCategory('BCS');
      setExamType('Preliminary');
      setTotalMarks(200);
      setPlainTextContent('');
      setPdfDataUrl('');
      setPdfFileName('');
      setMarkBreakdown([
        { subject: 'Bangla Language & Literature', marks: 35, topics: 'Grammar and Literature' },
        { subject: 'English Language & Literature', marks: 35, topics: 'Grammar and Literature' },
        { subject: 'General Knowledge & Science', marks: 50, topics: 'Bangladesh and International' }
      ]);
    }
  }, [editingSyllabus, isOpen]);

  if (!isOpen) return null;

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        onNotify('Please select a valid PDF file', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setPdfDataUrl(base64);
        setPdfFileName(file.name);
        onNotify(`Uploaded syllabus PDF: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubjectRow = () => {
    setMarkBreakdown(prev => [...prev, { subject: '', marks: 10, topics: '' }]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    setMarkBreakdown(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index: number, field: 'subject' | 'marks' | 'topics', value: any) => {
    setMarkBreakdown(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify('Please enter syllabus title', 'error');
      return;
    }
    if (!organization.trim()) {
      onNotify('Please enter organization name', 'error');
      return;
    }

    const finalSyllabus: ExamSyllabus = {
      id: editingSyllabus ? editingSyllabus.id : `syl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      organization: organization.trim(),
      category: category.trim() || 'General',
      examType,
      totalMarks: Number(totalMarks) || 100,
      markBreakdown: markBreakdown.filter(m => m.subject.trim() !== ''),
      plainTextContent: plainTextContent.trim() || undefined,
      pdfDataUrl: pdfDataUrl || undefined,
      pdfFileName: pdfFileName || undefined,
      uploadDate: editingSyllabus ? editingSyllabus.uploadDate : new Date().toISOString().split('T')[0],
    };

    onSave(finalSyllabus);
    onNotify(editingSyllabus ? 'Syllabus updated' : 'New syllabus published successfully', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-400">
                Syllabus Management
              </span>
              <h2 className="text-base sm:text-lg font-bold font-display">
                {editingSyllabus ? 'Edit Exam Syllabus' : 'Add New Exam Syllabus & Marks Distribution'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Syllabus Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 47th BCS Preliminary Examination Syllabus & Marks Distribution"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Examination Body / Authority *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. BPSC, Bangladesh Bank, DPE"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category (Typed input) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. BCS, Bank, Primary Teacher, IT/CSE"
                list="syllabus-cat-list"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="syllabus-cat-list">
                {['BCS', 'Bank', 'Govt Job', 'Teacher Recruitment', 'IT/CSE', 'Railway', 'Defence/NSI'].map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Preliminary">Preliminary (MCQ)</option>
                <option value="Written">Written Examination</option>
                <option value="Special">Special / Technical</option>
                <option value="General">General Recruitment</option>
              </select>
            </div>

            {/* Total Marks */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Subject-wise Marks Distribution Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Subject-wise Marks Distribution:
              </span>
              <button
                type="button"
                onClick={handleAddSubjectRow}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {markBreakdown.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={row.subject}
                    onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)}
                    placeholder="Subject Name (e.g. Bangla)"
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="number"
                    value={row.marks}
                    onChange={(e) => handleSubjectChange(idx, 'marks', Number(e.target.value))}
                    placeholder="Marks"
                    className="w-16 px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono text-center"
                  />
                  <input
                    type="text"
                    value={row.topics || ''}
                    onChange={(e) => handleSubjectChange(idx, 'topics', e.target.value)}
                    placeholder="Key Topics / Breakdown (optional)"
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Remove subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Optional PDF File Upload */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
            <span className="font-semibold text-slate-700 block">
              Upload Official Syllabus PDF (Optional)
            </span>
            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf,.pdf"
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{pdfDataUrl ? 'Change PDF' : 'Select Syllabus PDF'}</span>
              </button>
              {pdfFileName && (
                <span className="text-[11px] text-emerald-700 font-mono truncate max-w-xs">
                  {pdfFileName}
                </span>
              )}
            </div>
          </div>

          {/* Detailed Syllabus Text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Curriculum Outline & Details (Plain Text)
            </label>
            <textarea
              rows={4}
              value={plainTextContent}
              onChange={(e) => setPlainTextContent(e.target.value)}
              placeholder="Paste or write detailed syllabus guidelines, topic lists, and reference book suggestions..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 font-bold shadow-sm"
            >
              {editingSyllabus ? 'Save Changes' : 'Publish Syllabus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
