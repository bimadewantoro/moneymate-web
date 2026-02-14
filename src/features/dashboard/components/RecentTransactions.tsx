"use client";

import Link from "next/link";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  categoryId: string | null;
  type: "income" | "expense" | "transfer";
  fromAccountId: string | null;
  toAccountId: string | null;
  date: Date;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  baseCurrency: string;
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

function formatCurrency(amount: number) {
  return formatCurrencyUtil(amount / 100, "IDR");
}

function formatDate(date: Date) {
  const now = new Date();
  const txDate = new Date(date);
  const diffDays = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return txDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    return txDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
}

export function RecentTransactions({
  transactions,
  categories,
  accounts,
  baseCurrency,
}: RecentTransactionsProps) {
  function formatCurrency(amount: number) {
    return formatCurrencyUtil(amount / 100, baseCurrency);
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-slate-500">
              Your latest activity
            </p>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No transactions yet
          </h3>
          <p className="text-slate-500 mb-4">
            Start tracking your money by adding your first transaction
          </p>
          <Link
            href="/transactions"
            className="inline-flex items-center px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md transition-colors"
          >
            Add Transaction
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <p className="text-sm text-slate-500">
            Your latest activity
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.map((tx) => {
          const category = tx.categoryId ? categoryMap.get(tx.categoryId) : null;
          const fromAccount = tx.fromAccountId ? accountMap.get(tx.fromAccountId) : null;
          const toAccount = tx.toAccountId ? accountMap.get(tx.toAccountId) : null;

          return (
            <div
              key={tx.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: category?.color
                      ? `${category.color}20`
                      : tx.type === "transfer"
                      ? "#3b82f620"
                      : tx.type === "income"
                      ? "#22c55e20"
                      : "#ef444420",
                  }}
                >
                  {tx.type === "transfer" ? (
                    "🔄"
                  ) : category?.icon ? (
                    category.icon
                  ) : tx.type === "income" ? (
                    "💰"
                  ) : (
                    "💸"
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {tx.description || (tx.type === "transfer" ? "Transfer" : category?.name || "Transaction")}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    {tx.type === "transfer" ? (
                      <span>
                        {fromAccount
                          ? `${ACCOUNT_ICONS[fromAccount.type]} ${fromAccount.name}`
                          : "Unknown"}{" "}
                        →{" "}
                        {toAccount
                          ? `${ACCOUNT_ICONS[toAccount.type]} ${toAccount.name}`
                          : "Unknown"}
                      </span>
                    ) : (
                      <span>
                        {tx.type === "income" && toAccount
                          ? `${ACCOUNT_ICONS[toAccount.type]} ${toAccount.name}`
                          : fromAccount
                          ? `${ACCOUNT_ICONS[fromAccount.type]} ${fromAccount.name}`
                          : "Unknown account"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    tx.type === "income"
                      ? "text-green-600"
                      : tx.type === "expense"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                  {formatCurrency(tx.amount)}
                </p>
                {category && tx.type !== "transfer" && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
