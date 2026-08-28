import "./env.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { db } from "../src/server/db/index.js";
import { users, transactions } from "../src/server/db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

import { getUserFinanceAccounts, getUserAccountsWithBalances, getAccountBalance } from "../src/server/db/queries/accounts.js";
import { getUserCategories, getActiveCategories, getCategoriesByType } from "../src/server/db/queries/categories.js";
import { getUserTransactions, getRecentTransactions, getUserTransactionStats } from "../src/server/db/queries/transactions.js";
import { getGoals, getGoalById } from "../src/server/db/queries/goals.js";
import { getIncomeByCategory, getMonthlyTrends, getCurrentMonthStats, getNetWorthProgression, getBudgetStatus, getWatchlistCategories } from "../src/server/db/queries/analytics.js";

import { createFinanceAccount, updateFinanceAccount, deleteFinanceAccount } from "../src/server/db/mutations/accounts.js";
import { createCategory, updateCategory, deleteCategory } from "../src/server/db/mutations/categories.js";
import { createTransaction, updateTransaction, deleteTransaction } from "../src/server/db/mutations/transactions.js";
import { createGoal, addMoneyToGoal, deleteGoal } from "../src/server/db/mutations/goals.js";

const server = new McpServer({
  name: "moneymate-mcp",
  version: "1.0.0",
});

async function resolveUserId(emailOrId: string): Promise<string | null> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, emailOrId))
    .limit(1);
  if (result.length > 0) return result[0].id;

  const byId = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, emailOrId))
    .limit(1);
  return byId[0]?.id ?? null;
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(msg: string) {
  return {
    content: [{ type: "text" as const, text: msg }],
    isError: true,
  };
}

async function safeTool<T>(op: () => Promise<T>): Promise<ReturnType<typeof text> | ReturnType<typeof errorResult>> {
  try {
    return text(await op());
  } catch (err) {
    console.error("MCP tool error:", err);
    return errorResult("Database operation failed");
  }
}

// ── Accounts (queries) ──

server.tool(
  "list_accounts",
  "List all finance accounts for a user",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getUserFinanceAccounts(userId));
  },
);

server.tool(
  "list_accounts_with_balances",
  "List active finance accounts with calculated balances",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getUserAccountsWithBalances(userId));
  },
);

server.tool(
  "get_account_balance",
  "Get the calculated balance of a single finance account",
  {
    user: z.string().describe("User email or ID"),
    accountId: z.string().describe("Finance account ID"),
  },
  async ({ user, accountId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const balance = await getAccountBalance(accountId, userId);
    if (balance === null) return errorResult("Account not found");
    return text({ accountId, balance });
  },
);

// ── Accounts (mutations) ──

server.tool(
  "create_account",
  "Create a new finance account",
  {
    user: z.string().describe("User email or ID"),
    name: z.string(),
    type: z.enum(["bank", "cash", "e-wallet", "investment", "other"]),
    initialBalance: z.number().optional().describe("Initial balance in major currency units (e.g. 100000 = Rp100.000)"),
    currency: z.string().optional().default("IDR"),
    icon: z.string().optional(),
  },
  async ({ user, name, type, initialBalance, currency, icon }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const account = await createFinanceAccount(userId, {
      name,
      type,
      initialBalance: initialBalance ? Math.round(initialBalance * 100) : 0,
      currency,
      icon,
    });
    return text(account);
  },
);

server.tool(
  "update_account",
  "Update a finance account",
  {
    user: z.string().describe("User email or ID"),
    accountId: z.string(),
    name: z.string().optional(),
    type: z.enum(["bank", "cash", "e-wallet", "investment", "other"]).optional(),
    initialBalance: z.number().optional().describe("Initial balance in major currency units"),
    currency: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  },
  async ({ user, accountId, ...data }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.initialBalance !== undefined) updateData.initialBalance = Math.round(data.initialBalance * 100);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const account = await updateFinanceAccount(accountId, userId, updateData);
    if (!account) return errorResult("Account not found");
    return text(account);
  },
);

