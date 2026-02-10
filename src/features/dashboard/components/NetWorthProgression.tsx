"use client";

import { NetWorthChart } from "@/components/charts/NetWorthChart";

interface NetWorthData {
  month: string;
  monthLabel: string;
  netWorth: number;
  change: number;
  changePercent: number;
}

interface NetWorthProgressionProps {
  data: NetWorthData[];
}

export function NetWorthProgression({ data }: NetWorthProgressionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Net Worth Progression
            </h2>
            <p className="text-sm text-slate-500">
              Your wealth over time
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <span className="text-xl">💎</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <NetWorthChart data={data} />
      </div>
    </div>
  );
}
