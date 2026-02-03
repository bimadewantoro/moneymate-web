/**
 * Database Query Utilities for MoneyMate
 * 
 * IMPORTANT: All queries must filter by userId to ensure data isolation
 */

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get all transactions for a specific user
 * 
 * @param userId - The authenticated user's ID from session.user.id
 * @returns Array of transactions belonging to the user
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
 * 
 * @param transactionId - The transaction ID
 * @param userId - The authenticated user's ID from session.user.id
 * @returns Transaction if found and belongs to user, null otherwise
 */
export async function getTransactionById(
  transactionId: string,
  userId: string
) {
  const result = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new transaction for a user
 * 
 * @param userId - The authenticated user's ID from session.user.id
 * @param data - Transaction data
 * @returns Created transaction
 */
export async function createTransaction(
  userId: string,
  data: {
    amount: number;
    description?: string;
    category?: string;
    type: "income" | "expense";
    date?: Date;
  }
) {
  const result = await db
    .insert(transactions)
    .values({
      userId,
      amount: data.amount,
      description: data.description,
      category: data.category,
      type: data.type,
      date: data.date || new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Update a transaction (with user validation)
 * 
 * @param transactionId - The transaction ID
 * @param userId - The authenticated user's ID from session.user.id
 * @param data - Updated transaction data
 * @returns Updated transaction or null if not found/not authorized
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: Partial<{
    amount: number;
    description: string;
    category: string;
    type: "income" | "expense";
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
 * 
 * @param transactionId - The transaction ID
 * @param userId - The authenticated user's ID from session.user.id
 * @returns Deleted transaction or null if not found/not authorized
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

/**
 * Get transaction statistics for a user
 * 
 * @param userId - The authenticated user's ID from session.user.id
 * @returns Statistics object with income, expenses, and balance
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
