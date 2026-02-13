/**
 * Savings Goals Queries (Data Access Layer)
 *
 * All read operations for savings goals.
 * Every query filters by userId to ensure data isolation.
 */

import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all savings goals for a specific user, ordered by target date
 */
export async function getGoals(userId: string) {
  return await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(goals.targetDate);
}

/**
 * Get a single goal by ID (with user validation)
 */
export async function getGoalById(goalId: string, userId: string) {
  const result = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.id, goalId),
        eq(goals.userId, userId)
      )
    )
    .limit(1);

  return result[0] || null;
}
