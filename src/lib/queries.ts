/**
 * Database Query Utilities for MoneyMate
 * 
 * IMPORTANT: All queries must filter by userId to ensure data isolation
 */

import { db } from "@/db";
import { transactions, financeAccounts, categories } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ============================================
// FINANCE ACCOUNTS QUERIES
// ============================================

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

/**
 * Calculate current balance for a finance account using SQL aggregation
 * Balance = Initial Balance + Sum(Incomes to account) - Sum(Expenses from account) + Sum(Transfers in) - Sum(Transfers out)
 */
export async function getAccountBalance(accountId: string, userId: string) {
  const account = await getFinanceAccountById(accountId, userId);
  if (!account) return null;

  // Use SQL aggregation for performance
  const result = await db
    .select({
      // Sum of income going to this account
      incomeSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' AND ${transactions.toAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      // Sum of expenses coming from this account
      expenseSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' AND ${transactions.fromAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      // Sum of transfers out of this account
      transferOutSum: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'transfer' AND ${transactions.fromAccountId} = ${accountId} THEN ${transactions.amount} ELSE 0 END), 0)`,
      // Sum of transfers into this account
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
      currentBalance: await getAccountBalance(account.id, userId) || 0,
    }))
  );

  return accountsWithBalances;
}

// ============================================
// CATEGORIES QUERIES
// ============================================

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
    // Income categories
    { name: "Salary", type: "income" as const, color: "#22c55e", icon: "💼" },
    { name: "Freelance", type: "income" as const, color: "#10b981", icon: "💻" },
    { name: "Investment", type: "income" as const, color: "#14b8a6", icon: "📈" },
    { name: "Gift", type: "income" as const, color: "#06b6d4", icon: "🎁" },
    { name: "Other Income", type: "income" as const, color: "#0ea5e9", icon: "💰" },
    // Expense categories
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

// ============================================
// TRANSACTIONS QUERIES
// ============================================

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

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get spending breakdown by category for a user
 * Returns aggregated spending per expense category with colors
 */
export async function getSpendingByCategory(userId: string) {
  const userCategories = await getActiveCategories(userId);
  const categoryMap = new Map(userCategories.map(c => [c.id, c]));

  const results = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        transactions.categoryId ? sql`${transactions.categoryId} IS NOT NULL` : sql`1=1`
      )
    )
    .groupBy(transactions.categoryId);

  return results
    .filter(r => r.categoryId && categoryMap.has(r.categoryId))
    .map(r => {
      const category = categoryMap.get(r.categoryId!)!;
      return {
        categoryId: r.categoryId,
        name: category.name,
        color: category.color,
        icon: category.icon,
        total: r.total,
        count: r.count,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Get income breakdown by category for a user
 */
export async function getIncomeByCategory(userId: string) {
  const userCategories = await getActiveCategories(userId);
  const categoryMap = new Map(userCategories.map(c => [c.id, c]));

  const results = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "income")
      )
    )
    .groupBy(transactions.categoryId);

  return results
    .filter(r => r.categoryId && categoryMap.has(r.categoryId))
    .map(r => {
      const category = categoryMap.get(r.categoryId!)!;
      return {
        categoryId: r.categoryId,
        name: category.name,
        color: category.color,
        icon: category.icon,
        total: r.total,
        count: r.count,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Get monthly income vs expense data for the last N months
 */
export async function getMonthlyTrends(userId: string, months: number = 6) {
  const userTransactions = await getUserTransactions(userId);
  
  // Group transactions by month
  const monthlyData = new Map<string, { income: number; expense: number }>();
  
  // Initialize last N months
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData.set(key, { income: 0, expense: 0 });
  }

  // Aggregate transactions
  for (const tx of userTransactions) {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData.has(key)) {
      const data = monthlyData.get(key)!;
      if (tx.type === "income") {
        data.income += tx.amount;
      } else if (tx.type === "expense") {
        data.expense += tx.amount;
      }
    }
  }

  // Convert to array and format
  return Array.from(monthlyData.entries()).map(([month, data]) => ({
    month,
    monthLabel: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
  }));
}

/**
 * Get current month statistics
 */
export async function getCurrentMonthStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const userTransactions = await getUserTransactions(userId);
  
  const monthTransactions = userTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= startOfMonth && txDate <= endOfMonth;
  });

  const income = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Get last month for comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const lastMonthTransactions = userTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= lastMonthStart && txDate <= lastMonthEnd;
  });

  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate savings rate
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const lastMonthSavingsRate = lastMonthIncome > 0 
    ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 
    : 0;

  return {
    income,
    expenses,
    net: income - expenses,
    savingsRate,
    transactionCount: monthTransactions.length,
    // Trends (positive = better than last month)
    incomeTrend: lastMonthIncome > 0 ? ((income - lastMonthIncome) / lastMonthIncome) * 100 : 0,
    expenseTrend: lastMonthExpenses > 0 ? ((expenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0,
    savingsRateTrend: savingsRate - lastMonthSavingsRate,
  };
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
 * Get net worth progression over time
 * Calculates cumulative net worth for each month
 */
export async function getNetWorthProgression(userId: string, months: number = 6) {
  const userAccounts = await getActiveFinanceAccounts(userId);
  const userTransactions = await getUserTransactions(userId);
  
  // Calculate total initial balance from all accounts
  const totalInitialBalance = userAccounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
  
  // Build monthly cumulative data
  const now = new Date();
  const monthlyData: { month: string; monthLabel: string; netWorth: number; change: number; changePercent: number }[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const monthKey = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthEnd.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    
    // Calculate cumulative balance up to this month
    let cumulativeNet = totalInitialBalance;
    
    for (const tx of userTransactions) {
      const txDate = new Date(tx.date);
      if (txDate <= monthEnd) {
        if (tx.type === "income") {
          cumulativeNet += tx.amount;
        } else if (tx.type === "expense") {
          cumulativeNet -= tx.amount;
        }
        // Transfers don't affect net worth
      }
    }
    
    const previousNetWorth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].netWorth : cumulativeNet;
    const change = cumulativeNet - previousNetWorth;
    const changePercent = previousNetWorth !== 0 ? (change / Math.abs(previousNetWorth)) * 100 : 0;
    
    monthlyData.push({
      month: monthKey,
      monthLabel,
      netWorth: cumulativeNet,
      change: monthlyData.length > 0 ? change : 0,
      changePercent: monthlyData.length > 0 ? changePercent : 0,
    });
  }
  
  return monthlyData;
}
