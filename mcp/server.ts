import "./env.js";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { db } from "../src/server/db/index.js";
import { transactions, categories } from "../src/server/db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth.js";

import {
  getUserFinanceAccounts,
  getUserAccountsWithBalances,
  getAccountBalance,
} from "../src/server/db/queries/accounts.js";
import {
  getUserCategories,
  getActiveCategories,
  getCategoriesByType,
} from "../src/server/db/queries/categories.js";
import {
  getUserTransactions,
  getUserTransactionStats,
} from "../src/server/db/queries/transactions.js";
import { getGoals, getGoalById } from "../src/server/db/queries/goals.js";
import {
  getIncomeByCategory,
  getMonthlyTrends,
  getCurrentMonthStats,
  getNetWorthProgression,
  getBudgetStatus,
  getWatchlistCategories,
} from "../src/server/db/queries/analytics.js";

import {
  createFinanceAccount,
  updateFinanceAccount,
  deleteFinanceAccount,
} from "../src/server/db/mutations/accounts.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../src/server/db/mutations/categories.js";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../src/server/db/mutations/transactions.js";
import {
  createGoal,
  addMoneyToGoal,
  deleteGoal,
} from "../src/server/db/mutations/goals.js";

let currentUserId: string = "";

const server = new McpServer({
  name: "moneymate-mcp",
  version: "1.0.0",
});

function text(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(msg: string) {
  return {
    content: [{ type: "text" as const, text: msg }],
    isError: true,
  };
}

async function safeTool<T>(
  op: () => Promise<T>
): Promise<ReturnType<typeof text> | ReturnType<typeof errorResult>> {
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
  "List all finance accounts for the authenticated user",
  {},
  async () => {
    return safeTool(() => getUserFinanceAccounts(currentUserId));
  }
);

server.tool(
  "list_accounts_with_balances",
  "List active finance accounts with calculated balances",
  {},
  async () => {
    return safeTool(() => getUserAccountsWithBalances(currentUserId));
  }
);

server.tool(
  "get_account_balance",
  "Get the calculated balance of a single finance account",
  {
    accountId: z.string().describe("Finance account ID"),
  },
  async ({ accountId }) => {
    return safeTool(async () => {
      const balance = await getAccountBalance(accountId, currentUserId);
      if (balance === null) return { error: "Account not found" };
      return { accountId, balance };
    });
  }
);

// ── Accounts (mutations) ──

server.tool(
  "create_account",
  "Create a new finance account",
  {
    name: z.string(),
    type: z.enum(["bank", "cash", "e-wallet", "investment", "other"]),
    initialBalance: z
      .number()
      .optional()
      .describe("Initial balance in major currency units (e.g. 100000 = Rp100.000)"),
    currency: z.string().optional().default("IDR"),
    icon: z.string().optional(),
  },
  async ({ name, type, initialBalance, currency, icon }) => {
    return safeTool(() =>
      createFinanceAccount(currentUserId, {
        name,
        type,
        initialBalance: initialBalance ? Math.round(initialBalance * 100) : 0,
        currency,
        icon,
      })
    );
  }
);

server.tool(
  "update_account",
  "Update a finance account",
  {
    accountId: z.string(),
    name: z.string().optional(),
    type: z.enum(["bank", "cash", "e-wallet", "investment", "other"]).optional(),
    initialBalance: z
      .number()
      .optional()
      .describe("Initial balance in major currency units"),
    currency: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  },
  async ({ accountId, ...data }) => {
    return safeTool(async () => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.initialBalance !== undefined)
        updateData.initialBalance = Math.round(data.initialBalance * 100);
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      const account = await updateFinanceAccount(
        accountId,
        currentUserId,
        updateData
      );
      if (!account) return { error: "Account not found" };
      return account;
    });
  }
);

