/**
 * Finance Account Queries (Data Access Layer)
 *
 * All read operations for finance accounts.
 * Every query filters by userId to ensure data isolation.
 */

import { db } from "@/server/db";
import { financeAccounts, transactions } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Get all finance accounts for a specific user
 */
export async function getUserFinanceAccounts(userId: string) {
  return await db
    .select()
    .from(financeAccounts)
    .where(eq(financeAccounts.userId, userId))
    .orderBy(financeAccounts.name);
}

/**
 * Get active finance accounts for a specific user
 */
export async function getActiveFinanceAccounts(userId: string) {
  return await db
    .select()
    .from(financeAccounts)
    .where(
      and(
        eq(financeAccounts.userId, userId),
        eq(financeAccounts.isActive, true)
      )
    )
    .orderBy(financeAccounts.name);
}

/**
 * Get a single finance account by ID (with user validation)
 */
export async function getFinanceAccountById(
  accountId: string,
  userId: string
) {
  const result = await db
    .select()
    .from(financeAccounts)
    .where(
      and(
        eq(financeAccounts.id, accountId),
        eq(financeAccounts.userId, userId)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Calculate current balance for a finance account using SQL aggregation
 */
export async function getAccountBalance(accountId: string, userId: string) {
  const account = await getFinanceAccountById(accountId, userId);
  if (!account) return null;

  const result = await db
    .select({
      incomeSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' AND ${transactions.toAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      expenseSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' AND ${transactions.fromAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      transferOutSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' AND ${transactions.fromAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      transferInSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' AND ${transactions.toAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`(${transactions.fromAccountId} = ${accountId} OR ${transactions.toAccountId} = ${accountId})`
      )
    );

  const { incomeSum, expenseSum, transferOutSum, transferInSum } = result[0] || {
    incomeSum: 0,
    expenseSum: 0,
    transferOutSum: 0,
    transferInSum: 0,
  };

  return account.initialBalance + incomeSum - expenseSum + transferInSum - transferOutSum;
}

/**
 * Get all accounts with their calculated balances
 */
export async function getUserAccountsWithBalances(userId: string) {
  const accounts = await getActiveFinanceAccounts(userId);

  const accountsWithBalances = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      currentBalance: (await getAccountBalance(account.id, userId)) || 0,
    }))
  );

  return accountsWithBalances;
}
