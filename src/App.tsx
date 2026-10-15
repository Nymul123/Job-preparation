/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  FileText, 
  Download, 
  Bookmark, 
  ShieldCheck, 
  Layers, 
  Filter,
  Briefcase,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';

import { JobQuestionPost, FilterState, JobCircular, ExamSyllabus } from './types';
import { 
  getJobQuestions, 
  addJobQuestion, 
  updateJobQuestion, 
  deleteJobQuestion, 
  getJobCirculars,
  addJobCircular,
  updateJobCircular,
  deleteJobCircular,
  getExamSyllabuses,
  addExamSyllabus,
  updateExamSyllabus,
  deleteExamSyllabus,
  getBookmarks,
  toggleBookmark,
  ensureLightMode,
  getIsAdminAuthenticated,
  saveAdminAuthenticated
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { QuestionCard } from './components/QuestionCard';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { PracticeQuizModal } from './components/PracticeQuizModal';
import { CircularsPortal } from './components/circulars/CircularsPortal';
import { SyllabusPortal } from './components/syllabus/SyllabusPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { 
  subscribeToQuestions, 
  syncAddOrUpdateQuestion, 
  syncDeleteQuestion,
  subscribeToCirculars, 
  syncAddOrUpdateCircular, 
  syncDeleteCircular,
  subscribeToSyllabuses, 
  syncAddOrUpdateSyllabus, 
  syncDeleteSyllabus,
  testConnection
} from './services/firestoreService';

