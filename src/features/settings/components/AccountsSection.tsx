"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { InlineEdit } from "@/components/common/InlineEdit";
import {
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/features/settings/actions";
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Finance Accounts
          </h2>
          <p className="text-sm text-slate-500">
            Manage your bank accounts, wallets, and investment accounts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingAccount(true)}
          className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md transition-colors text-sm font-medium min-h-11"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      {/* Add Account Form */}
      {isAddingAccount && (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <form action={handleAddAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., BCA, OVO, Cash"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  name="initialBalance"
                  step="0.01"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                />
              </div>
              {/* Currency is temporarily disabled - IDR is set as default */}
              <input type="hidden" name="currency" value="IDR" />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingAccount(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      <div className="divide-y divide-slate-100">
        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No accounts yet
            </h3>
            <p className="text-slate-500">
              Add your first account to start tracking your finances
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                !account.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">{getAccountIcon(account.type)}</div>
                <div>
                  <InlineEdit
                    value={account.name}
                    onSave={(name) => handleUpdateName(account.id, name)}
                    className="font-medium text-slate-900"
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
                      className="text-xs px-2 py-1 border border-slate-100 rounded bg-white text-slate-600"
                    >
                      {ACCOUNT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Initial: {formatCurrency(account.initialBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(account)}
                className="p-2.5 min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit account"
              >
                <Pencil className="h-4 w-4" />
              </button>
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
