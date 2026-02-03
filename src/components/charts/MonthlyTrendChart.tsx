"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

interface TooltipPayload {
  value?: number;
  dataKey?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(amount / 100);
}

function formatCurrencyFull(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const income = payload.find(p => p.dataKey === "income")?.value || 0;
    const expense = payload.find(p => p.dataKey === "expense")?.value || 0;
    const net = Number(income) - Number(expense);

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-green-600 dark:text-green-400 text-sm">Income</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{formatCurrencyFull(Number(income))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-red-600 dark:text-red-400 text-sm">Expense</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{formatCurrencyFull(Number(expense))}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Net</span>
              <span className={`font-bold ${net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {net >= 0 ? "+" : ""}{formatCurrencyFull(net)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0 || data.every(d => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-sm">No trend data yet</p>
        <p className="text-xs mt-1">Add transactions to see monthly trends</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="monthLabel" 
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-gray-500 dark:text-gray-400"
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fill: 'currentColor', fontSize: 12 }}
          className="text-gray-500 dark:text-gray-400"
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => (
            <span className="text-gray-700 dark:text-gray-300 text-sm capitalize">{value}</span>
          )}
        />
        <Bar 
          dataKey="income" 
          name="Income"
          fill="#22c55e" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          name="Expense"
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
