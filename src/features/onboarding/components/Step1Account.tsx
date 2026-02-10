"use client";

import { useState } from "react";

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank Account", icon: "🏦", description: "BCA, Mandiri, BNI, etc." },
  { value: "cash", label: "Cash", icon: "💵", description: "Physical cash on hand" },
  { value: "e-wallet", label: "E-Wallet", icon: "📱", description: "OVO, GoPay, Dana, etc." },
] as const;

interface AccountData {
  name: string;
  type: "bank" | "cash" | "e-wallet";
  initialBalance: number;
}

interface Step1AccountProps {
  initialData: AccountData | null;
  onComplete: (data: AccountData) => void;
}

export function Step1Account({ initialData, onComplete }: Step1AccountProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"bank" | "cash" | "e-wallet">(
    initialData?.type || "bank"
  );
  const [initialBalance, setInitialBalance] = useState(
    initialData?.initialBalance?.toString() || "0"
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter an account name");
      return;
    }

    onComplete({
      name: name.trim(),
      type,
      initialBalance: parseFloat(initialBalance) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="px-6 py-8 text-center border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏦</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Create Your First Account
        </h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Let&apos;s start by setting up your primary account to track your finances
        </p>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-6">
        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Account Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Main Wallet, BCA Savings"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900 placeholder-slate-400 text-lg"
            autoFocus
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Account Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ACCOUNT_TYPES.map((accountType) => (
              <button
                key={accountType.value}
                type="button"
                onClick={() => setType(accountType.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  type === accountType.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-2">{accountType.icon}</div>
                <div className="font-medium text-slate-900">
                  {accountType.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {accountType.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Initial Balance */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Initial Balance
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              Rp
            </span>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white text-slate-900 text-lg"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Enter your current balance in this account (optional, default is 0)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button
          type="submit"
          className="w-full py-3 px-4 brand-gradient text-white rounded-xl hover:shadow-md transition-colors font-medium text-lg flex items-center justify-center gap-2"
        >
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
