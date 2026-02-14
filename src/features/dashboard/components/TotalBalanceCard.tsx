"use client";

import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface AccountBalance {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
}

interface TotalBalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  accounts: AccountBalance[];
  baseCurrency: string;
}

export function TotalBalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  accounts,
  baseCurrency,
}: TotalBalanceCardProps) {
  function formatCurrency(amount: number) {
    return formatCurrencyUtil(amount / 100, baseCurrency);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl brand-gradient p-6 text-white shadow-lg shadow-blue-700/25">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

      {/* Top row */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-white/80">
            Total Balance
          </span>
        </div>
        <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Balance */}
      <div className="relative mb-6">
        <p className="text-3xl sm:text-4xl font-bold tracking-tight">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Income / Expense row */}
      <div className="relative flex items-center gap-6">
        {/* Income */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-400/25 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-green-300" />
          </div>
          <div>
            <p className="text-[11px] text-white/60 leading-none mb-0.5">
              Income
            </p>
            <p className="text-sm font-semibold">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-white/20" />

        {/* Expense */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-400/25 rounded-lg flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4 text-red-300" />
          </div>
          <div>
            <p className="text-[11px] text-white/60 leading-none mb-0.5">
              Expense
            </p>
            <p className="text-sm font-semibold">
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Card number dots (credit-card motif) */}
      <div className="relative flex items-center gap-4 mt-6 pt-4 border-t border-white/15">
        <span className="ml-auto text-xs font-medium text-white/50">
          MoneyMate
        </span>
      </div>
    </div>
  );
}