server.tool(
  "delete_account",
  "Delete a finance account",
  {
    accountId: z.string(),
  },
  async ({ accountId }) => {
    return safeTool(async () => {
      const account = await deleteFinanceAccount(accountId, currentUserId);
      if (!account) return { error: "Account not found" };
      return { deleted: true, account };
    });
  }
);

// ── Categories (queries) ──

server.tool(
  "list_categories",
  "List all categories for the authenticated user",
  {},
  async () => {
    return safeTool(() => getUserCategories(currentUserId));
  }
);

server.tool(
  "list_categories_by_type",
  "List active categories filtered by type",
  {
    type: z.enum(["income", "expense"]),
  },
  async ({ type }) => {
    return safeTool(() => getCategoriesByType(currentUserId, type));
  }
);

// ── Categories (mutations) ──

server.tool(
  "create_category",
  "Create a new category",
  {
    name: z.string(),
    type: z.enum(["income", "expense"]),
    color: z.string().optional().default("#6366f1"),
    icon: z.string().optional(),
    monthlyBudget: z
      .number()
      .optional()
      .describe("Monthly budget limit in major currency units"),
  },
  async ({ name, type, color, icon, monthlyBudget }) => {
    return safeTool(() =>
      createCategory(currentUserId, {
        name,
        type,
        color,
        icon,
        monthlyBudget: monthlyBudget
          ? Math.round(monthlyBudget * 100)
          : undefined,
      })
    );
  }
);

server.tool(
  "set_category_budget",
  "Set or update a category monthly budget (expense categories)",
  {
    categoryId: z.string().describe("Expense category ID"),
    monthlyBudget: z
      .number()
      .nullable()
      .describe("Monthly budget in major currency units; null to clear"),
  },
  async ({ categoryId, monthlyBudget }) => {
    return safeTool(async () => {
      const existing = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, categoryId),
            eq(categories.userId, currentUserId)
          )
        )
        .limit(1);
      const cat = existing[0];
      if (!cat) return { error: "Category not found" };
      if (cat.type !== "expense")
        return { error: "Budgets are only supported for expense categories" };

      const updated = await updateCategory(categoryId, currentUserId, {
        monthlyBudget:
          monthlyBudget === null ? null : Math.round(monthlyBudget * 100),
      });
      if (!updated) return { error: "Category not found" };
      return updated;
    });
  }
);

server.tool(
  "update_category",
  "Update a category",
  {
    categoryId: z.string(),
    name: z.string().optional(),
    type: z.enum(["income", "expense"]).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    monthlyBudget: z
      .number()
      .nullable()
      .optional()
      .describe("Monthly budget in major units, null to remove"),
    isActive: z.boolean().optional(),
  },
  async ({ categoryId, ...data }) => {
    return safeTool(async () => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.monthlyBudget !== undefined)
        updateData.monthlyBudget =
          data.monthlyBudget !== null
            ? Math.round(data.monthlyBudget * 100)
            : null;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      const category = await updateCategory(
        categoryId,
        currentUserId,
        updateData
      );
      if (!category) return { error: "Category not found" };
      return category;
    });
  }
);

server.tool(
  "delete_category",
  "Delete a category",
  {
    categoryId: z.string(),
  },
  async ({ categoryId }) => {
    return safeTool(async () => {
      const category = await deleteCategory(categoryId, currentUserId);
      if (!category) return { error: "Category not found" };
      return { deleted: true, category };
    });
  }
);

// ── Transactions (queries) ──

server.tool(
  "list_transactions",
  "List all transactions for the authenticated user (ordered by date desc)",
  {},
  async () => {
    return safeTool(() => getUserTransactions(currentUserId));
  }
);

