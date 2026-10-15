import React from 'react';
import { Search, RotateCcw, Filter, X } from 'lucide-react';
import { FilterState } from '../types';
import { ALL_CATEGORIES, ALL_YEARS } from '../data/seedQuestions';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  organizationsList: string[];
  categoriesList?: string[];
  totalResultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  organizationsList,
  categoriesList = [],
  totalResultsCount,
}) => {
  const hasActiveFilters = 
    filters.searchQuery.trim() !== '' ||
    filters.category !== 'All' ||
    filters.organization !== 'All' ||
    filters.examYear !== 'All' ||
    filters.mediaType !== 'All';

  // Dynamic categories list including user-typed categories
  const availableCategories = React.useMemo(() => {
    const defaultList = ['All', 'BCS', 'Bank', 'Govt Job', 'IT/CSE', 'Teacher Recruitment', 'Defence/NSI'];
    const merged = new Set([...defaultList, ...categoriesList]);
    return Array.from(merged).filter(Boolean);
  }, [categoriesList]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Global Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
          placeholder="Search by Organization name, Post name, or Topic (e.g. BPSC, Bangladesh Bank, Math, Literature)..."
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange('searchQuery', '')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Middle row: Multi-Level Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category Dropdown */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500">
            Category
          </label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </span>
          </div>
        </div>

        {/* Organization / Ministry Dropdown */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500">
            Organization / Ministry
          </label>
          <div className="relative">
            <select
              value={filters.organization}
              onChange={(e) => onFilterChange('organization', e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer truncate pr-7"
            >
              <option value="All">All Organizations</option>
              {organizationsList.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </span>
          </div>
        </div>

        {/* Exam Year Dropdown */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500">
            Exam Year
          </label>
          <div className="relative">
            <select
              value={filters.examYear}
              onChange={(e) => onFilterChange('examYear', e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer font-mono"
            >
              {ALL_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr === 'All' ? 'All Years' : yr}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </span>
          </div>
        </div>

        {/* Media Type Dropdown */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500">
            Media Attachment
          </label>
          <div className="relative">
            <select
              value={filters.mediaType}
              onChange={(e) => onFilterChange('mediaType', e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="All">All Formats (Text, Picture, PDF)</option>
              <option value="Text">Formatted Text Only</option>
              <option value="Image">Contains Scanned Pictures</option>
              <option value="PDF">Includes Embedded PDF</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Status and Action CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-mono text-slate-900 tabular-nums">{totalResultsCount}</strong> exam question set{totalResultsCount === 1 ? '' : 's'}
          </span>
          {hasActiveFilters && (
            <span className="text-indigo-600 font-medium">
              (Filtered results)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Multi-level Filter Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
