import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  Image as ImageIcon, 
  Database, 
  Layers, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  LogOut,
  Briefcase,
  BookOpen
} from 'lucide-react';
import { JobQuestionPost, JobCircular, ExamSyllabus } from '../../types';
import { DeleteSafetyModal } from './DeleteSafetyModal';
import { QuestionFormModal } from './QuestionFormModal';
import { CircularFormModal } from './CircularFormModal';
import { SyllabusFormModal } from './SyllabusFormModal';

interface AdminDashboardProps {
  questions: JobQuestionPost[];
  circulars: JobCircular[];
  syllabuses: ExamSyllabus[];
  onAddQuestion: (post: JobQuestionPost) => void;
  onUpdateQuestion: (post: JobQuestionPost) => void;
  onDeleteQuestion: (id: string) => void;
  onAddCircular: (circular: JobCircular) => void;
  onUpdateCircular: (circular: JobCircular) => void;
  onDeleteCircular: (id: string) => void;
  onAddSyllabus: (syllabus: ExamSyllabus) => void;
  onUpdateSyllabus: (syllabus: ExamSyllabus) => void;
  onDeleteSyllabus: (id: string) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onPreviewQuestion: (post: JobQuestionPost) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  questions,
  circulars,
  syllabuses,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddCircular,
  onUpdateCircular,
  onDeleteCircular,
  onAddSyllabus,
  onUpdateSyllabus,
  onDeleteSyllabus,
  onExitAdmin,
  onLogout,
  onNotify,
  onPreviewQuestion,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'questions' | 'circulars' | 'syllabuses'>('questions');
  
  // Question search & form states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JobQuestionPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<JobQuestionPost | null>(null);

  // Circular modal states
  const [isCircularFormOpen, setIsCircularFormOpen] = useState(false);
  const [editingCircular, setEditingCircular] = useState<JobCircular | null>(null);

