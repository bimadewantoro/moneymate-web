/**
 * Savings Goals Mutations (Data Access Layer)
 *
 * All write operations for savings goals.
 */

import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Create a new savings goal for a user
 */
export async function createGoal(
  userId: string,
  data: {
    name: string;
    targetAmount: number;
    targetDate: Date;
    icon?: string;
  }
) {
  const result = await db
    .insert(goals)
    .values({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
      icon: data.icon,
    })
    .returning();

  return result[0];
}

/**
 * Add money to an existing savings goal (with user validation)
 * Uses SQL increment to avoid race conditions
 */
export async function addMoneyToGoal(
  goalId: string,
  userId: string,
  amount: number
) {
  const result = await db
    .update(goals)
    .set({
      currentAmount: sql`${goals.currentAmount} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, goalId),
        eq(goals.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}

/**
 * Delete a savings goal (with user validation)
 */
export async function deleteGoal(goalId: string, userId: string) {
  const result = await db
    .delete(goals)
    .where(
      and(
        eq(goals.id, goalId),
        eq(goals.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}
