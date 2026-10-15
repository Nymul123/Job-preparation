import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bookmark, 
  ShieldCheck, 
  Menu, 
  X,
  FileText,
  Briefcase,
  BookOpen,
  LogOut,
  Lock,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'portal' | 'circulars' | 'syllabus' | 'bookmarks' | 'admin';
  setCurrentTab: (tab: 'portal' | 'circulars' | 'syllabus' | 'bookmarks' | 'admin') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  bookmarksCount: number;
  categoriesList?: string[];
  circularsCount?: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedCategory,
  onSelectCategory,
  bookmarksCount,
  categoriesList = [],
  circularsCount = 0,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = React.useMemo(() => {
    return Array.from(new Set([
      'BCS', 'Bank', 'Govt Job', 'IT/CSE', 'Teacher Recruitment', 'Defence/NSI',
      ...categoriesList
    ])).filter(c => c !== 'All');
  }, [categoriesList]);

  const handleNavClick = (tab: 'portal' | 'circulars' | 'syllabus' | 'bookmarks' | 'admin') => {
    if (tab === 'admin' && !isAdmin) {
      onOpenAdminLogin();
      setMobileMenuOpen(false);
      return;
    }
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setCategoryDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-200/90 text-slate-800 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => handleNavClick('portal')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-black tracking-tight text-slate-900 leading-none">
                  Exam<span className="text-indigo-600">Archive</span>
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200/60 hidden sm:inline-block">
                  BD Job Bank
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                বিসিএস ও সরকারি চাকরি পরীক্ষা আর্কাইভ
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-600">
          
          {/* 1. Question Archive */}
          <button
            onClick={() => handleNavClick('portal')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'portal' && selectedCategory === 'All'
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                : 'hover:text-indigo-600 hover:bg-slate-100/70'
            }`}
          >
            প্রশ্ন আর্কাইভ (Question Archive)
          </button>

          {/* 2. Circulars (নিয়োগ বিজ্ঞপ্তি) */}
          <button
            onClick={() => handleNavClick('circulars')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'circulars'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs'
                : 'hover:text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>নিয়োগ বিজ্ঞপ্তি</span>
            {circularsCount > 0 && (
              <span className="text-[11px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                {circularsCount}
              </span>
            )}
          </button>

          {/* 3. Syllabus */}
          <button
            onClick={() => handleNavClick('syllabus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'syllabus'
                ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-xs'
                : 'hover:text-indigo-600 hover:bg-slate-100/70'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>সিলেবাস (Syllabus)</span>
          </button>

          {/* 4. Categories Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl transition-colors hover:text-indigo-600 hover:bg-slate-100/70 whitespace-nowrap cursor-pointer"
              aria-expanded={categoryDropdownOpen}
            >
              <span>ক্যাটাগরি</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoryDropdownOpen && (
              <div 
                className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    onSelectCategory('All');
                    setCurrentTab('portal');
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  সব ক্যাটাগরি (All Categories)
                </button>
                <div className="border-t border-slate-100 my-1" />
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(cat);
                      setCurrentTab('portal');
                      setCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'text-indigo-700 bg-indigo-50 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Bookmarks */}
          <button
            onClick={() => handleNavClick('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'bookmarks'
                ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/80 shadow-xs'
                : 'hover:text-amber-700 hover:bg-amber-50/40'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>সংরক্ষিত</span>
            {bookmarksCount > 0 && (
              <span className="text-[11px] font-mono bg-amber-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                {bookmarksCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side controls: If admin is logged in, show session controls; otherwise only mobile hamburger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab(currentTab === 'admin' ? 'portal' : 'admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-indigo-700 text-white ring-2 ring-indigo-400/40'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-200" />
                <span>{currentTab === 'admin' ? 'পোর্টালে ফিরুন' : 'অ্যাডমিন ড্যাশবোর্ড'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Admin Active" />
              </button>

              <button
                onClick={onAdminLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                title="অ্যাডমিন লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Standard theme) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
          <div className="flex flex-col space-y-1 text-sm font-semibold">
            <button
              onClick={() => handleNavClick('portal')}
              className={`text-left px-3 py-2.5 rounded-xl transition-colors ${
                currentTab === 'portal' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              প্রশ্ন আর্কাইভ (Question Archive)
            </button>

            <button
              onClick={() => handleNavClick('circulars')}
              className={`text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                currentTab === 'circulars' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>নিয়োগ বিজ্ঞপ্তি</span>
              </div>
              {circularsCount > 0 && (
                <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  {circularsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('syllabus')}
              className={`text-left px-3 py-2.5 rounded-xl flex items-center gap-2 transition-colors ${
                currentTab === 'syllabus' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>পরীক্ষার সিলেবাস</span>
            </button>

            <button
              onClick={() => handleNavClick('bookmarks')}
              className={`text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                currentTab === 'bookmarks' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-600" />
                <span>সংরক্ষিত প্রশ্ন</span>
              </div>
              {bookmarksCount > 0 && (
                <span className="text-xs font-mono bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {bookmarksCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center"
                >
                  অ্যাডমিন ড্যাশবোর্ড
                </button>
                <button
                  onClick={onAdminLogout}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 text-xs font-bold"
                >
                  লগআউট
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
