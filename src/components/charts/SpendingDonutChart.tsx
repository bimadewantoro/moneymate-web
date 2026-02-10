"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState } from "react";

interface CategoryData {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string | null;
  total: number;
  count: number;
}

interface SpendingDonutChartProps {
  data: CategoryData[];
  onCategoryClick?: (categoryId: string | null) => void;
}

interface ChartDataItem extends CategoryData {
  percentage: string;
}

interface TooltipPayload {
  payload: ChartDataItem;
}

interface LegendPayload {
  color: string;
  value: string;
  payload: ChartDataItem;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

function CustomTooltip({ 
  active, 
  payload 
}: { 
  active?: boolean; 
  payload?: TooltipPayload[];
}) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <span>{item.icon || "📁"}</span>
          <span className="font-medium text-slate-900">{item.name}</span>
        </div>
        <p className="text-lg font-bold text-slate-900">
          {formatCurrency(item.total)}
        </p>
        <p className="text-xs text-slate-500">
          {item.percentage}% of total • {item.count} transactions
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ 
  payload, 
  onCategoryClick 
}: { 
  payload?: LegendPayload[];
  onCategoryClick?: (categoryId: string | null) => void;
}) {
  if (!payload) return null;
  
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.slice(0, 6).map((entry, index) => (
        <button
          key={index}
          onClick={() => onCategoryClick?.(entry.payload.categoryId)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs hover:bg-slate-50 transition-colors"
        >
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-700">{entry.value}</span>
        </button>
      ))}
      {payload.length > 6 && (
        <span className="text-xs text-slate-500 px-2 py-1">
          +{payload.length - 6} more
        </span>
      )}
    </div>
  );
}

export function SpendingDonutChart({ data, onCategoryClick }: SpendingDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalSpending = data.reduce((sum, item) => sum + item.total, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-sm">No expense data yet</p>
        <p className="text-xs mt-1">Add some expenses to see your spending breakdown</p>
      </div>
    );
  }

  const chartData: ChartDataItem[] = data.map((item) => ({
    ...item,
    percentage: totalSpending > 0 ? ((item.total / totalSpending) * 100).toFixed(1) : "0",
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total"
            nameKey="name"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(data) => onCategoryClick?.(data.categoryId)}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                stroke={activeIndex === index ? entry.color : "transparent"}
                strokeWidth={activeIndex === index ? 3 : 0}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend onCategoryClick={onCategoryClick} />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-30px' }}>
        <div className="text-center">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(totalSpending)}
          </p>
        </div>
      </div>
    </div>
  );
}
