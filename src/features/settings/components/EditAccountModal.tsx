"use client";

import { useState, useEffect } from "react";
import { updateAccountAction } from "@/features/settings/actions";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
  initialBalance: number;
  currency: string;
  icon: string | null;
  isActive: boolean;
}

interface EditAccountModalProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "e-wallet", label: "E-Wallet", icon: "📱" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "other", label: "Other", icon: "💳" },
] as const;

export function EditAccountModal({
  account,
  isOpen,
  onClose,
}: EditAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance.toString(),
    currency: account.currency,
    isActive: account.isActive,
  });

  // Reset form when account changes
  useEffect(() => {
    setFormData({
      name: account.name,
      type: account.type,
      initialBalance: account.initialBalance.toString(),
      currency: account.currency,
      isActive: account.isActive,
    });
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateAccountAction(account.id, {
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        currency: "IDR", // Currency is temporarily disabled - IDR is set as default
        isActive: formData.isActive,
      });

      if (result.success) {
        onClose();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      alert("Failed to update account");
    } finally {
      setIsSubmitting(false);
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
              Edit Account
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
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
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., BCA, OVO, Cash"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as typeof formData.type,
                  })
                }
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Balance */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Initial Balance
              </label>
              <input
                type="number"
                value={formData.initialBalance}
                onChange={(e) =>
                  setFormData({ ...formData, initialBalance: e.target.value })
                }
                step="0.01"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
              />
            </div>

            {/* Currency is temporarily disabled - IDR is set as default */}

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
                Active Account
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-colors"
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
