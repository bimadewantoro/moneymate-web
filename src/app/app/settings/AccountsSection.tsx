"use client";

import { useState } from "react";
import { InlineEdit } from "@/components/InlineEdit";
import {
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "./actions";
import { EditAccountModal } from "./EditAccountModal";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
  initialBalance: number;
  currency: string;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountsSectionProps {
  accounts: Account[];
}

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "e-wallet", label: "E-Wallet", icon: "📱" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "other", label: "Other", icon: "💳" },
] as const;

export function AccountsSection({ accounts }: AccountsSectionProps) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleAddAccount = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createAccountAction(formData);
      if (result.success) {
        setIsAddingAccount(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateName = async (accountId: string, name: string) => {
    const result = await updateAccountAction(accountId, { name });
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUpdateType = async (
    accountId: string,
    type: "bank" | "cash" | "e-wallet" | "investment" | "other"
  ) => {
    const result = await updateAccountAction(accountId, { type });
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) {
      return;
    }

    setDeletingId(accountId);
    try {
      const result = await deleteAccountAction(accountId);
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  const getAccountIcon = (type: string) => {
    return ACCOUNT_TYPES.find((t) => t.value === type)?.icon || "💳";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Finance Accounts
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your bank accounts, wallets, and investment accounts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingAccount(true)}
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
          Add Account
        </button>
      </div>

      {/* Add Account Form */}
      {isAddingAccount && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <form action={handleAddAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., BCA, OVO, Cash"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  name="initialBalance"
                  step="0.01"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              {/* Currency is temporarily disabled - IDR is set as default */}
              <input type="hidden" name="currency" value="IDR" />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingAccount(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No accounts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add your first account to start tracking your finances
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                !account.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getAccountIcon(account.type)}</div>
                <div>
                  <InlineEdit
                    value={account.name}
                    onSave={(name) => handleUpdateName(account.id, name)}
                    className="font-medium text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={account.type}
                      onChange={(e) =>
                        handleUpdateType(
                          account.id,
                          e.target.value as typeof account.type
                        )
                      }
                      className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      {ACCOUNT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Initial: {formatCurrency(account.initialBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAccount(account)}
                  className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  title="Edit account"
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
                  onClick={() => handleDelete(account.id)}
                  disabled={deletingId === account.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete account"
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

      {/* Edit Account Modal */}
      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  );
}
