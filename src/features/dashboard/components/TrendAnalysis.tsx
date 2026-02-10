"use client";

import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";

interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

interface TrendAnalysisProps {
  data: MonthlyData[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const avgIncome = data.length > 0 ? totalIncome / data.length : 0;
  const avgExpense = data.length > 0 ? totalExpense / data.length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">
          Income vs Expenses
        </h2>
        <p className="text-sm text-slate-500">
          Last 6 months trend
        </p>
      </div>

      <div className="p-6">
        <MonthlyTrendChart data={data} />

        {/* Summary Stats */}
        {data.some(d => d.income > 0 || d.expense > 0) && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-600 mb-1">
                Avg. Monthly Income
              </p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(avgIncome)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-red-600 mb-1">
                Avg. Monthly Expense
              </p>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(avgExpense)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
