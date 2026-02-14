"use client";

import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface StatsCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  incomeTrend: number;
  expenseTrend: number;
  savingsRateTrend: number;
  baseCurrency: string;
}


function TrendIndicator({ value, inverted = false }: { value: number; inverted?: boolean }) {
  // For expenses, inverted=true means higher is bad
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;

  if (Math.abs(value) < 0.1) {
    return (
      <span className="text-xs text-slate-500">
        No change
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive
          ? "text-green-600"
          : isNegative
          ? "text-red-600"
          : "text-slate-500"
      }`}
    >
      {isPositive ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ) : isNegative ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ) : null}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function StatsCards({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  incomeTrend,
  expenseTrend,
  savingsRateTrend,
  baseCurrency,
}: StatsCardsProps) {
  function formatCurrency(amount: number) {
    return formatCurrencyUtil(amount / 100, baseCurrency);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <span className="text-xl">💎</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              totalBalance >= 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {totalBalance >= 0 ? "Positive" : "Negative"}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">
          Total Balance
        </p>
        <p
          className={`text-2xl font-bold ${
            totalBalance >= 0
              ? "text-slate-900"
              : "text-red-600"
          }`}
        >
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Monthly Income */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
            <span className="text-xl">💰</span>
          </div>
          <TrendIndicator value={incomeTrend} />
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">
          This Month Income
        </p>
        <p className="text-2xl font-bold text-green-600">
          +{formatCurrency(monthlyIncome)}
        </p>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg">
            <span className="text-xl">💸</span>
          </div>
          <TrendIndicator value={expenseTrend} inverted />
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">
          This Month Expenses
        </p>
        <p className="text-2xl font-bold text-red-600">
          -{formatCurrency(monthlyExpenses)}
        </p>
      </div>

      {/* Savings Rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
            <span className="text-xl">📊</span>
          </div>
          <TrendIndicator value={savingsRateTrend} />
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1">
          Savings Rate
        </p>
        <p
          className={`text-2xl font-bold ${
            savingsRate >= 20
              ? "text-green-600"
              : savingsRate >= 0
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {savingsRate.toFixed(1)}%
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {savingsRate >= 20
            ? "Great job! 🎉"
            : savingsRate >= 10
            ? "Keep going! 💪"
            : savingsRate >= 0
            ? "Room to improve"
            : "Spending more than earning"}
        </p>
      </div>
    </div>
  );
}
