/**
 * Analytics Queries (Data Access Layer)
 *
 * Complex aggregation/analytics queries used by the dashboard.
 */

import { db } from "@/server/db";
import { transactions, categories } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getActiveCategories } from "./categories";
import { getActiveFinanceAccounts } from "./accounts";
import { getUserTransactions } from "./transactions";

// ============================================
// SPENDING & INCOME ANALYTICS
// ============================================

/**
 * Get spending breakdown by category for a user
 */
export async function getSpendingByCategory(userId: string) {
  const userCategories = await getActiveCategories(userId);
  const categoryMap = new Map(userCategories.map((c) => [c.id, c]));

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
        transactions.categoryId
          ? sql`${transactions.categoryId} IS NOT NULL`
          : sql`1=1`
      )
    )
    .groupBy(transactions.categoryId);

  return results
    .filter((r) => r.categoryId && categoryMap.has(r.categoryId))
    .map((r) => {
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
  const categoryMap = new Map(userCategories.map((c) => [c.id, c]));

  const results = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), eq(transactions.type, "income"))
    )
    .groupBy(transactions.categoryId);

  return results
    .filter((r) => r.categoryId && categoryMap.has(r.categoryId))
    .map((r) => {
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

// ============================================
// MONTHLY TRENDS & NET WORTH
// ============================================

/**
 * Get monthly income vs expense data for the last N months
 */
export async function getMonthlyTrends(
  userId: string,
  months: number = 6
) {
  const userTransactions = await getUserTransactions(userId);

  const monthlyData = new Map<string, { income: number; expense: number }>();

  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(key, { income: 0, expense: 0 });
  }

  for (const tx of userTransactions) {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (monthlyData.has(key)) {
      const data = monthlyData.get(key)!;
      if (tx.type === "income") {
        data.income += tx.amount;
      } else if (tx.type === "expense") {
        data.expense += tx.amount;
      }
    }
  }

  return Array.from(monthlyData.entries()).map(([month, data]) => ({
    month,
    monthLabel: new Date(month + "-01").toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    }),
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
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const userTransactions = await getUserTransactions(userId);

  const monthTransactions = userTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= startOfMonth && txDate <= endOfMonth;
  });

  const income = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  const lastMonthTransactions = userTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= lastMonthStart && txDate <= lastMonthEnd;
  });

  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate =
    income > 0 ? ((income - expenses) / income) * 100 : 0;
  const lastMonthSavingsRate =
    lastMonthIncome > 0
      ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100
      : 0;

  return {
    income,
    expenses,
    net: income - expenses,
    savingsRate,
    transactionCount: monthTransactions.length,
    incomeTrend:
      lastMonthIncome > 0
        ? ((income - lastMonthIncome) / lastMonthIncome) * 100
        : 0,
    expenseTrend:
      lastMonthExpenses > 0
        ? ((expenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0,
    savingsRateTrend: savingsRate - lastMonthSavingsRate,
  };
}

/**
 * Get net worth progression over time
 */
export async function getNetWorthProgression(
  userId: string,
  months: number = 6
) {
  const userAccounts = await getActiveFinanceAccounts(userId);
  const userTransactions = await getUserTransactions(userId);

  const totalInitialBalance = userAccounts.reduce(
    (sum, acc) => sum + acc.initialBalance,
    0
  );

  const now = new Date();
  const monthlyData: {
    month: string;
    monthLabel: string;
    netWorth: number;
    change: number;
    changePercent: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
      999
    );
    const monthKey = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = monthEnd.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });

    let cumulativeNet = totalInitialBalance;

    for (const tx of userTransactions) {
      const txDate = new Date(tx.date);
      if (txDate <= monthEnd) {
        if (tx.type === "income") {
          cumulativeNet += tx.amount;
        } else if (tx.type === "expense") {
          cumulativeNet -= tx.amount;
        }
      }
    }

    const previousNetWorth =
      monthlyData.length > 0
        ? monthlyData[monthlyData.length - 1].netWorth
        : cumulativeNet;
    const change = cumulativeNet - previousNetWorth;
    const changePercent =
      previousNetWorth !== 0
        ? (change / Math.abs(previousNetWorth)) * 100
        : 0;

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

// ============================================
// BUDGET ENGINE
// ============================================

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string | null;
  monthlyBudget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "danger" | "over";
}

/**
 * Get budget status for all expense categories with monthly budgets
 */
export async function getBudgetStatus(
  userId: string
): Promise<BudgetStatus[]> {
  const userCategories = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, "expense"),
        eq(categories.isActive, true),
        sql`${categories.monthlyBudget} IS NOT NULL`
      )
    );

  if (userCategories.length === 0) {
    return [];
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const spendingResults = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        sql`${transactions.date} >= ${startOfMonth.getTime()}`,
        sql`${transactions.date} <= ${endOfMonth.getTime()}`
      )
    )
    .groupBy(transactions.categoryId);

  const spendingMap = new Map(
    spendingResults.map((r) => [r.categoryId, r.total])
  );

  return userCategories
    .map((category) => {
      const budget = category.monthlyBudget!;
      const spent = spendingMap.get(category.id) || 0;
      const remaining = budget - spent;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      let status: BudgetStatus["status"];
      if (percentage >= 100) {
        status = "over";
      } else if (percentage >= 90) {
        status = "danger";
      } else if (percentage >= 75) {
        status = "warning";
      } else {
        status = "safe";
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        monthlyBudget: budget,
        spent,
        remaining,
        percentage,
        status,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Get categories that are over 80% of their budget (Watchlist)
 */
export async function getWatchlistCategories(
  userId: string
): Promise<BudgetStatus[]> {
  const allBudgetStatus = await getBudgetStatus(userId);
  return allBudgetStatus.filter((b) => b.percentage >= 80);
}
