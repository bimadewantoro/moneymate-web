"use client";

import type { BudgetStatus } from "@/lib/queries";

interface WatchlistWidgetProps {
  watchlist: BudgetStatus[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function getStatusEmoji(status: BudgetStatus["status"]) {
  switch (status) {
    case "warning":
      return "⚠️";
    case "danger":
      return "🔥";
    case "over":
      return "🚨";
    default:
      return "👀";
  }
}

export function WatchlistWidget({ watchlist }: WatchlistWidgetProps) {
  if (watchlist.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-200">
              All budgets on track!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              No categories exceeding 80% of their limit
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800">
      <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">👀</span>
          <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
            Watchlist
          </h2>
          <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs rounded-full font-medium">
            {watchlist.length} {watchlist.length === 1 ? "category" : "categories"}
          </span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
          Categories approaching or over their monthly limit
        </p>
      </div>
      <div className="divide-y divide-amber-200 dark:divide-amber-800/50">
        {watchlist.map((item) => (
          <div
            key={item.categoryId}
            className="px-6 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getStatusEmoji(item.status)}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.categoryIcon || "📁"}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.categoryName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.spent)} / {formatCurrency(item.monthlyBudget)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  item.percentage >= 100
                    ? "text-red-600 dark:text-red-400"
                    : item.percentage >= 90
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {Math.round(item.percentage)}%
              </p>
              <p
                className={`text-xs ${
                  item.remaining < 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.remaining >= 0
                  ? `${formatCurrency(item.remaining)} left`
                  : `${formatCurrency(Math.abs(item.remaining))} over`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
