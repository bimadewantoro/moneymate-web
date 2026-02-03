"use client";

import { NetWorthChart } from "./charts/NetWorthChart";

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Net Worth Progression
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your wealth over time
            </p>
          </div>
          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
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
