"use client";

import type { BudgetStatus } from "@/lib/queries";

interface BudgetProgressCardProps {
  budgets: BudgetStatus[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
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
      return "bg-green-100 dark:bg-green-900/30";
    case "warning":
      return "bg-yellow-100 dark:bg-yellow-900/30";
    case "danger":
      return "bg-orange-100 dark:bg-orange-900/30";
    case "over":
      return "bg-red-100 dark:bg-red-900/30";
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
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30";
    case "danger":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
    case "over":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
  }
}

export function BudgetProgressCard({ budgets }: BudgetProgressCardProps) {
  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Budget Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your spending against category budgets
          </p>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No budgets set
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Set monthly limits on your expense categories in Settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Budget Overview
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track your spending against category budgets
        </p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {budgets.map((budget) => (
          <div key={budget.categoryId} className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{budget.categoryIcon || "📁"}</span>
                <span className="font-medium text-gray-900 dark:text-white">
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
              <span className="text-gray-500 dark:text-gray-400">
                {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyBudget)}
              </span>
              <span
                className={`font-medium ${
                  budget.remaining >= 0
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-red-600 dark:text-red-400"
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
