"use client";

import type { BudgetStatus } from "@/server/db/queries/analytics";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface BudgetProgressCardProps {
  budgets: BudgetStatus[];
  baseCurrency: string;
}


function getProgressColor(status: BudgetStatus["status"]) {
  switch (status) {
    case "safe":
      return "bg-green-500";
    case "warning":
      return "bg-yellow-500";
    case "danger":
      return "bg-orange-500";
    case "over":
      return "bg-red-500";
  }
}

function getProgressBgColor(status: BudgetStatus["status"]) {
  switch (status) {
    case "safe":
      return "bg-green-100";
    case "warning":
      return "bg-yellow-100";
    case "danger":
      return "bg-orange-100";
    case "over":
      return "bg-red-100";
  }
}

function getStatusLabel(status: BudgetStatus["status"]) {
  switch (status) {
    case "safe":
      return "On Track";
    case "warning":
      return "Watch";
    case "danger":
      return "Caution";
    case "over":
      return "Over Budget";
  }
}

function getStatusLabelColor(status: BudgetStatus["status"]) {
  switch (status) {
    case "safe":
      return "text-green-600 bg-green-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "danger":
      return "text-orange-600 bg-orange-50";
    case "over":
      return "text-red-600 bg-red-50";
  }
}

export function BudgetProgressCard({ budgets, baseCurrency }: BudgetProgressCardProps) {
  function formatCurrency(amount: number) {
    return formatCurrencyUtil(amount / 100, baseCurrency);
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Budget Overview
          </h2>
          <p className="text-sm text-slate-500">
            Track your spending against category budgets
          </p>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No budgets set
          </h3>
          <p className="text-slate-500">
            Set monthly limits on your expense categories in Settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">
          Budget Overview
        </h2>
        <p className="text-sm text-slate-500">
          Track your spending against category budgets
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {budgets.map((budget) => (
          <div key={budget.categoryId} className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{budget.categoryIcon || "📁"}</span>
                <span className="font-medium text-slate-900">
                  {budget.categoryName}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusLabelColor(budget.status)}`}
              >
                {getStatusLabel(budget.status)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={`h-2 rounded-full ${getProgressBgColor(budget.status)} overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(budget.status)}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-slate-500">
                {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyBudget)}
              </span>
              <span
                className={`font-medium ${
                  budget.remaining >= 0
                    ? "text-slate-700"
                    : "text-red-600"
                }`}
              >
                {budget.remaining >= 0
                  ? `${formatCurrency(budget.remaining)} left`
                  : `${formatCurrency(Math.abs(budget.remaining))} over`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
