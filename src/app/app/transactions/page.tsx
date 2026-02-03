import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUserTransactions,
  getActiveFinanceAccounts,
  getActiveCategories,
} from "@/lib/queries";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionForm } from "./TransactionForm";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    account?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const params = await searchParams;

  const [transactions, accounts, categories] = await Promise.all([
    getUserTransactions(session.user.id),
    getActiveFinanceAccounts(session.user.id),
    getActiveCategories(session.user.id),
  ]);

  // Convert amounts from cents to display values
  const displayTransactions = transactions.map((tx) => ({
    ...tx,
    amount: tx.amount / 100,
  }));

  // Get filter title based on params
  const getFilterTitle = () => {
    if (params.category) {
      const cat = categories.find(c => c.id === params.category);
      return cat ? `${cat.icon || "📁"} ${cat.name}` : "Filtered";
    }
    if (params.type) {
      return params.type === "income" ? "💰 Income" : params.type === "expense" ? "💸 Expenses" : "🔄 Transfers";
    }
    return null;
  };

  const filterTitle = getFilterTitle();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Transactions
                </h1>
                {filterTitle && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Filtered by: {filterTitle}</span>
                    <Link
                      href="/app/transactions"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Clear
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block">
                {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Add Transaction Form */}
          <TransactionForm
            accounts={accounts}
            incomeCategories={categories.filter((c) => c.type === "income")}
            expenseCategories={categories.filter((c) => c.type === "expense")}
          />

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {displayTransactions.length} transaction{displayTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>

            {accounts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No accounts yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Set up your accounts first to start tracking transactions
                </p>
                <Link
                  href="/app/settings"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Settings
                </Link>
              </div>
            ) : displayTransactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No transactions yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add your first transaction using the form above
                </p>
              </div>
            ) : (
              <TransactionsTable
                transactions={displayTransactions}
                accounts={accounts}
                categories={categories}
                initialTypeFilter={params.type as "income" | "expense" | "transfer" | undefined}
                initialCategoryFilter={params.category}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
