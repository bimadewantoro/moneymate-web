"use client";

import Link from "next/link";
import { SpendingDonutChart } from "@/components/charts/SpendingDonutChart";

interface CategoryData {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string | null;
  total: number;
  count: number;
}

interface SpendingBreakdownProps {
  data: CategoryData[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

export function SpendingBreakdown({ data }: SpendingBreakdownProps) {
  const totalSpending = data.reduce((sum, item) => sum + item.total, 0);
  const topCategories = data.slice(0, 5);

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      window.location.href = `/transactions?category=${categoryId}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Spending Breakdown
          </h2>
          <p className="text-sm text-slate-500">
            Where your money goes
          </p>
        </div>
        {totalSpending > 0 && (
          <Link
            href="/transactions?type=expense"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="p-6">
        <div className="relative">
          <SpendingDonutChart data={data} onCategoryClick={handleCategoryClick} />
        </div>

        {/* Top Categories List */}
        {data.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-slate-700">
              Top Categories
            </h3>
            {topCategories.map((category, index) => {
              const percentage = totalSpending > 0 
                ? ((category.total / totalSpending) * 100).toFixed(1)
                : "0";

              return (
                <Link
                  key={category.categoryId || index}
                  href={category.categoryId ? `/transactions?category=${category.categoryId}` : "/transactions?type=expense"}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </span>
                      <span className="text-sm font-medium text-slate-900 ml-2">
                        {formatCurrency(category.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
