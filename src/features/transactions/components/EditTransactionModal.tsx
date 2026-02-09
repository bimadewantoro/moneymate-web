"use client";

import { useState, useEffect } from "react";
import { updateTransactionAction } from "@/features/transactions/actions";

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  categoryId: string | null;
  type: "income" | "expense" | "transfer";
  fromAccountId: string | null;
  toAccountId: string | null;
  date: Date;
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

interface EditTransactionModalProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

export function EditTransactionModal({
  transaction,
  accounts,
  categories,
  isOpen,
  onClose,
}: EditTransactionModalProps) {
  const [activeType, setActiveType] = useState<"expense" | "income" | "transfer">(transaction.type);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    description: transaction.description || "",
    categoryId: transaction.categoryId || "",
    fromAccountId: transaction.fromAccountId || "",
    toAccountId: transaction.toAccountId || "",
    date: new Date(transaction.date).toISOString().split("T")[0],
  });

  // Reset form when transaction changes
  useEffect(() => {
    setActiveType(transaction.type);
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description || "",
      categoryId: transaction.categoryId || "",
      fromAccountId: transaction.fromAccountId || "",
      toAccountId: transaction.toAccountId || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
  }, [transaction]);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const currentCategories = activeType === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.set("type", activeType);
      submitFormData.set("amount", formData.amount);
      submitFormData.set("description", formData.description);
      submitFormData.set("date", formData.date);

      if (activeType !== "transfer" && formData.categoryId) {
        submitFormData.set("categoryId", formData.categoryId);
      }

      if (activeType === "expense" || activeType === "transfer") {
        submitFormData.set("fromAccountId", formData.fromAccountId);
      }

      if (activeType === "income" || activeType === "transfer") {
        submitFormData.set("toAccountId", formData.toAccountId);
      }

      const result = await updateTransactionAction(transaction.id, submitFormData);

      if (result.success) {
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Transaction
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Transaction Type Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveType("expense")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeType === "expense"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                💸 Expense
              </button>
              <button
                type="button"
                onClick={() => setActiveType("income")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeType === "income"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                💰 Income
              </button>
              <button
                type="button"
                onClick={() => setActiveType("transfer")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeType === "transfer"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                🔄 Transfer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* From Account (for expense and transfer) */}
              {(activeType === "expense" || activeType === "transfer") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {activeType === "transfer" ? "From Account *" : "Account *"}
                  </label>
                  <select
                    required
                    value={formData.fromAccountId}
                    onChange={(e) =>
                      setFormData({ ...formData, fromAccountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {ACCOUNT_ICONS[account.type]} {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* To Account (for income and transfer) */}
              {(activeType === "income" || activeType === "transfer") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {activeType === "transfer" ? "To Account *" : "Account *"}
                  </label>
                  <select
                    required
                    value={formData.toAccountId}
                    onChange={(e) =>
                      setFormData({ ...formData, toAccountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {ACCOUNT_ICONS[account.type]} {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category (not for transfers) */}
              {activeType !== "transfer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {currentCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon || "📁"} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  activeType === "transfer"
                    ? "e.g., Move savings to investment"
                    : activeType === "income"
                    ? "e.g., Monthly salary"
                    : "e.g., Lunch at restaurant"
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  activeType === "expense"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : activeType === "income"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
