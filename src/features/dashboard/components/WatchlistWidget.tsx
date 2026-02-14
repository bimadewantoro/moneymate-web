"use client";

import type { BudgetStatus } from "@/server/db/queries/analytics";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface WatchlistWidgetProps {
  watchlist: BudgetStatus[];
  baseCurrency: string;
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

export function WatchlistWidget({ watchlist, baseCurrency }: WatchlistWidgetProps) {
  function formatCurrency(amount: number) {
    return formatCurrencyUtil(amount / 100, baseCurrency);
  }

  if (watchlist.length === 0) {
    return (
      <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-800">
              All budgets on track!
            </h3>
            <p className="text-sm text-green-600">
              No categories exceeding 80% of their limit
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200">
      <div className="px-6 py-4 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">👀</span>
          <h2 className="text-lg font-semibold text-amber-800">
            Watchlist
          </h2>
          <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full font-medium">
            {watchlist.length} {watchlist.length === 1 ? "category" : "categories"}
          </span>
        </div>
        <p className="text-sm text-amber-700 mt-1">
          Categories approaching or over their monthly limit
        </p>
      </div>
      <div className="divide-y divide-amber-200">
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
                  <span className="font-medium text-slate-900">
                    {item.categoryName}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formatCurrency(item.spent)} / {formatCurrency(item.monthlyBudget)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  item.percentage >= 100
                    ? "text-red-600"
                    : item.percentage >= 90
                    ? "text-orange-600"
                    : "text-yellow-600"
                }`}
              >
                {Math.round(item.percentage)}%
              </p>
              <p
                className={`text-xs ${
                  item.remaining < 0
                    ? "text-red-500"
                    : "text-slate-500"
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
