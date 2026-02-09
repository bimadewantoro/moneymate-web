"use client";

interface StatsCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  incomeTrend: number;
  expenseTrend: number;
  savingsRateTrend: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function TrendIndicator({ value, inverted = false }: { value: number; inverted?: boolean }) {
  // For expenses, inverted=true means higher is bad
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;

  if (Math.abs(value) < 0.1) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        No change
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive
          ? "text-green-600 dark:text-green-400"
          : isNegative
          ? "text-red-600 dark:text-red-400"
          : "text-gray-500 dark:text-gray-400"
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
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Balance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
            <span className="text-xl">💎</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              totalBalance >= 0
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {totalBalance >= 0 ? "Positive" : "Negative"}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Total Balance
        </p>
        <p
          className={`text-2xl font-bold ${
            totalBalance >= 0
              ? "text-gray-900 dark:text-white"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Monthly Income */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
            <span className="text-xl">💰</span>
          </div>
          <TrendIndicator value={incomeTrend} />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          This Month Income
        </p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          +{formatCurrency(monthlyIncome)}
        </p>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg">
            <span className="text-xl">💸</span>
          </div>
          <TrendIndicator value={expenseTrend} inverted />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          This Month Expenses
        </p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          -{formatCurrency(monthlyExpenses)}
        </p>
      </div>

      {/* Savings Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
            <span className="text-xl">📊</span>
          </div>
          <TrendIndicator value={savingsRateTrend} />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Savings Rate
        </p>
        <p
          className={`text-2xl font-bold ${
            savingsRate >= 20
              ? "text-green-600 dark:text-green-400"
              : savingsRate >= 0
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {savingsRate.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
