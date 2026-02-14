"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { InlineEdit } from "@/components/common/InlineEdit";
import { ColorPicker } from "@/components/common/ColorPicker";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  initializeDefaultCategoriesAction,
} from "@/features/settings/actions";
import { EditCategoryModal } from "./EditCategoryModal";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/currency";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  monthlyBudget: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesSectionProps {
  categories: Category[];
  baseCurrency: string;
}

const DEFAULT_ICONS = [
  "💼", "💻", "📈", "🎁", "💰", "🍔", "🚗", "🛒", 
  "🎮", "📄", "🏥", "📚", "📦", "🏠", "✈️", "👔",
  "🎬", "🎵", "💪", "🐕", "👶", "💇", "🔧", "📱",
];

export function CategoriesSection({ categories, baseCurrency }: CategoriesSectionProps) {
  function formatBudget(amount: number) {
    return formatCurrency(amount / 100, baseCurrency);
  }

  function formatBudgetCompact(amount: number) {
    return formatCurrencyCompact(amount / 100, baseCurrency);
  }

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const displayCategories = activeTab === "income" ? incomeCategories : expenseCategories;

  const handleAddCategory = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createCategoryAction(formData);
      if (result.success) {
        setIsAddingCategory(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateName = async (categoryId: string, name: string) => {
    const result = await updateCategoryAction(categoryId, { name });
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUpdateColor = async (categoryId: string, color: string) => {
    const result = await updateCategoryAction(categoryId, { color });
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUpdateIcon = async (categoryId: string, icon: string) => {
    const result = await updateCategoryAction(categoryId, { icon });
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm("This will create default categories. Continue?")) {
      return;
    }

    setIsInitializing(true);
    try {
      const result = await initializeDefaultCategoriesAction();
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error initializing categories:", error);
      alert("Failed to initialize categories");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Categories
          </h2>
          <p className="text-sm text-slate-500">
            Organize your transactions with custom categories
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <button
              type="button"
              onClick={handleInitializeDefaults}
              disabled={isInitializing}
              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isInitializing ? "Creating..." : "Use Defaults"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md transition-colors text-sm font-medium min-h-11"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-slate-100">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "expense"
                ? "border-red-500 text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Expense ({expenseCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "income"
                ? "border-green-500 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Income ({incomeCategories.length})
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <form action={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Food, Salary"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  required
                  defaultValue={activeTab}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  name="monthlyBudget"
                  min="0"
                  step="1000"
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#6366f1"
                  className="w-full h-10 px-1 py-1 border border-slate-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                >
                  <option value="">No icon</option>
                  {DEFAULT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="divide-y divide-slate-100">
        {displayCategories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No {activeTab} categories yet
            </h3>
            <p className="text-slate-500">
              {categories.length === 0
                ? 'Click "Use Defaults" to get started quickly, or add your own'
                : "Add a category to organize your transactions"}
            </p>
          </div>
        ) : (
          displayCategories.map((category) => (
            <div
              key={category.id}
              className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                !category.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <ColorPicker
                  value={category.color}
                  onChange={(color) => handleUpdateColor(category.id, color)}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <select
                    value={category.icon || ""}
                    onChange={(e) => handleUpdateIcon(category.id, e.target.value)}
                    className="text-xl bg-transparent border-none focus:ring-0 cursor-pointer shrink-0"
                    style={{ width: "2.5rem" }}
                  >
                    <option value="">📁</option>
                    {DEFAULT_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <div className="min-w-0 flex-1">
                    <InlineEdit
                      value={category.name}
                      onSave={(name) => handleUpdateName(category.id, name)}
                      className="font-medium text-slate-900"
                    />
                    {category.type === "expense" && (
                      category.monthlyBudget ? (
                        <p className="text-xs text-slate-500">
                          Budget: {formatBudgetCompact(category.monthlyBudget)}/mo
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          + Set Budget
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span
                  className={`hidden sm:inline text-xs px-2 py-1 rounded-full ${
                    category.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.type}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCategory(category)}
                  className="p-2.5 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          baseCurrency={baseCurrency}
        />
      )}
    </div>
  );
}
