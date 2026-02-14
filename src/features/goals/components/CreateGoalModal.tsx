"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createGoalAction } from "@/features/goals/actions";
import { Loader2, Target } from "lucide-react";

const GOAL_ICONS = [
  { emoji: "🏖️", label: "Holiday" },
  { emoji: "🚗", label: "Car" },
  { emoji: "🏠", label: "House" },
  { emoji: "📱", label: "Gadget" },
  { emoji: "🎓", label: "Education" },
  { emoji: "💍", label: "Wedding" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "🛍️", label: "Shopping" },
  { emoji: "💊", label: "Health" },
  { emoji: "🐱", label: "Pet" },
  { emoji: "🎯", label: "Other" },
];

interface CreateGoalModalProps {
  children: React.ReactNode;
}

export function CreateGoalModal({ children }: CreateGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("🎯");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("icon", selectedIcon);

    const result = await createGoalAction(formData);

    if (result.success) {
      setOpen(false);
      setSelectedIcon("🎯");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>
                Set a target and start saving towards it
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label
              htmlFor="goal-name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Goal Name
            </label>
            <input
              id="goal-name"
              name="name"
              type="text"
              required
              placeholder="e.g. Holiday to Bali"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon.emoji}
                  type="button"
                  onClick={() => setSelectedIcon(icon.emoji)}
                  title={icon.label}
                  className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all",
                    selectedIcon === icon.emoji
                      ? "bg-blue-100 ring-2 ring-blue-500 scale-110"
                      : "bg-slate-50 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="goal-target"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Target Amount
            </label>
            <input
              id="goal-target"
              name="targetAmount"
              type="number"
              min="1"
              step="any"
              required
              placeholder="5000000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Target Date */}
          <div>
            <label
              htmlFor="goal-date"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Target Date
            </label>
            <input
              id="goal-date"
              name="targetDate"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-700 to-green-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Goal"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