server.tool(
  "delete_account",
  "Delete a finance account",
  {
    user: z.string().describe("User email or ID"),
    accountId: z.string(),
  },
  async ({ user, accountId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const account = await deleteFinanceAccount(accountId, userId);
    if (!account) return errorResult("Account not found");
    return text({ deleted: true, account });
  },
);

// ── Categories (queries) ──

server.tool(
  "list_categories",
  "List all categories for a user",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getUserCategories(userId));
  },
);

server.tool(
  "list_categories_by_type",
  "List active categories filtered by type",
  {
    user: z.string().describe("User email or ID"),
    type: z.enum(["income", "expense"]),
  },
  async ({ user, type }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getCategoriesByType(userId, type));
  },
);

// ── Categories (mutations) ──

server.tool(
  "create_category",
  "Create a new category",
  {
    user: z.string().describe("User email or ID"),
    name: z.string(),
    type: z.enum(["income", "expense"]),
    color: z.string().optional().default("#6366f1"),
    icon: z.string().optional(),
    monthlyBudget: z.number().optional().describe("Monthly budget limit in major currency units"),
  },
  async ({ user, name, type, color, icon, monthlyBudget }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const category = await createCategory(userId, {
      name,
      type,
      color,
      icon,
      monthlyBudget: monthlyBudget ? Math.round(monthlyBudget * 100) : undefined,
    });
    return text(category);
  },
);

server.tool(
  "set_category_budget",
  "Set or update a category monthly budget (expense categories)",
  {
    user: z.string().describe("User email or ID"),
    categoryId: z.string().describe("Expense category ID"),
    monthlyBudget: z.number().nullable().describe("Monthly budget in major currency units; null to clear"),
  },
  async ({ user, categoryId, monthlyBudget }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");

    return safeTool(async () => {
      const existing = await db
        .select()
        .from((await import("../src/server/db/schema.js")).categories)
        .where(
          and(
            eq((await import("../src/server/db/schema.js")).categories.id, categoryId),
            eq((await import("../src/server/db/schema.js")).categories.userId, userId),
          ),
        )
        .limit(1);
      const cat = existing[0];
      if (!cat) return errorResult("Category not found");
      if (cat.type !== "expense") return errorResult("Budgets are only supported for expense categories");

      const updated = await updateCategory(categoryId, userId, {
        monthlyBudget: monthlyBudget === null ? null : Math.round(monthlyBudget * 100),
      });
      if (!updated) return errorResult("Category not found");
      return text(updated);
    });
  },
);

server.tool(
  "update_category",
  "Update a category",
  {
    user: z.string().describe("User email or ID"),
    categoryId: z.string(),
    name: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    monthlyBudget: z.number().nullable().optional().describe("Monthly budget in major units, null to remove"),
    isActive: z.boolean().optional(),
  },
  async ({ user, categoryId, ...data }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.monthlyBudget !== undefined)
      updateData.monthlyBudget = data.monthlyBudget !== null ? Math.round(data.monthlyBudget * 100) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    const category = await updateCategory(categoryId, userId, updateData);
    if (!category) return errorResult("Category not found");
    return text(category);
  },
);

server.tool(
  "delete_category",
  "Delete a category",
  {
    user: z.string().describe("User email or ID"),
    categoryId: z.string(),
  },
  async ({ user, categoryId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const category = await deleteCategory(categoryId, userId);
    if (!category) return errorResult("Category not found");
    return text({ deleted: true, category });
  },
);

// ── Transactions (queries) ──

server.tool(
  "list_transactions",
  "List all transactions for a user (ordered by date desc)",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return safeTool(() => getUserTransactions(userId));
  },
);


