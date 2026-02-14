"use client";

import { useState, useRef, useEffect } from "react";
import { createTransactionAction } from "@/features/transactions/actions";
import { ScanReceiptButton } from "@/components/common/ScanReceiptButton";
import type { ReceiptData } from "@/features/ai/actions/scan-receipt";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
  currency: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

interface TransactionFormProps {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

export function TransactionForm({
  accounts,
  incomeCategories,
  expenseCategories,
}: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<"expense" | "income" | "transfer">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form field states for receipt scanning
  const [formValues, setFormValues] = useState({
    amount: "",
    description: "",
    categoryId: "",
    fromAccountId: "",
    toAccountId: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Refs for form inputs
  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Update input values when formValues change
  useEffect(() => {
    if (amountRef.current) amountRef.current.value = formValues.amount;
    if (descriptionRef.current) descriptionRef.current.value = formValues.description;
    if (categoryRef.current) categoryRef.current.value = formValues.categoryId;
    if (dateRef.current) dateRef.current.value = formValues.date;
  }, [formValues]);

  const handleScanComplete = (data: ReceiptData) => {
    // Map the scanned category to an existing category
    const categoryMapping: Record<string, string[]> = {
      "Food & Dining": ["food", "dining", "restaurant", "meal", "lunch", "dinner", "breakfast"],
      "Groceries": ["grocery", "groceries", "supermarket", "market"],
      "Transportation": ["transport", "transportation", "fuel", "gas", "parking", "taxi", "grab", "gojek"],
      "Shopping": ["shopping", "shop", "retail", "store", "mall"],
      "Entertainment": ["entertainment", "movie", "game", "hobby"],
      "Bills & Utilities": ["bill", "utility", "electric", "water", "internet", "phone"],
      "Health & Medical": ["health", "medical", "pharmacy", "doctor", "hospital"],
      "Education": ["education", "school", "course", "book"],
      "Travel": ["travel", "hotel", "flight", "vacation"],
    };

    // Find matching category from user's categories
    const categories = activeType === "income" ? incomeCategories : expenseCategories;
    let matchedCategoryId = "";

    // Try to match by scanned category name
    const scannedCategoryKeywords = categoryMapping[data.category] || [];
    for (const category of categories) {
      const categoryNameLower = category.name.toLowerCase();
      if (
        categoryNameLower.includes(data.category.toLowerCase()) ||
        scannedCategoryKeywords.some((kw) => categoryNameLower.includes(kw))
      ) {
        matchedCategoryId = category.id;
        break;
      }
    }

    // Update form values
    setFormValues({
      ...formValues,
      amount: data.amount.toString(),
      description: data.merchant + (data.items?.length ? ` (${data.items.length} items)` : ""),
      categoryId: matchedCategoryId,
      date: data.date,
    });

    // Ensure the form is open
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      formData.set("type", activeType);
      const result = await createTransactionAction(formData);
      if (result.success) {
        setIsOpen(false);
        // Reset form would happen on re-render
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = activeType === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Add Transaction
          </h2>
          <p className="text-sm text-slate-500">
            Record income, expenses, or transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScanReceiptButton
            onScanComplete={handleScanComplete}
            disabled={accounts.length === 0}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md transition-colors text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-45" : ""}`}
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
            {isOpen ? "Close" : "New Transaction"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 py-4">
          {/* Transaction Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveType("expense")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeType === "expense"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => setActiveType("income")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeType === "income"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💰 Income
            </button>
            <button
              type="button"
              onClick={() => setActiveType("transfer")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeType === "transfer"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🔄 Transfer
            </button>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {(() => {
                      const accountId = activeType === "income" ? formValues.toAccountId : formValues.fromAccountId;
                      const account = accounts.find(a => a.id === accountId);
                      return getCurrencySymbol(account?.currency ?? "IDR");
                    })()}
                  </span>
                  <input
                    ref={amountRef}
                    type="number"
                    name="amount"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0"
                    defaultValue={formValues.amount}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* From Account (for expense and transfer) */}
              {(activeType === "expense" || activeType === "transfer") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {activeType === "transfer" ? "From Account *" : "Account *"}
                  </label>
                  <select
                    name="fromAccountId"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {activeType === "transfer" ? "To Account *" : "Account *"}
                  </label>
                  <select
                    name="toAccountId"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    ref={categoryRef}
                    name="categoryId"
                    defaultValue={formValues.categoryId}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon || "📁"} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  ref={dateRef}
                  type="date"
                  name="date"
                  defaultValue={formValues.date}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                ref={descriptionRef}
                type="text"
                name="description"
                defaultValue={formValues.description}
                placeholder={
                  activeType === "transfer"
                    ? "e.g., Move savings to investment"
                    : activeType === "income"
                    ? "e.g., Monthly salary"
                    : "e.g., Lunch at restaurant"
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  activeType === "expense"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : activeType === "income"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? "Saving..." : `Add ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