export default function App() {
  // Application Data States
  const [questions, setQuestions] = useState<JobQuestionPost[]>([]);
  const [circulars, setCirculars] = useState<JobCircular[]>([]);
  const [syllabuses, setSyllabuses] = useState<ExamSyllabus[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Navigation State: 'portal' | 'circulars' | 'syllabus' | 'bookmarks' | 'admin'
  const [currentTab, setCurrentTab] = useState<'portal' | 'circulars' | 'syllabus' | 'bookmarks' | 'admin'>('portal');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Modals State
  const [activePdfPost, setActivePdfPost] = useState<JobQuestionPost | null>(null);
  const [activeLightbox, setActiveLightbox] = useState<{ url: string; caption: string } | null>(null);
  const [activePracticePost, setActivePracticePost] = useState<JobQuestionPost | null>(null);

  // Filters State for Questions
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    organization: 'All',
    examYear: 'All',
    mediaType: 'All',
  });

  // Initialize data, ensure light mode, and subscribe to Firebase real-time sync across devices
  useEffect(() => {
    ensureLightMode();
    testConnection();

    // 1. Initial cached data load for immediate visual response
    setQuestions(getJobQuestions());
    setCirculars(getJobCirculars());
    setSyllabuses(getExamSyllabuses());
    setBookmarks(getBookmarks());
    setIsAdmin(getIsAdminAuthenticated());

    // 2. Real-time Firebase listeners across all devices
    const unsubQuestions = subscribeToQuestions((liveQuestions) => {
      setQuestions(liveQuestions);
    });

    const unsubCirculars = subscribeToCirculars((liveCirculars) => {
      setCirculars(liveCirculars);
    });

    const unsubSyllabuses = subscribeToSyllabuses((liveSyllabuses) => {
      setSyllabuses(liveSyllabuses);
    });

    return () => {
      unsubQuestions();
      unsubCirculars();
      unsubSyllabuses();
    };
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleBookmark = (id: string) => {
    const updated = toggleBookmark(id);
    setBookmarks(updated);
    if (updated.includes(id)) {
      showToast('Saved to your Bookmarked Question Sets', 'success');
    } else {
      showToast('Removed from Bookmarks', 'info');
    }
  };

  // Admin Auth Handlers
  const handleOpenAdminLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    saveAdminAuthenticated(true);
    setCurrentTab('admin');
    showToast('অ্যাডমিন হিসেবে সফলভাবে লগইন হয়েছেন!', 'success');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    saveAdminAuthenticated(false);
    setCurrentTab('portal');
    showToast('অ্যাডমিন প্যানেল থেকে লগআউট সম্পন্ন হয়েছে।', 'info');
  };

  // Questions Handlers (Persisted to Firebase + Local)
  const handleAddQuestion = async (post: JobQuestionPost) => {
    const updated = addJobQuestion(post);
    setQuestions(updated);
    try {
      await syncAddOrUpdateQuestion(post);
    } catch (err) {
      console.error('Failed to sync new question to Firebase', err);
    }
  };

  const handleUpdateQuestion = async (post: JobQuestionPost) => {
    const updated = updateJobQuestion(post);
    setQuestions(updated);
    try {
      await syncAddOrUpdateQuestion(post);
    } catch (err) {
      console.error('Failed to sync question update to Firebase', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const updated = deleteJobQuestion(id);
    setQuestions(updated);
    showToast('প্রশ্নপত্রটি স্থায়ীভাবে মুছে ফেলা হয়েছে।', 'info');
    try {
      await syncDeleteQuestion(id);
    } catch (err) {
      console.error('Failed to sync question deletion to Firebase', err);
    }
  };

  // Circulars Handlers (Persisted to Firebase + Local)
  const handleAddCircular = async (circ: JobCircular) => {
    const updated = addJobCircular(circ);
    setCirculars(updated);
    showToast(`Published circular "${circ.organization}"`, 'success');
    try {
      await syncAddOrUpdateCircular(circ);
    } catch (err) {
      console.error('Failed to sync circular to Firebase', err);
    }
  };

  const handleUpdateCircular = async (circ: JobCircular) => {
    const updated = updateJobCircular(circ);
    setCirculars(updated);
    showToast(`Updated circular "${circ.organization}"`, 'success');
    try {
      await syncAddOrUpdateCircular(circ);
    } catch (err) {
      console.error('Failed to sync circular update to Firebase', err);
    }
  };

  const handleDeleteCircular = async (id: string) => {
    const updated = deleteJobCircular(id);
    setCirculars(updated);
    try {
      await syncDeleteCircular(id);
    } catch (err) {
      console.error('Failed to sync circular deletion to Firebase', err);
    }
  };

  // Syllabus Handlers (Persisted to Firebase + Local)
  const handleAddSyllabus = async (syl: ExamSyllabus) => {
    const updated = addExamSyllabus(syl);
    setSyllabuses(updated);
    showToast(`Published syllabus "${syl.title}"`, 'success');
    try {
      await syncAddOrUpdateSyllabus(syl);
    } catch (err) {
      console.error('Failed to sync syllabus to Firebase', err);
    }
  };

  const handleUpdateSyllabus = async (syl: ExamSyllabus) => {
    const updated = updateExamSyllabus(syl);
    setSyllabuses(updated);
    showToast(`Updated syllabus "${syl.title}"`, 'success');
    try {
      await syncAddOrUpdateSyllabus(syl);
    } catch (err) {
      console.error('Failed to sync syllabus update to Firebase', err);
    }
  };

  const handleDeleteSyllabus = async (id: string) => {
    const updated = deleteExamSyllabus(id);
    setSyllabuses(updated);
    try {
      await syncDeleteSyllabus(id);
    } catch (err) {
      console.error('Failed to sync syllabus deletion to Firebase', err);
    }
  };

  // Filter Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      organization: 'All',
      examYear: 'All',
      mediaType: 'All',
    });
    showToast('Filters reset', 'info');
  };

  // Dynamic Lists for Filters
  const organizationsList = useMemo(() => {
    const orgs = Array.from(new Set(questions.map((q) => q.organization)));
    return orgs.sort();
  }, [questions]);

  const categoriesList = useMemo(() => {
    const cats = questions.map((q) => q.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [questions]);

  const quickCategoryPills = useMemo(() => {
    const base = ['All', 'BCS', 'Bank', 'Govt Job', 'IT/CSE', 'Teacher Recruitment'];
    const allUnique = Array.from(new Set([...base, ...categoriesList]));
    return allUnique.slice(0, 8);
  }, [categoriesList]);

  // Filtered Questions logic
  const filteredQuestions = useMemo(() => {
    let source = questions;

    if (currentTab === 'bookmarks') {
      source = source.filter((q) => bookmarks.includes(q.id));
    }

    return source.filter((item) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const inOrg = item.organization.toLowerCase().includes(query);
        const inPost = item.postName.toLowerCase().includes(query);
        const inSummary = (item.summary || '').toLowerCase().includes(query);
        const inPlainText = (item.plainTextContent || '').toLowerCase().includes(query);
        const inQuestions = (item.questions || []).some(
          (q) =>
            q.questionText.toLowerCase().includes(query) ||
            (q.subject || '').toLowerCase().includes(query) ||
            (q.answerExplanation || '').toLowerCase().includes(query)
        );
        if (!inOrg && !inPost && !inSummary && !inPlainText && !inQuestions) return false;
      }

      // 2. Category
      if (filters.category !== 'All' && item.category !== filters.category) {
        return false;
      }

      // 3. Organization
      if (filters.organization !== 'All' && item.organization !== filters.organization) {
        return false;
      }

      // 4. Exam Year
      if (filters.examYear !== 'All' && item.examYear.toString() !== filters.examYear) {
        return false;
      }

      // 5. Media Type
      if (filters.mediaType !== 'All') {
        if (filters.mediaType === 'PDF' && !item.hasPdf) return false;
        if (filters.mediaType === 'Image' && (!item.images || item.images.length === 0)) return false;
        if (filters.mediaType === 'Text' && !item.plainTextContent && (!item.questions || item.questions.length === 0)) return false;
      }

      return true;
    });
  }, [questions, bookmarks, currentTab, filters]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 3-Zone Standard Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'admin' && !isAdmin) {
            handleOpenAdminLogin();
            return;
          }
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedCategory={filters.category}
        onSelectCategory={(cat) => handleFilterChange('category', cat)}
        bookmarksCount={bookmarks.length}
        categoriesList={categoriesList}
        circularsCount={circulars.length}
        isAdmin={isAdmin}
        onOpenAdminLogin={handleOpenAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {currentTab === 'admin' ? (
          isAdmin ? (
            /* Admin Dashboard Mode (Questions, Circulars, Syllabus) */
            <AdminDashboard
              questions={questions}
              circulars={circulars}
              syllabuses={syllabuses}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onAddCircular={handleAddCircular}
              onUpdateCircular={handleUpdateCircular}
              onDeleteCircular={handleDeleteCircular}
              onAddSyllabus={handleAddSyllabus}
              onUpdateSyllabus={handleUpdateSyllabus}
              onDeleteSyllabus={handleDeleteSyllabus}
              onExitAdmin={() => setCurrentTab('portal')}
              onLogout={handleAdminLogout}
              onNotify={showToast}
              onPreviewQuestion={(post) => {
                setCurrentTab('portal');
                setFilters((prev) => ({
                  ...prev,
                  searchQuery: post.organization,
                }));
              }}
            />
          ) : (
            /* Admin Access Gate if not authenticated */
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-lg space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">অ্যাডমিন প্রবেশাধিকার প্রয়োজন</h2>
              <p className="text-xs text-slate-600">
                অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে নির্দিষ্ট ইউজার আইডি ও পাসওয়ার্ড দিয়ে লগইন করুন।
              </p>
              <button
                onClick={handleOpenAdminLogin}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                অ্যাডমিন লগইন করুন
              </button>
            </div>
          )
        ) : currentTab === 'circulars' ? (
          /* নিয়োগ বিজ্ঞপ্তি / Circulars Portal Mode */
          <CircularsPortal
            circulars={circulars}
            onOpenCircularPdf={(circ) => {
              if (circ.circularPdfDataUrl) {
                const dummyPost: JobQuestionPost = {
                  id: circ.id,
                  organization: circ.organization,
                  postName: circ.designation,
                  category: circ.category,
                  examYear: 2026,
                  examDate: circ.uploadDate,
                  examType: 'Preliminary (MCQ)',
                  durationMinutes: 90,
                  totalMarks: 100,
                  summary: circ.description || `Official Recruitment Notice for ${circ.organization}`,
                  questions: [],
                  images: [],
                  hasPdf: true,
                  pdfDataUrl: circ.circularPdfDataUrl,
                  pdfFileName: circ.circularPdfFileName || `${circ.organization}_Circular.pdf`,
                  uploadDate: circ.uploadDate,
                };
                setActivePdfPost(dummyPost);
              } else if (circ.applyUrl) {
                const finalUrl = circ.applyUrl.startsWith('http') ? circ.applyUrl : `https://${circ.applyUrl}`;
                window.open(finalUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            onNavigateToAdmin={() => {
              if (!isAdmin) {
                handleOpenAdminLogin();
              } else {
                setCurrentTab('admin');
              }
            }}
          />
        ) : currentTab === 'syllabus' ? (
          /* Exam Syllabus & Marks Distribution Portal Mode */
          <SyllabusPortal
            syllabuses={syllabuses}
            onOpenPdfViewer={(p) => setActivePdfPost(p)}
            onNotify={showToast}
          />
        ) : (
          /* Student / Public Portal Mode (Question Bank Feed) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
            
            {/* Standard Modern Hero Section */}
            <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/40 to-white text-slate-900 rounded-3xl p-6 sm:p-10 border border-indigo-100/90 shadow-xs relative overflow-hidden">
              <div className="relative z-10 max-w-4xl space-y-5">
                
                {/* Hero Top Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 text-xs font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>সরকারি ও স্বায়ত্তশাসিত চাকরি প্রস্তুতি ও সার্কুলার আর্কাইভ</span>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <button
                    onClick={() => {
                      setCurrentTab('circulars');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>নতুন নিয়োগ বিজ্ঞপ্তি ({circulars.length})</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab('syllabus');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>পরীক্ষার সিলেবাস</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-slate-900 leading-tight">
                  {currentTab === 'bookmarks'
                    ? 'সংরক্ষিত প্রশ্ন ও স্টাডি নোটস'
                    : 'বিসিএস ও ব্যাংক জব পরীক্ষার প্রশ্নব্যাংক, সার্কুলার ও পূর্ণাঙ্গ সমাধান'}
                </h1>

                <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  {currentTab === 'bookmarks'
                    ? 'আপনার সংরক্ষিত প্রশ্নপত্রসমূহ অফলাইনে যেকোনো সময় অনুশীলন করুন এবং পেজ-বাই-পেজ হাই-কোয়ালিটি PDF ভিউয়ারে পড়ুন।'
                    : 'বিসিএস, বাংলাদেশ ব্যাংক, সরকারি ব্যাংক ও বিভিন্ন মন্ত্রণালয় নিয়োগ পরীক্ষার বিগত সালের প্রশ্নপত্র সমাধানসহ পড়ুন, নতুন সার্কুলারে সরাসরি আবেদন করুন ও সিলেবাস দেখুন।'}
                </p>

                {/* Main Feature Cards in Hero: Direct access to Circulars and Syllabus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-2xl">
                  
                  {/* Hero Item 1: Circulars */}
                  <div 
                    onClick={() => {
                      setCurrentTab('circulars');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 p-4 rounded-2xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Briefcase className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            নিয়োগ বিজ্ঞপ্তি (Circulars)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {circulars.length} টি সক্রিয় বিজ্ঞপ্তি · ফিল্টার করুন ও অনলাইনে আবেদন করুন
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* Hero Item 2: Syllabus */}
                  <div 
                    onClick={() => {
                      setCurrentTab('syllabus');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-300 p-4 rounded-2xl cursor-pointer transition-all shadow-xs hover:shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          পরীক্ষার সিলেবাস ও মানবন্টন
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium">
                          বিষয়ভিত্তিক নম্বর বণ্টন ও বিস্তারিত সিলেবাস দেখুন
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                  </div>

                </div>

                {/* Popular Question Category Filter Pills */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
                    জনপ্রিয় ক্যাটাগরি:
                  </span>
                  {quickCategoryPills.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        filters.category === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative light glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-100/50 via-sky-50/20 to-transparent pointer-events-none" />
            </div>

            {/* Global Search & Multi-Level Filter Bar for Questions */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              organizationsList={organizationsList}
              categoriesList={categoriesList}
              totalResultsCount={filteredQuestions.length}
            />

            {/* Question Archive Feed */}
            {filteredQuestions.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  কোনো পরীক্ষার প্রশ্নপত্র পাওয়া যায়নি
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {currentTab === 'bookmarks' ? (
                    "আপনার সংরক্ষণে কোনো প্রশ্ন যুক্ত করা হয়নি। প্রশ্ন আর্কাইভ থেকে বুকমার্ক আইকনে ক্লিক করে যেকোনো প্রশ্ন সংরক্ষণ করতে পারেন।"
                  ) : questions.length === 0 ? (
                    "বর্তমানে প্রশ্নপত্রে কোনো ডাটা নেই। অ্যাডমিন প্যানেলে লগইন করে নতুন প্রশ্ন, PDF বা ছবি যুক্ত করতে পারেন।"
                  ) : (
                    'আপনার বর্তমান ফিল্টারের সাথে মিলে এমন কোনো প্রশ্ন পাওয়া যায়নি। অন্য ক্যাটাগরি বা সাল নির্বাচন করে চেষ্টা করুন।'
                  )}
                </p>

                <div className="mt-5 flex justify-center gap-3">
                  {currentTab === 'bookmarks' ? (
                    <button
                      onClick={() => setCurrentTab('portal')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      প্রশ্ন আর্কাইভে যান
                    </button>
                  ) : questions.length === 0 ? (
                    <button
                      onClick={() => {
                        if (!isAdmin) {
                          handleOpenAdminLogin();
                        } else {
                          setCurrentTab('admin');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
                    >
                      <FileText className="w-4 h-4" />
                      <span>প্রথম প্রশ্ন যুক্ত করুন</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      ফিল্টার রিসেট করুন
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Question Archive Feed (Card Layout) */
              <div className="space-y-6">
                {filteredQuestions.map((post) => (
                  <QuestionCard
                    key={post.id}
                    post={post}
                    isBookmarked={bookmarks.includes(post.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenPdfViewer={(p) => setActivePdfPost(p)}
                    onOpenImageLightbox={(url, caption) => setActiveLightbox({ url, caption })}
                    onNotify={showToast}
                    onStartPractice={(p) => setActivePracticePost(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Standard Footer */}
      <footer className="w-full border-t border-slate-200/90 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">ExamArchive</span>
            <span>·</span>
            <span>চাকরি প্রস্তুতি প্রশ্নব্যাংক, নিয়োগ বিজ্ঞপ্তি ও পূর্ণাঙ্গ সিলেবাস</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <button
              onClick={() => {
                setCurrentTab('circulars');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-emerald-700 cursor-pointer"
            >
              নিয়োগ বিজ্ঞপ্তি
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setCurrentTab('syllabus');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-indigo-700 cursor-pointer"
            >
              পরীক্ষার সিলেবাস
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (!isAdmin) {
                  handleOpenAdminLogin();
                } else {
                  setCurrentTab('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="hover:text-indigo-700 font-bold underline cursor-pointer"
            >
              {isAdmin ? 'অ্যাডমিন ড্যাশবোর্ড' : 'অ্যাডমিন লগইন'}
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal with Fixed Credentials */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Page-by-Page Full PDF Viewer Modal */}
      <PdfViewerModal
        post={activePdfPost}
        onClose={() => setActivePdfPost(null)}
        onNotify={showToast}
      />

      {/* Image Lightbox Modal */}
      {activeLightbox && (
        <ImageLightboxModal
          isOpen={!!activeLightbox}
          imageUrl={activeLightbox.url}
          caption={activeLightbox.caption}
          onClose={() => setActiveLightbox(null)}
        />
      )}

      {/* Timed Practice Quiz Modal */}
      <PracticeQuizModal
        post={activePracticePost}
        onClose={() => setActivePracticePost(null)}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
