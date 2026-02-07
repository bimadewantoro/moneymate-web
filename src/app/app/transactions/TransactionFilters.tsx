"use client";

import { useState, useRef, useEffect } from "react";
import {
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";

// Hook to detect mobile viewport
function useIsMobile(breakpoint: number = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Mobile Sheet Component
function MobileSheet({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

export interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: string;
  };
  transactionType: "all" | "income" | "expense" | "transfer";
  selectedCategories: string[];
  selectedAccounts: string[];
  uncategorizedOnly: boolean;
  searchQuery: string;
  sortBy: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

interface TransactionFiltersProps {
  accounts: Account[];
  categories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

const DATE_PRESETS = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Last 30 Days", value: "last-30" },
  { label: "Last 90 Days", value: "last-90" },
  { label: "All Time", value: "all-time" },
  { label: "Custom", value: "custom" },
];

const SORT_OPTIONS = [
  { label: "Date (Newest)", value: "date-desc", icon: "📅" },
  { label: "Date (Oldest)", value: "date-asc", icon: "📅" },
  { label: "Amount (Highest)", value: "amount-desc", icon: "💰" },
  { label: "Amount (Lowest)", value: "amount-asc", icon: "💰" },
];

export function getDateRangeFromPreset(preset: string): { start: Date | null; end: Date | null } {
  const now = new Date();
  
  switch (preset) {
    case "this-month":
      return {
        start: startOfDay(startOfMonth(now)),
        end: endOfDay(endOfMonth(now)),
      };
    case "last-month":
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfDay(startOfMonth(lastMonth)),
        end: endOfDay(endOfMonth(lastMonth)),
      };
    case "last-30":
      return {
        start: startOfDay(subDays(now, 30)),
        end: endOfDay(now),
      };
    case "last-90":
      return {
        start: startOfDay(subDays(now, 90)),
        end: endOfDay(now),
      };
    case "all-time":
    default:
      return { start: null, end: null };
  }
}

export function TransactionFilters({
  accounts,
  categories,
  filters,
  onFiltersChange,
  totalResults,
}: TransactionFiltersProps) {
  const isMobile = useIsMobile();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip for mobile - handled by MobileSheet
    
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const updateFilters = (partial: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const handleDatePresetChange = (preset: string) => {
    const range = getDateRangeFromPreset(preset);
    updateFilters({
      dateRange: {
        start: range.start,
        end: range.end,
        preset,
      },
    });
    if (preset !== "custom") {
      setIsDatePickerOpen(false);
    }
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const date = value ? new Date(value) : null;
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        [type]: date ? (type === "start" ? startOfDay(date) : endOfDay(date)) : null,
        preset: "custom",
      },
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter((id) => id !== categoryId)
      : [...filters.selectedCategories, categoryId];
    updateFilters({ selectedCategories: newSelected });
  };

  const handleAccountToggle = (accountId: string) => {
    const newSelected = filters.selectedAccounts.includes(accountId)
      ? filters.selectedAccounts.filter((id) => id !== accountId)
      : [...filters.selectedAccounts, accountId];
    updateFilters({ selectedAccounts: newSelected });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null, preset: "all-time" },
      transactionType: "all",
      selectedCategories: [],
      selectedAccounts: [],
      uncategorizedOnly: false,
      searchQuery: "",
      sortBy: "date-desc",
    });
  };

  const activeFilterCount = 
    (filters.dateRange.preset !== "all-time" ? 1 : 0) +
    (filters.transactionType !== "all" ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.selectedAccounts.length > 0 ? 1 : 0) +
    (filters.uncategorizedOnly ? 1 : 0);

  // Get categories based on transaction type
  const filteredCategories = filters.transactionType === "all"
    ? categories
    : filters.transactionType === "transfer"
    ? []
    : categories.filter((c) => c.type === filters.transactionType);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Shared content for reuse in both mobile and desktop
  const datePickerContent = (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block">Date Range</h4>
      
      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {DATE_PRESETS.filter((p) => p.value !== "custom").map((preset) => (
          <button
            key={preset.value}
            onClick={() => {
              handleDatePresetChange(preset.value);
              if (isMobile) setIsDatePickerOpen(false);
            }}
            className={`px-3 py-3 sm:py-2 text-sm rounded-lg transition-colors ${
              filters.dateRange.preset === preset.value
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Range</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Start Date</label>
            <input
              type="date"
              value={filters.dateRange.start ? format(filters.dateRange.start, "yyyy-MM-dd") : ""}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-full px-3 py-2.5 sm:py-1.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">End Date</label>
            <input
              type="date"
              value={filters.dateRange.end ? format(filters.dateRange.end, "yyyy-MM-dd") : ""}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-full px-3 py-2.5 sm:py-1.5 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const sortContent = (
    <div className="space-y-1">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => {
            updateFilters({ sortBy: option.value as FilterState["sortBy"] });
            setIsSortDropdownOpen(false);
          }}
          className={`w-full px-4 py-3 sm:py-2 text-base sm:text-sm text-left flex items-center gap-3 rounded-lg transition-colors ${
            filters.sortBy === option.value
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <span className="text-lg">{option.icon}</span>
          <span>{option.label}</span>
          {filters.sortBy === option.value && (
            <svg className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );

  const filterMenuContent = (
    <div className="space-y-6">
      {/* Category Filter */}
      {filters.transactionType !== "transfer" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            🏷️ Categories
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filters.transactionType === "all" ? (
              <>
                {incomeCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-800">
                      💰 Income
                    </div>
                    {incomeCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 px-2 py-2.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-5 h-5 sm:w-4 sm:h-4"
                        />
                        <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                        <span className="text-base sm:text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                      </label>
                    ))}
                  </>
                )}
                {expenseCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-800">
                      💸 Expense
                    </div>
                    {expenseCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 px-2 py-2.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-5 h-5 sm:w-4 sm:h-4"
                        />
                        <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                        <span className="text-base sm:text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                      </label>
                    ))}
                  </>
                )}
              </>
            ) : (
              filteredCategories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 px-2 py-2.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={filters.selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-5 h-5 sm:w-4 sm:h-4"
                  />
                  <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                  <span className="text-base sm:text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                </label>
              ))
            )}
          </div>
          {filters.selectedCategories.length > 0 && (
            <button
              onClick={() => updateFilters({ selectedCategories: [] })}
              className="mt-2 w-full px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Clear category selection
            </button>
          )}
        </div>
      )}

      {/* Account Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          💳 Accounts
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {accounts.map((acc) => (
            <label
              key={acc.id}
              className="flex items-center gap-3 px-2 py-2.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
            >
              <input
                type="checkbox"
                checked={filters.selectedAccounts.includes(acc.id)}
                onChange={() => handleAccountToggle(acc.id)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 w-5 h-5 sm:w-4 sm:h-4"
              />
              <span>{ACCOUNT_ICONS[acc.type]}</span>
              <span className="text-base sm:text-sm text-gray-700 dark:text-gray-300">{acc.name}</span>
            </label>
          ))}
        </div>
        {filters.selectedAccounts.length > 0 && (
          <button
            onClick={() => updateFilters({ selectedAccounts: [] })}
            className="mt-2 w-full px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Clear account selection
          </button>
        )}
        {filters.transactionType === "transfer" && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Shows transfers where selected account is source or destination
          </p>
        )}
      </div>

      {/* Uncategorized Toggle */}
      {filters.transactionType !== "transfer" && (
        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              ⚠️ Uncategorized Only
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Show transactions without a category
            </p>
          </div>
          <button
            onClick={() => {
              updateFilters({
                uncategorizedOnly: !filters.uncategorizedOnly,
                selectedCategories: !filters.uncategorizedOnly ? [] : filters.selectedCategories,
              });
            }}
            className={`relative inline-flex h-7 w-12 sm:h-6 sm:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              filters.uncategorizedOnly ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                filters.uncategorizedOnly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={() => {
            clearAllFilters();
            setIsFilterMenuOpen(false);
          }}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mobile Sheets */}
      <MobileSheet
        isOpen={isDatePickerOpen && isMobile}
        onClose={() => setIsDatePickerOpen(false)}
        title="Select Date Range"
      >
        {datePickerContent}
      </MobileSheet>

      <MobileSheet
        isOpen={isSortDropdownOpen && isMobile}
        onClose={() => setIsSortDropdownOpen(false)}
        title="Sort By"
      >
        {sortContent}
      </MobileSheet>

      <MobileSheet
        isOpen={isFilterMenuOpen && isMobile}
        onClose={() => setIsFilterMenuOpen(false)}
        title="Filter Options"
      >
        {filterMenuContent}
      </MobileSheet>

      {/* Mobile-first filter bar */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Search - always full width on mobile */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search description, notes..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilters({ searchQuery: "" })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Transaction Type - horizontal scroll on mobile */}
        <div className="flex overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <div className="inline-flex rounded-xl border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700 min-w-max">
            {[
              { value: "all", label: "All", icon: "📋" },
              { value: "income", label: "Income", icon: "💰" },
              { value: "expense", label: "Expense", icon: "💸" },
              { value: "transfer", label: "Transfer", icon: "🔄" },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  updateFilters({
                    transactionType: type.value as FilterState["transactionType"],
                    selectedCategories: type.value === "transfer" ? [] : filters.selectedCategories,
                  });
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  filters.transactionType === type.value
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter buttons row */}
        <div className="flex gap-2">
          {/* Date Range Button */}
          <button
            onClick={() => setIsDatePickerOpen(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${
              filters.dateRange.preset !== "all-time"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">
              {filters.dateRange.preset === "custom" && filters.dateRange.start && filters.dateRange.end
                ? `${format(filters.dateRange.start, "MMM d")} - ${format(filters.dateRange.end, "MMM d")}`
                : DATE_PRESETS.find((p) => p.value === filters.dateRange.preset)?.label || "Date"}
            </span>
          </button>

          {/* Sort Button */}
          <button
            onClick={() => setIsSortDropdownOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Sort</span>
          </button>

          {/* Filters Button */}
          <button
            onClick={() => setIsFilterMenuOpen(true)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Filters Row */}
      <div className="hidden sm:flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search description, notes..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilters({ searchQuery: "" })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
              filters.dateRange.preset !== "all-time"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {filters.dateRange.preset === "custom" && filters.dateRange.start && filters.dateRange.end
                ? `${format(filters.dateRange.start, "MMM d")} - ${format(filters.dateRange.end, "MMM d")}`
                : DATE_PRESETS.find((p) => p.value === filters.dateRange.preset)?.label || "All Time"}
            </span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDatePickerOpen && !isMobile && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4">
                {datePickerContent}
              </div>
            </div>
          )}
        </div>

        {/* Transaction Type Segmented Control */}
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700">
          {[
            { value: "all", label: "All", icon: "📋" },
            { value: "income", label: "Income", icon: "💰" },
            { value: "expense", label: "Expense", icon: "💸" },
            { value: "transfer", label: "Transfer", icon: "🔄" },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => {
                updateFilters({
                  transactionType: type.value as FilterState["transactionType"],
                  // Clear category selection when switching to transfer
                  selectedCategories: type.value === "transfer" ? [] : filters.selectedCategories,
                });
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                filters.transactionType === type.value
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">{type.icon} </span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || "Sort"}
            </span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSortDropdownOpen && !isMobile && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-2">
                {sortContent}
              </div>
            </div>
          )}
        </div>

        {/* Filter Menu Button */}
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
              activeFilterCount > 0
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {isFilterMenuOpen && !isMobile && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filter Options</h4>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Category Filter */}
                {filters.transactionType !== "transfer" && (
                  <div ref={categoryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🏷️ Categories
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm flex items-center justify-between"
                      >
                        <span>
                          {filters.selectedCategories.length === 0
                            ? "All categories"
                            : `${filters.selectedCategories.length} selected`}
                        </span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isCategoryDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          {filters.transactionType === "all" ? (
                            <>
                              {incomeCategories.length > 0 && (
                                <>
                                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                                    💰 Income
                                  </div>
                                  {incomeCategories.map((cat) => (
                                    <label
                                      key={cat.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={filters.selectedCategories.includes(cat.id)}
                                        onChange={() => handleCategoryToggle(cat.id)}
                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                    </label>
                                  ))}
                                </>
                              )}
                              {expenseCategories.length > 0 && (
                                <>
                                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                                    💸 Expense
                                  </div>
                                  {expenseCategories.map((cat) => (
                                    <label
                                      key={cat.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={filters.selectedCategories.includes(cat.id)}
                                        onChange={() => handleCategoryToggle(cat.id)}
                                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                    </label>
                                  ))}
                                </>
                              )}
                            </>
                          ) : (
                            filteredCategories.map((cat) => (
                              <label
                                key={cat.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.selectedCategories.includes(cat.id)}
                                  onChange={() => handleCategoryToggle(cat.id)}
                                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span style={{ color: cat.color }}>{cat.icon || "📁"}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                              </label>
                            ))
                          )}
                          {filters.selectedCategories.length > 0 && (
                            <button
                              onClick={() => updateFilters({ selectedCategories: [] })}
                              className="w-full px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-left border-t border-gray-200 dark:border-gray-700"
                            >
                              Clear selection
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Filter */}
                <div ref={accountDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💳 Accounts
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                      className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm flex items-center justify-between"
                    >
                      <span>
                        {filters.selectedAccounts.length === 0
                          ? "All accounts"
                          : `${filters.selectedAccounts.length} selected`}
                      </span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isAccountDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        {accounts.map((acc) => (
                          <label
                            key={acc.id}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.selectedAccounts.includes(acc.id)}
                              onChange={() => handleAccountToggle(acc.id)}
                              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{ACCOUNT_ICONS[acc.type]}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{acc.name}</span>
                          </label>
                        ))}
                        {filters.selectedAccounts.length > 0 && (
                          <button
                            onClick={() => updateFilters({ selectedAccounts: [] })}
                            className="w-full px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-left border-t border-gray-200 dark:border-gray-700"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {filters.transactionType === "transfer" && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Shows transfers where selected account is source or destination
                    </p>
                  )}
                </div>

                {/* Uncategorized Toggle */}
                {filters.transactionType !== "transfer" && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ⚠️ Uncategorized Only
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Show transactions without a category
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        updateFilters({
                          uncategorizedOnly: !filters.uncategorizedOnly,
                          selectedCategories: !filters.uncategorizedOnly ? [] : filters.selectedCategories,
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        filters.uncategorizedOnly ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          filters.uncategorizedOnly ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Pills */}
      {(filters.selectedCategories.length > 0 || 
        filters.selectedAccounts.length > 0 || 
        filters.uncategorizedOnly ||
        filters.dateRange.preset !== "all-time" ||
        filters.transactionType !== "all") && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
          
          {filters.dateRange.preset !== "all-time" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs">
              📅 {DATE_PRESETS.find((p) => p.value === filters.dateRange.preset)?.label || "Custom"}
              <button
                onClick={() => handleDatePresetChange("all-time")}
                className="hover:text-indigo-900 dark:hover:text-indigo-100"
              >
                ×
              </button>
            </span>
          )}

          {filters.transactionType !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs">
              {filters.transactionType === "income" ? "💰" : filters.transactionType === "expense" ? "💸" : "🔄"} {filters.transactionType}
              <button
                onClick={() => updateFilters({ transactionType: "all" })}
                className="hover:text-indigo-900 dark:hover:text-indigo-100"
              >
                ×
              </button>
            </span>
          )}

          {filters.selectedCategories.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            return cat ? (
              <span
                key={catId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                <span style={{ color: cat.color }}>{cat.icon || "📁"}</span> {cat.name}
                <button
                  onClick={() => handleCategoryToggle(catId)}
                  className="hover:text-gray-900 dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}

          {filters.selectedAccounts.map((accId) => {
            const acc = accounts.find((a) => a.id === accId);
            return acc ? (
              <span
                key={accId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                {ACCOUNT_ICONS[acc.type]} {acc.name}
                <button
                  onClick={() => handleAccountToggle(accId)}
                  className="hover:text-gray-900 dark:hover:text-white"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}

          {filters.uncategorizedOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs">
              ⚠️ Uncategorized
              <button
                onClick={() => updateFilters({ uncategorizedOnly: false })}
                className="hover:text-amber-900 dark:hover:text-amber-100"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {totalResults} transaction{totalResults !== 1 ? "s" : ""} found
      </div>
    </div>
  );
}

export const defaultFilters: FilterState = {
  dateRange: { start: null, end: null, preset: "all-time" },
  transactionType: "all",
  selectedCategories: [],
  selectedAccounts: [],
  uncategorizedOnly: false,
  searchQuery: "",
  sortBy: "date-desc",
};