server.tool(
  "get_recent_transactions",
  "Fetch the last N transactions with optional filtering by type or category",
  {
    user: z.string().describe("User email or ID"),
    limit: z.number().int().positive().optional().default(5),
    type: z.enum(["income", "expense", "transfer"]).optional(),
    categoryId: z.string().optional(),
  },
  async ({ user, limit, type, categoryId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");

    return safeTool(async () => {
      const where = and(
        eq((await import("../src/server/db/schema.js")).transactions.userId, userId),
        type ? eq((await import("../src/server/db/schema.js")).transactions.type, type) : sql`1=1`,
        categoryId
          ? eq((await import("../src/server/db/schema.js")).transactions.categoryId, categoryId)
          : sql`1=1`,
      );

      const { transactions } = await import("../src/server/db/schema.js");
      const rows = await db
        .select()
        .from(transactions)
        .where(where)
        .orderBy((await import("drizzle-orm")).desc(transactions.date))
        .limit(limit);
      return rows;
    });
  },
);

server.tool(
  "transaction_stats",
  "Get aggregate transaction statistics (total income, expenses, balance)",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getUserTransactionStats(userId));
  },
);

// ── Transactions (mutations) ──

server.tool(
  "add_transaction",
  "Record income or expense (amount, category, type, description, date, optional account)",
  {
    user: z.string().describe("User email or ID"),
    amount: z.number().positive().describe("Amount in major currency units (e.g. 50000 = Rp50.000)"),
    categoryId: z.string().describe("Category ID"),
    type: z.enum(["income", "expense"]).describe("Income or expense"),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD, defaults to today"),
    accountId: z
      .string()
      .optional()
      .describe("Optional finance account ID (mapped to from/to account depending on type)"),
  },
  async ({
    user,
    type,
    amount,
    categoryId,
    description,
    date,
    accountId,
  }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");

    const transaction = await createTransaction(userId, {
      type,
      amount: Math.round(amount * 100),
      description: description || undefined,
      categoryId,
      fromAccountId: type === "expense" ? accountId : undefined,
      toAccountId: type === "income" ? accountId : undefined,
      date: date ? new Date(date) : new Date(),
    });

    return text(transaction);
  },
);

server.tool(
  "update_transaction",
  "Update an existing transaction",
  {
    user: z.string().describe("User email or ID"),
    transactionId: z.string(),
    type: z.enum(["income", "expense", "transfer"]).optional(),
    amount: z.number().positive().optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    fromAccountId: z.string().optional(),
    toAccountId: z.string().optional(),
    date: z.string().optional().describe("ISO date string"),
  },
  async ({ user, transactionId, ...data }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const updateData: Record<string, unknown> = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = Math.round(data.amount * 100);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.fromAccountId !== undefined) updateData.fromAccountId = data.fromAccountId;
    if (data.toAccountId !== undefined) updateData.toAccountId = data.toAccountId;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    const transaction = await updateTransaction(transactionId, userId, updateData);
    if (!transaction) return errorResult("Transaction not found");
    return text(transaction);
  },
);

server.tool(
  "delete_transaction",
  "Delete a transaction",
  {
    user: z.string().describe("User email or ID"),
    transactionId: z.string(),
  },
  async ({ user, transactionId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const transaction = await deleteTransaction(transactionId, userId);
    if (!transaction) return errorResult("Transaction not found");
    return text({ deleted: true, transaction });
  },
);

// ── Goals (queries) ──

server.tool(
  "list_goals",
  "List all savings goals for a user",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getGoals(userId));
  },
);

