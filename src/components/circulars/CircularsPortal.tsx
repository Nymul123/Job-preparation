import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  Briefcase, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { JobCircular } from '../../types';

interface CircularsPortalProps {
  circulars: JobCircular[];
  onOpenCircularPdf?: (circular: JobCircular) => void;
  onNavigateToAdmin?: () => void;
}

export const CircularsPortal: React.FC<CircularsPortalProps> = ({
  circulars,
  onOpenCircularPdf,
  onNavigateToAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Extract unique categories dynamically
  const categoriesList = useMemo(() => {
    const base = ['All', 'Govt Job Circulars', 'Teacher Circulars', 'M.Sc Circulars', 'Bank Circulars'];
    const dynamic = circulars.map(c => c.category).filter(Boolean);
    return Array.from(new Set([...base, ...dynamic]));
  }, [circulars]);

  // Filter circulars
  const filteredCirculars = useMemo(() => {
    return circulars.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inOrg = item.organization.toLowerCase().includes(q);
        const inDesig = item.designation.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        if (!inOrg && !inDesig && !inCat) return false;
      }
      return true;
    });
  }, [circulars, selectedCategory, searchQuery]);

  // Pagination logic
  const totalEntries = filteredCirculars.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentEntries = filteredCirculars.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleApplyClick = (url: string) => {
    if (!url) return;
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in">
      
      {/* Title Header matching user request */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Job Recruitment Portal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
          নিয়োগ বিজ্ঞপ্তি
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Explore all verified government, banking, autonomous ministries, and teacher recruitment circulars. Check start/end dates and apply directly online.
        </p>
      </div>

      {/* Main Table Card (matching screenshot) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6 space-y-5">
        
        {/* Category Tabs Bar (Green active tab matching screenshot) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Circulars' : cat}
            </button>
          ))}
        </div>

        {/* Controls Bar: Show X entries & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Search:</span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search organization or post..."
                className="w-48 sm:w-64 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Circulars Table (Desktop View - matching screenshot) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50/60">
                <th className="py-3 px-3 w-14">SN</th>
                <th className="py-3 px-4">Circulars Link</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-3">Circular Start Date</th>
                <th className="py-3 px-3">Circular End Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-4 text-xs">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">বর্তমানে কোনো নিয়োগ বিজ্ঞপ্তি নেই</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        অ্যাডমিন প্যানেল থেকে নতুন সরকারি বা বেসরকারি চাকরির সার্কুলার ও আবেদনের লিংক আপলোড করা হলে তা এখানে প্রদর্শিত হবে।
                      </p>
                      {onNavigateToAdmin && (
                        <button
                          onClick={onNavigateToAdmin}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>সার্কুলার আপলোড করুন (Admin)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* SN */}
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-500">
                      {startIndex + idx + 1}
                    </td>

                    {/* Circulars Link / Organization */}
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => handleApplyClick(row.applyUrl)}
                          className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                        >
                          {row.organization}
                        </span>
                        {row.circularPdfDataUrl && onOpenCircularPdf && (
                          <button
                            onClick={() => onOpenCircularPdf(row)}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                            title="View Circular PDF Document"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {row.category}
                      </span>
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{row.designation}</div>
                      {row.vacancyCount && (
                        <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                          Vacancy: {row.vacancyCount}
                        </span>
                      )}
                    </td>

                    {/* Circular Start Date */}
                    <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {row.circularStartDate}
                    </td>

                    {/* Circular End Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {row.circularEndDate}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleApplyClick(row.applyUrl)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Responsive Cards */}
        <div className="md:hidden space-y-3">
          {currentEntries.length === 0 ? (
            <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <p className="font-bold text-slate-800">বর্তমানে কোনো সার্কুলার নেই</p>
              <p className="text-slate-500 text-[11px]">অ্যাডমিন প্যানেল থেকে নতুন সার্কুলার যোগ করুন।</p>
              {onNavigateToAdmin && (
                <button
                  onClick={onNavigateToAdmin}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>সার্কুলার আপলোড করুন</span>
                </button>
              )}
            </div>
          ) : (
            currentEntries.map((row, idx) => (
              <div 
                key={row.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400">#{startIndex + idx + 1}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{row.organization}</h3>
                    <p className="font-medium text-slate-700">{row.designation}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                    {row.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Start Date:</span>
                    <span className="font-semibold text-slate-800">{row.circularStartDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Deadline:</span>
                    <span className="font-semibold text-rose-600">{row.circularEndDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  {row.vacancyCount && (
                    <span className="text-[11px] font-semibold text-indigo-600">
                      {row.vacancyCount}
                    </span>
                  )}
                  <button
                    onClick={() => handleApplyClick(row.applyUrl)}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Pagination & Entries count (matching screenshot) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{totalEntries === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(startIndex + pageSize, totalEntries)}</strong> of{' '}
            <strong className="text-slate-800">{totalEntries}</strong> entries
          </div>

          <div className="flex items-center gap-1 select-none">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  currentPage === p
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
