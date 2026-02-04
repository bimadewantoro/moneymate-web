"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Drawer } from "vaul";
import { createTransactionAction } from "@/app/app/transactions/actions";

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

interface TransactionDrawerProps {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

export function TransactionDrawer({
  accounts,
  incomeCategories,
  expenseCategories,
  trigger,
  defaultOpen = false,
}: TransactionDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeType, setActiveType] = useState<"expense" | "income" | "transfer">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const categories = activeType === "income" ? incomeCategories : expenseCategories;

  const handleFocusWithin = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !open) return;

    content.addEventListener("focusin", handleFocusWithin);
    return () => {
      content.removeEventListener("focusin", handleFocusWithin);
    };
  }, [open, handleFocusWithin]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      formData.set("type", activeType);
      const result = await createTransactionAction(formData);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setOpen(false);
        }, 1000);
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

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {trigger || (
          <button className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center z-40 md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </button>
        )}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white dark:bg-gray-800 flex flex-col rounded-t-2xl max-h-[90vh] max-h-[90dvh] fixed bottom-0 left-0 right-0 z-50">
          {/* Handle */}
          <div 
            ref={contentRef}
            className="p-4 bg-white dark:bg-gray-800 rounded-t-2xl flex-1 overflow-y-auto overscroll-contain pb-safe"
          >
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 mb-6" />
            
            {/* Success Animation */}
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <svg
                    className="w-10 h-10 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction Added!
                </p>
              </div>
            ) : (
              <>
                <Drawer.Title className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Add Transaction
                </Drawer.Title>

                {/* Transaction Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveType("expense")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      activeType === "expense"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    💸 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveType("income")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      activeType === "income"
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    💰 Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveType("transfer")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      activeType === "transfer"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    🔄 Transfer
                  </button>
                </div>

                <form action={handleSubmit} className="space-y-5 pb-8">
                  {/* Amount - Large Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        Rp
                      </span>
                      <input
                        type="number"
                        name="amount"
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Account Selection */}
                  <div className="grid grid-cols-1 gap-4">
                    {(activeType === "expense" || activeType === "transfer") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {activeType === "transfer" ? "From Account" : "Account"}
                        </label>
                        <select
                          name="fromAccountId"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                    {(activeType === "income" || activeType === "transfer") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {activeType === "transfer" ? "To Account" : "Account"}
                        </label>
                        <select
                          name="toAccountId"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  </div>

                  {/* Category (not for transfers) */}
                  {activeType !== "transfer" && categories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {categories.slice(0, 8).map((category) => (
                          <label
                            key={category.id}
                            className="cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="categoryId"
                              value={category.id}
                              className="sr-only peer"
                            />
                            <div className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 transition-all">
                              <span className="text-xl mb-1">{category.icon || "📁"}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
                                {category.name}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      name="description"
                      placeholder="What's this for?"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 ${
                      activeType === "expense"
                        ? "bg-red-500 hover:bg-red-600"
                        : activeType === "income"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      `Add ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
