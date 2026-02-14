"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { AddMoneyModal } from "./AddMoneyModal";
import { deleteGoalAction } from "@/features/goals/actions";
import {
  MoreHorizontal,
  Trash2,
  Plus,
  CalendarDays,
  Loader2,
} from "lucide-react";
import type { Goal } from "@/server/db/schema";
import { formatCurrency } from "@/lib/utils/currency";

function formatGoalCurrency(amountInCents: number, currency: string) {
  return formatCurrency(amountInCents / 100, currency);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const percentage =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      : 0;

  const isCompleted = goal.currentAmount >= goal.targetAmount;

  async function handleDelete() {
    setDeleting(true);
    await deleteGoalAction(goal.id);
    setDeleting(false);
    setMenuOpen(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Completed shimmer overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-emerald-50/40 pointer-events-none" />
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl">
            {goal.icon || "🎯"}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">
              {goal.name}
            </h3>
            {isCompleted && (
              <span className="text-xs font-medium text-green-600">
                🎉 Goal reached!
              </span>
            )}
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 w-36">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress section */}
      <div className="px-5 pb-3 relative">
        <Progress
          value={percentage}
          indicatorClassName="bg-gradient-to-r from-blue-700 to-green-500"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-slate-900">
            <span className="font-semibold">
              {formatGoalCurrency(goal.currentAmount, goal.currency)}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-500">
              {formatGoalCurrency(goal.targetAmount, goal.currency)}
            </span>
          </p>
          <span
            className={[
              "text-xs font-bold px-2 py-0.5 rounded-full",
              isCompleted
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex items-center justify-between relative">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDate(new Date(goal.targetDate))}</span>
        </div>

        <AddMoneyModal goalId={goal.id} goalName={goal.name}>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Funds
          </button>
        </AddMoneyModal>
      </div>
    </div>
  );
}
