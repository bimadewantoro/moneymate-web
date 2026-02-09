/**
 * Transaction Mutations (Data Access Layer)
 *
 * All write operations for transactions.
 */

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new transaction for a user
 */
export async function createTransaction(
  userId: string,
  data: {
    amount: number;
    description?: string;
    categoryId?: string;
    type: "income" | "expense" | "transfer";
    fromAccountId?: string;
    toAccountId?: string;
    date?: Date;
  }
) {
  const result = await db
    .insert(transactions)
    .values({
      userId,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId,
      type: data.type,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      date: data.date || new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Update a transaction (with user validation)
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: Partial<{
    amount: number;
    description: string;
    categoryId: string;
    type: "income" | "expense" | "transfer";
    fromAccountId: string;
    toAccountId: string;
    date: Date;
  }>
) {
  const result = await db
    .update(transactions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}

/**
 * Delete a transaction (with user validation)
 */
export async function deleteTransaction(
  transactionId: string,
  userId: string
) {
  const result = await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId)
      )
    )
    .returning();

  return result[0] || null;
}