  // Syllabus modal states
  const [isSyllabusFormOpen, setIsSyllabusFormOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<ExamSyllabus | null>(null);

  // Compute stats
  const totalQuestions = questions.length;
  const totalCirculars = circulars.length;
  const totalSyllabuses = syllabuses.length;

  // Filtered Questions
  const filteredQuestions = questions.filter((item) => {
    const matchSearch =
      searchTerm.trim() === '' ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.postName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Filtered Circulars
  const filteredCirculars = circulars.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return item.organization.toLowerCase().includes(q) || item.designation.toLowerCase().includes(q);
  });

  // Filtered Syllabuses
  const filteredSyllabuses = syllabuses.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.organization.toLowerCase().includes(q);
  });

  const handleOpenAddQuestion = () => {
    setEditingPost(null);
    setIsQuestionFormOpen(true);
  };

  const handleOpenEditQuestion = (post: JobQuestionPost) => {
    setEditingPost(post);
    setIsQuestionFormOpen(true);
  };

  const handleOpenAddCircular = () => {
    setEditingCircular(null);
    setIsCircularFormOpen(true);
  };

  const handleOpenEditCircular = (circ: JobCircular) => {
    setEditingCircular(circ);
    setIsCircularFormOpen(true);
  };

  const handleOpenAddSyllabus = () => {
    setEditingSyllabus(null);
    setIsSyllabusFormOpen(true);
  };

  const handleOpenEditSyllabus = (syl: ExamSyllabus) => {
    setEditingSyllabus(syl);
    setIsSyllabusFormOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Admin Bar: Profile Details, Controls, and Logout (Standard clean theme) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Admin Profile */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-900">
                অ্যাডমিন ম্যানেজমেন্ট সেন্টার (Admin Center)
              </h1>
              <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              অনুমোদিত অ্যাডমিন: <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">admin</span> · প্রশ্ন, সার্কুলার ও সিলেবাস সরাসরি নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        {/* Top Actions depending on active tab */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeAdminTab === 'questions' && (
            <button
              onClick={handleOpenAddQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Job Question</span>
            </button>
          )}

          {activeAdminTab === 'circulars' && (
            <button
              onClick={handleOpenAddCircular}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সার্কুলার যোগ করুন</span>
            </button>
          )}

          {activeAdminTab === 'syllabuses' && (
            <button
              onClick={handleOpenAddSyllabus}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সিলেবাস যোগ করুন</span>
            </button>
          )}

          <button
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>পোর্টালে ফিরুন</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
              title="অ্যাডমিন থেকে লগআউট করুন"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>লগআউট</span>
            </button>
          )}
        </div>
      </div>

      {/* Database Stats Cards (Questions, Circulars, Syllabus) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Questions */}
        <div 
          onClick={() => setActiveAdminTab('questions')}
          className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer transition-all ${
            activeAdminTab === 'questions' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Exam Question Bank</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {totalQuestions}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Archived recruitment question papers
          </p>
        </div>

        {/* Card 2: Circulars */}
        <div 
          onClick={() => setActiveAdminTab('circulars')}
          className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer transition-all ${
            activeAdminTab === 'circulars' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">নিয়োগ বিজ্ঞপ্তি (Circulars)</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums">
            {totalCirculars}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active circulars with apply links
          </p>
        </div>

        {/* Card 3: Syllabus */}
        <div 
          onClick={() => setActiveAdminTab('syllabuses')}
          className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer transition-all ${
            activeAdminTab === 'syllabuses' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Exam Syllabuses</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-indigo-600 tabular-nums">
            {totalSyllabuses}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Curriculums & marks distribution
          </p>
        </div>
      </div>

      {/* Database Management Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Navigation Tabs between Questions, Circulars, and Syllabus */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => {
              setActiveAdminTab('questions');
              setSearchTerm('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeAdminTab === 'questions'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Job Questions ({questions.length})
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('circulars');
              setSearchTerm('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeAdminTab === 'circulars'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            নিয়োগ বিজ্ঞপ্তি / Circulars ({circulars.length})
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('syllabuses');
              setSearchTerm('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeAdminTab === 'syllabuses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Exam Syllabuses ({syllabuses.length})
          </button>
        </div>

        {/* 1. QUESTIONS MANAGEMENT TABLE */}
        {activeAdminTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  Question Bank Registry
                </h2>
                <p className="text-xs text-slate-500">
                  Manage previous year exam question sets, PDFs, and question text.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {Array.from(new Set([
                    'All',
                    'BCS',
                    'Bank',
                    'Govt Job',
                    'IT/CSE',
                    'Teacher Recruitment',
                    'Defence/NSI',
                    ...questions.map(q => q.category).filter(Boolean)
                  ])).map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-3">Entry ID</th>
                    <th className="py-3 px-4">Organization & Post</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Media Badges</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                        No question records found. Click "Add Job Question" above to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                          {row.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 truncate max-w-xs">{row.organization}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{row.postName}</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">{row.category}</td>
                        <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">{row.examYear}</td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {row.plainTextContent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">Text</span>
                            )}
                            {row.images && row.images.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700">Pic ({row.images.length})</span>
                            )}
                            {row.hasPdf && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700">PDF</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPreviewQuestion(row)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                              title="Preview"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditQuestion(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingPost(row)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CIRCULARS MANAGEMENT TABLE */}
        {activeAdminTab === 'circulars' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  নিয়োগ বিজ্ঞপ্তি Management
                </h2>
                <p className="text-xs text-slate-500">
                  Add, update, or remove job recruitment circulars and apply links.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search circulars..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50">
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Start Date</th>
                    <th className="py-3 px-3">End Date</th>
                    <th className="py-3 px-4">Apply Link</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCirculars.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                        No circulars found. Click "Add New Circular" to publish one.
                      </td>
                    </tr>
                  ) : (
                    filteredCirculars.map((circ) => (
                      <tr key={circ.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900">{circ.organization}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{circ.designation}</td>
                        <td className="py-3.5 px-3 text-slate-600">{circ.category}</td>
                        <td className="py-3.5 px-3 font-mono text-[11px]">{circ.circularStartDate}</td>
                        <td className="py-3.5 px-3 font-mono text-[11px] font-semibold text-rose-600">{circ.circularEndDate}</td>
                        <td className="py-3.5 px-4 max-w-[150px] truncate">
                          <a
                            href={circ.applyUrl.startsWith('http') ? circ.applyUrl : `https://${circ.applyUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline font-mono text-[11px] flex items-center gap-1"
                          >
                            <span className="truncate">{circ.applyUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCircular(circ)}
                              className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDeleteCircular(circ.id);
                                onNotify(`Removed circular "${circ.organization}"`, 'info');
                              }}
                              className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SYLLABUS MANAGEMENT TABLE */}
        {activeAdminTab === 'syllabuses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  Exam Syllabus Management
                </h2>
                <p className="text-xs text-slate-500">
                  Upload and update exam syllabuses, subject-wise marks distribution, and curricula.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search syllabuses..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50">
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-3">Organization</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Exam Type</th>
                    <th className="py-3 px-3">Total Marks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSyllabuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                        No syllabuses found. Click "Add Exam Syllabus" to publish one.
                      </td>
                    </tr>
                  ) : (
                    filteredSyllabuses.map((syl) => (
                      <tr key={syl.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900 max-w-xs">{syl.title}</td>
                        <td className="py-3.5 px-3 text-slate-700">{syl.organization}</td>
                        <td className="py-3.5 px-3 text-slate-600">{syl.category}</td>
                        <td className="py-3.5 px-3 font-medium text-indigo-600">{syl.examType}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-800">{syl.totalMarks} Marks</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditSyllabus(syl)}
                              className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDeleteSyllabus(syl.id);
                                onNotify(`Removed syllabus "${syl.title}"`, 'info');
                              }}
                              className="text-rose-600 hover:bg-rose-50 px-2 py-1 rounded text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isQuestionFormOpen}
        editingPost={editingPost}
        onClose={() => setIsQuestionFormOpen(false)}
        onSave={(post) => {
          if (editingPost) {
            onUpdateQuestion(post);
            onNotify(`Updated "${post.postName}"`, 'success');
          } else {
            onAddQuestion(post);
            onNotify(`Published "${post.postName}" to live database`, 'success');
          }
          setIsQuestionFormOpen(false);
        }}
        onNotify={onNotify}
      />

      {/* Circular Form Modal */}
      <CircularFormModal
        isOpen={isCircularFormOpen}
        editingCircular={editingCircular}
        onClose={() => setIsCircularFormOpen(false)}
        onSave={(circ) => {
          if (editingCircular) {
            onUpdateCircular(circ);
          } else {
            onAddCircular(circ);
          }
        }}
        onNotify={onNotify}
      />

      {/* Syllabus Form Modal */}
      <SyllabusFormModal
        isOpen={isSyllabusFormOpen}
        editingSyllabus={editingSyllabus}
        onClose={() => setIsSyllabusFormOpen(false)}
        onSave={(syl) => {
          if (editingSyllabus) {
            onUpdateSyllabus(syl);
          } else {
            onAddSyllabus(syl);
          }
        }}
        onNotify={onNotify}
      />

      {/* Question Delete Safety Modal */}
      <DeleteSafetyModal
        post={deletingPost}
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirmDelete={(id) => {
          onDeleteQuestion(id);
          onNotify('Question removed from database', 'error');
        }}
      />
    </div>
  );
};
