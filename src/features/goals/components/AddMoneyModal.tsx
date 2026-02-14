"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addMoneyToGoalAction } from "@/features/goals/actions";
import { Loader2, PiggyBank } from "lucide-react";

interface AddMoneyModalProps {
  goalId: string;
  goalName: string;
  children: React.ReactNode;
}

export function AddMoneyModal({ goalId, goalName, children }: AddMoneyModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await addMoneyToGoalAction(goalId, formData);

    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[400px]">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>
                Add money to &ldquo;{goalName}&rdquo;
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

          <div>
            <label
              htmlFor="add-amount"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Amount
            </label>
            <input
              id="add-amount"
              name="amount"
              type="number"
              min="1"
              step="any"
              required
              placeholder="100000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

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
                  Adding…
                </>
              ) : (
                "Add Funds"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
