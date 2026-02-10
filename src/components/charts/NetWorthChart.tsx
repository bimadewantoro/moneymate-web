"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface NetWorthData {
  month: string;
  monthLabel: string;
  netWorth: number;
  change: number;
  changePercent: number;
}

interface NetWorthChartProps {
  data: NetWorthData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: NetWorthData;
  }>;
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
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    const isPositive = data.change >= 0;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
        <p className="font-medium text-slate-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 text-sm">Net Worth</span>
            <span className="font-bold text-slate-900">
              {formatCurrencyFull(data.netWorth)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 text-sm">Change</span>
            <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}{formatCurrencyFull(data.change)}
            </span>
          </div>
          {data.changePercent !== 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-600 text-sm">% Change</span>
              <span className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{data.changePercent.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  if (data.length === 0 || data.every(d => d.netWorth === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-slate-500">
        <div className="text-4xl mb-3">💎</div>
        <p className="text-sm">No net worth data yet</p>
        <p className="text-xs mt-1">Add transactions to track your wealth</p>
      </div>
    );
  }

  const latestNetWorth = data[data.length - 1]?.netWorth || 0;
  const previousNetWorth = data[data.length - 2]?.netWorth || 0;
  const totalChange = latestNetWorth - (data[0]?.netWorth || 0);
  const isPositiveTrend = latestNetWorth >= previousNetWorth;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
          <XAxis
            dataKey="monthLabel"
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-500"
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            className="text-slate-500"
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke={isPositiveTrend ? "#22c55e" : "#ef4444"}
            strokeWidth={2}
            fill="url(#netWorthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-slate-500">Current</p>
          <p className="font-bold text-slate-900">
            {formatCurrencyFull(latestNetWorth)}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="text-center">
          <p className="text-slate-500">Total Change</p>
          <p className={`font-bold ${totalChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalChange >= 0 ? "+" : ""}{formatCurrencyFull(totalChange)}
          </p>
        </div>
      </div>
    </div>
  );
}
