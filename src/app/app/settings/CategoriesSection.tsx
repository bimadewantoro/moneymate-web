"use client";

import { useState } from "react";
import { InlineEdit } from "@/components/InlineEdit";
import { ColorPicker } from "@/components/ColorPicker";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  initializeDefaultCategoriesAction,
} from "./actions";
import { EditCategoryModal } from "./EditCategoryModal";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesSectionProps {
  categories: Category[];
}

const DEFAULT_ICONS = [
  "💼", "💻", "📈", "🎁", "💰", "🍔", "🚗", "🛒", 
  "🎮", "📄", "🏥", "📚", "📦", "🏠", "✈️", "👔",
  "🎬", "🎵", "💪", "🐕", "👶", "💇", "🔧", "📱",
];

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeletingId(categoryId);
    try {
      const result = await deleteCategoryAction(categoryId);
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } finally {
      setDeletingId(null);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organize your transactions with custom categories
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <button
              type="button"
              onClick={handleInitializeDefaults}
              disabled={isInitializing}
              className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isInitializing ? "Creating..." : "Use Defaults"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Category
          </button>
        </div>
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
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Expense ({expenseCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "income"
                ? "border-green-500 text-green-600 dark:text-green-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Income ({incomeCategories.length})
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <form action={handleAddCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Food, Salary"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  required
                  defaultValue={activeTab}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  defaultValue="#6366f1"
                  className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <select
                  name="icon"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayCategories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No {activeTab} categories yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {categories.length === 0
                ? 'Click "Use Defaults" to get started quickly, or add your own'
                : "Add a category to organize your transactions"}
            </p>
          </div>
        ) : (
          displayCategories.map((category) => (
            <div
              key={category.id}
              className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                !category.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <ColorPicker
                  value={category.color}
                  onChange={(color) => handleUpdateColor(category.id, color)}
                />
                <div className="flex items-center gap-2">
                  <select
                    value={category.icon || ""}
                    onChange={(e) => handleUpdateIcon(category.id, e.target.value)}
                    className="text-xl bg-transparent border-none focus:ring-0 cursor-pointer"
                    style={{ width: "2.5rem" }}
                  >
                    <option value="">📁</option>
                    {DEFAULT_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <InlineEdit
                    value={category.name}
                    onSave={(name) => handleUpdateName(category.id, name)}
                    className="font-medium text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    category.type === "income"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {category.type}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCategory(category)}
                  className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete category"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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
        />
      )}
    </div>
  );
}
