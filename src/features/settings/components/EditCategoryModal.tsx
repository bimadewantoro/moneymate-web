"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { updateCategoryAction, deleteCategoryAction } from "@/features/settings/actions";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
  monthlyBudget: number | null;
  isActive: boolean;
}

interface EditCategoryModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ICONS = [
  "💼", "💻", "📈", "🎁", "💰", "🍔", "🚗", "🛒", 
  "🎮", "📄", "🏥", "📚", "📦", "🏠", "✈️", "👔",
  "🎬", "🎵", "💪", "🐕", "👶", "💇", "🔧", "📱",
];

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b",
];

export function EditCategoryModal({
  category,
  isOpen,
  onClose,
}: EditCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon || "",
    monthlyBudget: category.monthlyBudget ? category.monthlyBudget / 100 : "",
    isActive: category.isActive,
  });

  // Reset form when category changes
  useEffect(() => {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || "",
      monthlyBudget: category.monthlyBudget ? category.monthlyBudget / 100 : "",
      isActive: category.isActive,
    });
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const monthlyBudget = formData.monthlyBudget 
        ? Math.round(Number(formData.monthlyBudget) * 100)
        : null;

      const result = await updateCategoryAction(category.id, {
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon || undefined,
        monthlyBudget,
        isActive: formData.isActive,
      });

      if (result.success) {
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCategoryAction(category.id);
      if (result.success) {
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Category
            </h2>
            <button
              onClick={onClose}
              className="p-2 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Food, Salary"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              />
            </div>

            {/* Category Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "income" | "expense",
                  })
                }
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Monthly Budget (only for expense categories) */}
            {formData.type === "expense" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monthly Budget Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyBudget: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                    min="0"
                    step="1"
                    placeholder="No limit"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Leave empty for no budget limit
                </p>
              </div>
            )}

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: "" })}
                  className={`p-2 text-lg rounded-lg transition-all ${
                    formData.icon === ""
                      ? "bg-blue-50 ring-2 ring-blue-600"
                      : "hover:bg-slate-100"
                  }`}
                >
                  📁
                </button>
                {DEFAULT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`p-2 text-lg rounded-lg transition-all ${
                      formData.icon === icon
                        ? "bg-blue-50 ring-2 ring-blue-600"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Color
              </label>
              <div className="grid grid-cols-9 gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-blue-600"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-600"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700"
              >
                Active Category
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-11 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Category"}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 min-h-11 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 min-h-11 brand-gradient text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
