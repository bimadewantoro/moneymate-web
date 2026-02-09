/**
 * Finance Account Mutations (Data Access Layer)
 *
 * All write operations for finance accounts.
 */

import { db } from "@/server/db";
import { financeAccounts } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new finance account for a user
 */
export async function createFinanceAccount(
  userId: string,
  data: {
    name: string;
    type: "bank" | "cash" | "e-wallet" | "investment" | "other";
    initialBalance?: number;
    currency?: string;
    icon?: string;
  }
) {
  const result = await db
    .insert(financeAccounts)
    .values({
      userId,
      name: data.name,
      type: data.type,
      initialBalance: data.initialBalance || 0,
      currency: data.currency || "IDR",
      icon: data.icon,
    })
    .returning();

  return result[0];
}

/**
 * Update a finance account (with user validation)
 */
export async function updateFinanceAccount(
  accountId: string,
  userId: string,
  data: Partial<{
    name: string;
    type: "bank" | "cash" | "e-wallet" | "investment" | "other";
    initialBalance: number;
    currency: string;
    icon: string;
    isActive: boolean;
  }>
) {
  const result = await db
    .update(financeAccounts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(financeAccounts.id, accountId),
        eq(financeAccounts.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}

/**
 * Delete a finance account (with user validation)
 */
export async function deleteFinanceAccount(
  accountId: string,
  userId: string
) {
  const result = await db
    .delete(financeAccounts)
    .where(
      and(
        eq(financeAccounts.id, accountId),
        eq(financeAccounts.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}
