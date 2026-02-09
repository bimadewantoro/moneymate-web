/**
 * Category Queries (Data Access Layer)
 *
 * All read operations for categories.
 * Every query filters by userId to ensure data isolation.
 */

import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get all categories for a specific user
 */
export async function getUserCategories(userId: string) {
  return await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.type, categories.name);
}

/**
 * Get active categories for a specific user
 */
export async function getActiveCategories(userId: string) {
  return await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.isActive, true)
      )
    )
    .orderBy(categories.type, categories.name);
}

/**
 * Get categories by type (income or expense)
 */
export async function getCategoriesByType(
  userId: string,
  type: "income" | "expense"
) {
  return await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, type),
        eq(categories.isActive, true)
      )
    )
    .orderBy(categories.name);
}

/**
 * Get a single category by ID (with user validation)
 */
export async function getCategoryById(
  categoryId: string,
  userId: string
) {
  const result = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      )
    )
    .limit(1);

  return result[0] || null;
}
