"use client";

import { useState } from "react";

interface Category {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
}

interface Step2CategoriesProps {
  defaultCategories: Category[];
  initialSelected: string[];
  onComplete: (selectedCategories: string[]) => void;
  onBack: () => void;
}

export function Step2Categories({
  defaultCategories,
  initialSelected,
  onComplete,
  onBack,
}: Step2CategoriesProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected)
  );
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  const incomeCategories = defaultCategories.filter((c) => c.type === "income");
  const expenseCategories = defaultCategories.filter((c) => c.type === "expense");
  const displayCategories = activeTab === "income" ? incomeCategories : expenseCategories;

  const toggleCategory = (name: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set(selected);
    displayCategories.forEach((c) => newSelected.add(c.name));
    setSelected(newSelected);
  };

  const deselectAll = () => {
    const newSelected = new Set(selected);
    displayCategories.forEach((c) => newSelected.delete(c.name));
    setSelected(newSelected);
  };

  const handleContinue = () => {
    onComplete(Array.from(selected));
  };

  const selectedCount = displayCategories.filter((c) => selected.has(c.name)).length;
  const totalSelected = Array.from(selected).length;

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-8 text-center border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏷️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Categories
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Select the categories you want to use. All are selected by default, tap to deselect.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "expense"
                ? "border-red-500 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Expenses ({expenseCategories.filter((c) => selected.has(c.name)).length}/{expenseCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "income"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Income ({incomeCategories.filter((c) => selected.has(c.name)).length}/{incomeCategories.length})
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCount} of {displayCategories.length} selected
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 font-medium"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {displayCategories.map((category) => {
            const isSelected = selected.has(category.name);
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => toggleCategory(category.name)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-75"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                    isSelected ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <div
                  className={`text-sm font-medium ${
                    isSelected
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {category.name}
                </div>
                {/* Selection indicator */}
                <div className="mt-2">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full mx-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={totalSelected === 0}
          className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