server.tool(
  "get_recent_transactions",
  "Fetch the last N transactions with optional filtering by type or category",
  {
    limit: z.number().int().positive().optional().default(5),
    type: z.enum(["income", "expense", "transfer"]).optional(),
    categoryId: z.string().optional(),
  },
  async ({ limit, type, categoryId }) => {
    return safeTool(async () => {
      const whereConditions = [eq(transactions.userId, currentUserId)];
      if (type) {
        whereConditions.push(eq(transactions.type, type));
      }
      if (categoryId) {
        whereConditions.push(eq(transactions.categoryId, categoryId));
      }

      const rows = await db
        .select()
        .from(transactions)
        .where(and(...whereConditions))
        .orderBy(desc(transactions.date))
        .limit(limit);
      return rows;
    });
  }
);

server.tool(
  "transaction_stats",
  "Get aggregate transaction statistics (total income, expenses, balance)",
  {},
  async () => {
    return safeTool(() => getUserTransactionStats(currentUserId));
  }
);

// ── Transactions (mutations) ──

server.tool(
  "add_transaction",
  "Record income or expense (amount, category, type, description, date, optional account)",
  {
    amount: z
      .number()
      .positive()
      .describe("Amount in major currency units (e.g. 50000 = Rp50.000)"),
    categoryId: z.string().describe("Category ID"),
    type: z.enum(["income", "expense"]).describe("Income or expense"),
    description: z.string().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("YYYY-MM-DD, defaults to today"),
    accountId: z
      .string()
      .optional()
      .describe(
        "Optional finance account ID (mapped to from/to account depending on type)"
      ),
  },
  async ({ type, amount, categoryId, description, date, accountId }) => {
    return safeTool(() =>
      createTransaction(currentUserId, {
        type,
        amount: Math.round(amount * 100),
        description: description || undefined,
        categoryId,
        fromAccountId: type === "expense" ? accountId : undefined,
        toAccountId: type === "income" ? accountId : undefined,
        date: date ? new Date(date) : new Date(),
      })
    );
  }
);

server.tool(
  "update_transaction",
  "Update an existing transaction",
  {
    transactionId: z.string(),
    type: z.enum(["income", "expense", "transfer"]).optional(),
    amount: z.number().positive().optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    fromAccountId: z.string().optional(),
    toAccountId: z.string().optional(),
    date: z.string().optional().describe("ISO date string"),
  },
  async ({ transactionId, ...data }) => {
    return safeTool(async () => {
      const updateData: Record<string, unknown> = {};
      if (data.type !== undefined) updateData.type = data.type;
      if (data.amount !== undefined)
        updateData.amount = Math.round(data.amount * 100);
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
      if (data.fromAccountId !== undefined)
        updateData.fromAccountId = data.fromAccountId;
      if (data.toAccountId !== undefined)
        updateData.toAccountId = data.toAccountId;
      if (data.date !== undefined) updateData.date = new Date(data.date);
      const transaction = await updateTransaction(
        transactionId,
        currentUserId,
        updateData
      );
      if (!transaction) return { error: "Transaction not found" };
      return transaction;
    });
  }
);

server.tool(
  "delete_transaction",
  "Delete a transaction",
  {
    transactionId: z.string(),
  },
  async ({ transactionId }) => {
    return safeTool(async () => {
      const transaction = await deleteTransaction(
        transactionId,
        currentUserId
      );
      if (!transaction) return { error: "Transaction not found" };
      return { deleted: true, transaction };
    });
  }
);

// ── Goals (queries) ──

server.tool(
  "list_goals",
  "List all savings goals for the authenticated user",
  {},
  async () => {
    return safeTool(() => getGoals(currentUserId));
  }
);

server.tool(
  "get_goal",
  "Get a single savings goal by ID",
  {
    goalId: z.string(),
  },
  async ({ goalId }) => {
    return safeTool(async () => {
      const goal = await getGoalById(goalId, currentUserId);
      if (!goal) return { error: "Goal not found" };
      return goal;
    });
  }
);

// ── Goals (mutations) ──

