/**
 * Category Mutations (Data Access Layer)
 *
 * All write operations for categories.
 */

import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new category for a user
 */
export async function createCategory(
  userId: string,
  data: {
    name: string;
    type: "income" | "expense";
    color?: string;
    icon?: string;
    monthlyBudget?: number;
  }
) {
  const result = await db
    .insert(categories)
    .values({
      userId,
      name: data.name,
      type: data.type,
      color: data.color || "#6366f1",
      icon: data.icon,
      monthlyBudget: data.monthlyBudget,
    })
    .returning();

  return result[0];
}

/**
 * Update a category (with user validation)
 */
export async function updateCategory(
  categoryId: string,
  userId: string,
  data: Partial<{
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
    monthlyBudget: number | null;
    isActive: boolean;
  }>
) {
  const result = await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}

/**
 * Delete a category (with user validation)
 */
export async function deleteCategory(
  categoryId: string,
  userId: string
) {
  const result = await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}

/**
 * Create default categories for a new user
 */
export async function createDefaultCategories(userId: string) {
  const defaultCategories = [
    { name: "Salary", type: "income" as const, color: "#22c55e", icon: "💼" },
    { name: "Freelance", type: "income" as const, color: "#10b981", icon: "💻" },
    { name: "Investment", type: "income" as const, color: "#14b8a6", icon: "📈" },
    { name: "Gift", type: "income" as const, color: "#06b6d4", icon: "🎁" },
    { name: "Other Income", type: "income" as const, color: "#0ea5e9", icon: "💰" },
    { name: "Food & Dining", type: "expense" as const, color: "#f97316", icon: "🍔" },
    { name: "Transportation", type: "expense" as const, color: "#ef4444", icon: "🚗" },
    { name: "Shopping", type: "expense" as const, color: "#ec4899", icon: "🛒" },
    { name: "Entertainment", type: "expense" as const, color: "#a855f7", icon: "🎮" },
    { name: "Bills & Utilities", type: "expense" as const, color: "#8b5cf6", icon: "📄" },
    { name: "Healthcare", type: "expense" as const, color: "#6366f1", icon: "🏥" },
    { name: "Education", type: "expense" as const, color: "#3b82f6", icon: "📚" },
    { name: "Other Expense", type: "expense" as const, color: "#64748b", icon: "📦" },
  ];

  const result = await db
    .insert(categories)
    .values(defaultCategories.map((cat) => ({ ...cat, userId })))
    .returning();

  return result;
}
