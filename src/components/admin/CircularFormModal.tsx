import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Trash2, Check, ExternalLink, Calendar, Briefcase } from 'lucide-react';
import { JobCircular } from '../../types';

interface CircularFormModalProps {
  isOpen: boolean;
  editingCircular: JobCircular | null;
  onClose: () => void;
  onSave: (circular: JobCircular) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CircularFormModal: React.FC<CircularFormModalProps> = ({
  isOpen,
  editingCircular,
  onClose,
  onSave,
  onNotify,
}) => {
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [category, setCategory] = useState('Govt Job Circulars');
  const [circularStartDate, setCircularStartDate] = useState('');
  const [circularEndDate, setCircularEndDate] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [vacancyCount, setVacancyCount] = useState('');
  const [description, setDescription] = useState('');
  const [circularPdfDataUrl, setCircularPdfDataUrl] = useState('');
  const [circularPdfFileName, setCircularPdfFileName] = useState('');

  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCircular) {
      setOrganization(editingCircular.organization);
      setDesignation(editingCircular.designation);
      setCategory(editingCircular.category);
      setCircularStartDate(editingCircular.circularStartDate);
      setCircularEndDate(editingCircular.circularEndDate);
      setApplyUrl(editingCircular.applyUrl);
      setVacancyCount(editingCircular.vacancyCount || '');
      setDescription(editingCircular.description || '');
      setCircularPdfDataUrl(editingCircular.circularPdfDataUrl || '');
      setCircularPdfFileName(editingCircular.circularPdfFileName || '');
    } else {
      setOrganization('');
      setDesignation('');
      setCategory('Govt Job Circulars');
      setCircularStartDate('');
      setCircularEndDate('');
      setApplyUrl('');
      setVacancyCount('');
      setDescription('');
      setCircularPdfDataUrl('');
      setCircularPdfFileName('');
    }
  }, [editingCircular, isOpen]);

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
        setCircularPdfDataUrl(base64);
        setCircularPdfFileName(file.name);
        onNotify(`Uploaded circular PDF: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization.trim()) {
      onNotify('Please enter organization name', 'error');
      return;
    }
    if (!designation.trim()) {
      onNotify('Please enter designation/post', 'error');
      return;
    }
    if (!circularEndDate.trim()) {
      onNotify('Please enter circular deadline', 'error');
      return;
    }
    if (!applyUrl.trim()) {
      onNotify('Please enter apply URL link', 'error');
      return;
    }

    const finalCircular: JobCircular = {
      id: editingCircular ? editingCircular.id : `circ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization: organization.trim(),
      designation: designation.trim(),
      category: category.trim() || 'Govt Job Circulars',
      circularStartDate: circularStartDate.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      circularEndDate: circularEndDate.trim(),
      applyUrl: applyUrl.trim(),
      vacancyCount: vacancyCount.trim() || undefined,
      description: description.trim() || undefined,
      circularPdfDataUrl: circularPdfDataUrl || undefined,
      circularPdfFileName: circularPdfFileName || undefined,
      uploadDate: editingCircular ? editingCircular.uploadDate : new Date().toISOString().split('T')[0],
    };

    onSave(finalCircular);
    onNotify(editingCircular ? 'Circular updated successfully' : 'New circular published live', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400">
                Circular Administration
              </span>
              <h2 className="text-base sm:text-lg font-bold font-display">
                {editingCircular ? 'Edit Job Circular' : 'Add New Job Circular (নিয়োগ বিজ্ঞপ্তি)'}
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
            {/* Organization */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization / Ministry Name *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Petrobangla, BCIC, Bangladesh Bank"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Designation / Post */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation & Vacancy *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Assistant Manager (CSE/IT)-25"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            {/* Category (Typed input with suggestion buttons) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Circular Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Govt Job Circulars, Teacher Circulars..."
                list="circular-category-list"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <datalist id="circular-category-list">
                {['Govt Job Circulars', 'Teacher Circulars', 'M.Sc Circulars', 'Bank Circulars', 'Ministry Circulars'].map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-1 mt-1">
                {['Govt Job Circulars', 'Teacher Circulars', 'M.Sc Circulars', 'Bank Circulars'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    +{c.replace(' Circulars', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Vacancy count */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Vacancies (Optional)
              </label>
              <input
                type="text"
                value={vacancyCount}
                onChange={(e) => setVacancyCount(e.target.value)}
                placeholder="e.g. 25 Posts, 150 Vacancies"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Circular Start Date (e.g. 18 Oct, 2026)
              </label>
              <input
                type="text"
                value={circularStartDate}
                onChange={(e) => setCircularStartDate(e.target.value)}
                placeholder="e.g. 18 Oct, 2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Circular End Date / Deadline * (e.g. 17 Nov, 2026)
              </label>
              <input
                type="text"
                required
                value={circularEndDate}
                onChange={(e) => setCircularEndDate(e.target.value)}
                placeholder="e.g. 17 Nov, 2026"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Apply URL Link */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Apply Online Link URL *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="e.g. http://petrobangla.teletalk.com.bd or https://jobs.gov.bd"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              When students click "Apply Now", they will be directed to this application portal.
            </span>
          </div>

          {/* Optional PDF File Upload */}
          <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
            <span className="font-semibold text-slate-700 block">
              Upload Official Circular PDF File (Optional)
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
                <span>{circularPdfDataUrl ? 'Change PDF' : 'Select Circular PDF'}</span>
              </button>
              {circularPdfFileName && (
                <span className="text-[11px] text-emerald-700 font-mono truncate max-w-xs">
                  {circularPdfFileName}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Brief Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Application fee, eligibility criteria, or instructions..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 font-bold shadow-sm"
            >
              {editingCircular ? 'Save Changes' : 'Publish Circular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
