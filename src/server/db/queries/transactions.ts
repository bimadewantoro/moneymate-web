/**
 * Transaction Queries (Data Access Layer)
 *
 * All read operations for transactions.
 * Every query filters by userId to ensure data isolation.
 */

import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all transactions for a specific user
 */
export async function getUserTransactions(userId: string) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));
}

/**
 * Get a single transaction by ID (with user validation)
 */
export async function getTransactionById(
  transactionId: string,
  userId: string
) {
  const result = await db
    .select()
    .from(transactions)
    .where(
      eq(transactions.id, transactionId),
    )
    .limit(1);

  const transaction = result[0] || null;
  if (transaction && transaction.userId !== userId) return null;
  return transaction;
}

/**
 * Get recent transactions (last N transactions)
 */
export async function getRecentTransactions(userId: string, limit: number = 5) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(limit);
}

/**
 * Get transaction statistics for a user
 */
export async function getUserTransactionStats(userId: string) {
  const userTransactions = await getUserTransactions(userId);

  const income = userTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = userTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    totalTransactions: userTransactions.length,
  };
}
