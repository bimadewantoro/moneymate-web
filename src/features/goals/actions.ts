"use server";

import { auth } from "@/auth";
import { createGoal } from "@/server/db/mutations/goals";
import { addMoneyToGoal } from "@/server/db/mutations/goals";
import { deleteGoal } from "@/server/db/mutations/goals";
import { revalidatePath } from "next/cache";
import { type Result, ok, okVoid, err } from "@/types";
import type { Goal } from "@/server/db/schema";

// ============================================
// SAVINGS GOALS SERVER ACTIONS
// ============================================

export async function createGoalAction(
  formData: FormData
): Promise<Result<Goal>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const name = formData.get("name") as string;
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const targetDateStr = formData.get("targetDate") as string;
  const icon = formData.get("icon") as string | null;

  if (!name || name.trim().length === 0) {
    return err("Goal name is required");
  }

  if (isNaN(targetAmount) || targetAmount <= 0) {
    return err("Target amount must be a positive number");
  }

  if (!targetDateStr) {
    return err("Target date is required");
  }

  try {
    const goal = await createGoal(session.user.id, {
      name: name.trim(),
      targetAmount: Math.round(targetAmount * 100), // Convert to cents
      targetDate: new Date(targetDateStr),
      icon: icon || undefined,
    });

    revalidatePath("/dashboard");
    return ok(goal);
  } catch (error) {
    console.error("Failed to create goal:", error);
    return err("Failed to create goal");
  }
}

export async function addMoneyToGoalAction(
  goalId: string,
  formData: FormData
): Promise<Result<Goal>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const amount = parseFloat(formData.get("amount") as string);

  if (isNaN(amount) || amount <= 0) {
    return err("Amount must be a positive number");
  }

  try {
    const goal = await addMoneyToGoal(
      goalId,
      session.user.id,
      Math.round(amount * 100) // Convert to cents
    );

    if (!goal) {
      return err("Goal not found");
    }

    revalidatePath("/dashboard");
    return ok(goal);
  } catch (error) {
    console.error("Failed to add money to goal:", error);
    return err("Failed to add funds");
  }
}

export async function deleteGoalAction(
  goalId: string
): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const goal = await deleteGoal(goalId, session.user.id);

    if (!goal) {
      return err("Goal not found");
    }

    revalidatePath("/dashboard");
    return okVoid();
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return err("Failed to delete goal");
  }
}
