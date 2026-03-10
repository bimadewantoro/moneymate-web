"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  createAccountAction,
} from "@/features/settings/actions";
import { EditAccountModal } from "./EditAccountModal";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
  initialBalance: number;
  currentBalance: number;
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
  { value: "bank",       label: "Bank",       icon: "🏦", fullLabel: "Bank Account" },
  { value: "cash",       label: "Cash",       icon: "💵", fullLabel: "Cash" },
  { value: "e-wallet",   label: "E-Wallet",   icon: "📱", fullLabel: "E-Wallet" },
  { value: "investment", label: "Investment", icon: "📈", fullLabel: "Investment" },
  { value: "other",      label: "Other",      icon: "💳", fullLabel: "Other" },
] as const;

function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getAccountMeta(type: string) {
  return ACCOUNT_TYPES.find((t) => t.value === type) ?? ACCOUNT_TYPES[4];
}

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Finance Accounts</h2>
        <p className="text-sm text-slate-500">
          Manage your bank accounts, wallets, and investment accounts
        </p>
      </div>

      {/* Inline add form */}
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
                  step="1"
                  defaultValue="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900"
                />
              </div>
              <input type="hidden" name="currency" value="IDR" />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingAccount(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const meta = getAccountMeta(account.type);
            return (
              <div
                key={account.id}
                className={`bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 ${
                  !account.isActive ? "opacity-50" : ""
                }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                    {meta.icon}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAccount(account)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit account"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                {/* Card body */}
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {account.name}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                    {formatCurrency(account.currentBalance, account.currency)}
                  </p>
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">{meta.fullLabel}</span>
                </div>
              </div>
            );
          })}

          {/* Add Wallet card */}
          {!isAddingAccount && (
            <button
              type="button"
              onClick={() => setIsAddingAccount(true)}
              className="min-h-42 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-700 transition-colors">
                Add Wallet
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Edit modal */}
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