server.tool(
  "create_goal",
  "Create a new savings goal. Amounts in major currency units.",
  {
    name: z.string(),
    targetAmount: z.number().positive(),
    targetDate: z.string().describe("ISO date string"),
    icon: z.string().optional(),
  },
  async ({ name, targetAmount, targetDate, icon }) => {
    return safeTool(() =>
      createGoal(currentUserId, {
        name,
        targetAmount: Math.round(targetAmount * 100),
        targetDate: new Date(targetDate),
        icon,
      })
    );
  }
);

server.tool(
  "add_money_to_goal",
  "Add money to an existing savings goal. Amount in major currency units.",
  {
    goalId: z.string(),
    amount: z.number().positive(),
  },
  async ({ goalId, amount }) => {
    return safeTool(async () => {
      const goal = await addMoneyToGoal(
        goalId,
        currentUserId,
        Math.round(amount * 100)
      );
      if (!goal) return { error: "Goal not found" };
      return goal;
    });
  }
);

server.tool(
  "delete_goal",
  "Delete a savings goal",
  {
    goalId: z.string(),
  },
  async ({ goalId }) => {
    return safeTool(async () => {
      const goal = await deleteGoal(goalId, currentUserId);
      if (!goal) return { error: "Goal not found" };
      return { deleted: true, goal };
    });
  }
);

// ── Analytics ──

server.tool(
  "get_spending_summary",
  "Calculate total income, total expenses, net balance, and breakdown by category for a given date range",
  {
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("YYYY-MM-DD"),
  },
  async ({ startDate, endDate }) => {
    return safeTool(async () => {
      const start = new Date(startDate + "T00:00:00.000Z");
      const end = new Date(endDate + "T23:59:59.999Z");

      const rows = await db
        .select({
          totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END),0)`,
          totalExpense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END),0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, currentUserId),
            sql`${transactions.date} >= ${start.getTime()}`,
            sql`${transactions.date} <= ${end.getTime()}`
          )
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
            eq(transactions.userId, currentUserId),
            eq(transactions.type, "expense"),
            sql`${transactions.date} >= ${start.getTime()}`,
            sql`${transactions.date} <= ${end.getTime()}`,
            sql`${transactions.categoryId} IS NOT NULL`
          )
        )
        .groupBy(transactions.categoryId);

      const userCategories = await getActiveCategories(currentUserId);
      const categoryMap = new Map(
        userCategories.map((c) => [c.id, c] as const)
      );

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

      return {
        startDate,
        endDate,
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpense,
        netBalance: totals.totalIncome - totals.totalExpense,
        breakdownByCategory,
      };
    });
  }
);

server.tool(
  "income_by_category",
  "Get income breakdown by category",
  {},
  async () => {
    return safeTool(() => getIncomeByCategory(currentUserId));
  }
);

server.tool(
  "monthly_trends",
  "Get monthly income vs expense trends",
  {
    months: z.number().optional().default(6),
  },
  async ({ months }) => {
    return safeTool(() => getMonthlyTrends(currentUserId, months));
  }
);

server.tool(
  "current_month_stats",
  "Get current month statistics (income, expenses, savings rate, trends)",
  {},
  async () => {
    return safeTool(() => getCurrentMonthStats(currentUserId));
  }
);

server.tool(
  "net_worth_progression",
  "Get net worth progression over the last N months",
  {
    months: z.number().optional().default(6),
  },
  async ({ months }) => {
    return safeTool(() => getNetWorthProgression(currentUserId, months));
  }
);

server.tool(
  "get_budget_status",
  "Compare current month spending against set category budgets",
  {
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional()
      .describe("Optional month in YYYY-MM format; currently uses the current month"),
  },
  async () => {
    return safeTool(() => getBudgetStatus(currentUserId));
  }
);

server.tool(
  "watchlist",
  "Get categories at or above 80% of their monthly budget",
  {},
  async () => {
    return safeTool(() => getWatchlistCategories(currentUserId));
  }
);

async function main() {
  currentUserId = await getAuthenticatedUser();
  console.error("Authenticated MCP user ID:", currentUserId);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MoneyMate MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