server.tool(
  "get_goal",
  "Get a single savings goal by ID",
  {
    user: z.string().describe("User email or ID"),
    goalId: z.string(),
  },
  async ({ user, goalId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const goal = await getGoalById(goalId, userId);
    if (!goal) return errorResult("Goal not found");
    return text(goal);
  },
);

// ── Goals (mutations) ──

server.tool(
  "create_goal",
  "Create a new savings goal. Amounts in major currency units.",
  {
    user: z.string().describe("User email or ID"),
    name: z.string(),
    targetAmount: z.number().positive(),
    targetDate: z.string().describe("ISO date string"),
    icon: z.string().optional(),
  },
  async ({ user, name, targetAmount, targetDate, icon }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const goal = await createGoal(userId, {
      name,
      targetAmount: Math.round(targetAmount * 100),
      targetDate: new Date(targetDate),
      icon,
    });
    return text(goal);
  },
);

server.tool(
  "add_money_to_goal",
  "Add money to an existing savings goal. Amount in major currency units.",
  {
    user: z.string().describe("User email or ID"),
    goalId: z.string(),
    amount: z.number().positive(),
  },
  async ({ user, goalId, amount }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const goal = await addMoneyToGoal(goalId, userId, Math.round(amount * 100));
    if (!goal) return errorResult("Goal not found");
    return text(goal);
  },
);

server.tool(
  "delete_goal",
  "Delete a savings goal",
  {
    user: z.string().describe("User email or ID"),
    goalId: z.string(),
  },
  async ({ user, goalId }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    const goal = await deleteGoal(goalId, userId);
    if (!goal) return errorResult("Goal not found");
    return text({ deleted: true, goal });
  },
);

// ── Analytics ──

server.tool(
  "get_spending_summary",
  "Calculate total income, total expenses, net balance, and breakdown by category for a given date range",
  {
    user: z.string().describe("User email or ID"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
  },
  async ({ user, startDate, endDate }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T23:59:59.999Z");

    const rows = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END),0)` ,
        totalExpense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END),0)` ,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.date} >= ${start.getTime()}`,
          sql`${transactions.date} <= ${end.getTime()}`,
        ),
      );

    const totals = rows[0] || { totalIncome: 0, totalExpense: 0 };

    const breakdown = await db
      .select({
        categoryId: transactions.categoryId,
        totalExpense: sql<number>`COALESCE(SUM(${transactions.amount}),0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          sql`${transactions.date} >= ${start.getTime()}`,
          sql`${transactions.date} <= ${end.getTime()}`,
          sql`${transactions.categoryId} IS NOT NULL`,
        ),
      )
      .groupBy(transactions.categoryId);

    const categories = await getActiveCategories(userId);
    const categoryMap = new Map(categories.map((c) => [c.id, c] as const));

    const breakdownByCategory = breakdown
      .filter((r) => r.categoryId && categoryMap.has(r.categoryId))
      .map((r) => {
        const c = categoryMap.get(r.categoryId!)!;
        return {
          categoryId: r.categoryId,
          name: c.name,
          color: c.color,
          icon: c.icon,
          total: r.totalExpense,
        };
      })
      .sort((a, b) => b.total - a.total);

    return text({
      startDate,
      endDate,
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpense,
      netBalance: totals.totalIncome - totals.totalExpense,
      breakdownByCategory: breakdownByCategory,
    });
  },
);

server.tool(
  "income_by_category",
  "Get income breakdown by category",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getIncomeByCategory(userId));
  },
);

server.tool(
  "monthly_trends",
  "Get monthly income vs expense trends",
  {
    user: z.string().describe("User email or ID"),
    months: z.number().optional().default(6),
  },
  async ({ user, months }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getMonthlyTrends(userId, months));
  },
);

server.tool(
  "current_month_stats",
  "Get current month statistics (income, expenses, savings rate, trends)",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getCurrentMonthStats(userId));
  },
);

server.tool(
  "net_worth_progression",
  "Get net worth progression over the last N months",
  {
    user: z.string().describe("User email or ID"),
    months: z.number().optional().default(6),
  },
  async ({ user, months }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getNetWorthProgression(userId, months));
  },
);

server.tool(
  "get_budget_status",
  "Compare current month spending against set category budgets",
  {
    user: z.string().describe("User email or ID"),
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional()
      .describe("Optional month in YYYY-MM format; currently uses the current month"),
  },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return safeTool(() => getBudgetStatus(userId));
  },
);


server.tool(
  "watchlist",
  "Get categories at or above 80% of their monthly budget",
  { user: z.string().describe("User email or ID") },
  async ({ user }) => {
    const userId = await resolveUserId(user);
    if (!userId) return errorResult("User not found");
    return text(await getWatchlistCategories(userId));
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MoneyMate MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
