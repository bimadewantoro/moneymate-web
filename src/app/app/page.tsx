import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUserAccountsWithBalances,
  getCurrentMonthStats,
  getSpendingByCategory,
  getMonthlyTrends,
  getRecentTransactions,
  getActiveCategories,
  getActiveFinanceAccounts,
  getNetWorthProgression,
  getBudgetStatus,
  getWatchlistCategories,
} from "@/lib/queries";
import { StatsCards } from "@/components/StatsCards";
import { SpendingBreakdown } from "@/components/SpendingBreakdown";
import { TrendAnalysis } from "@/components/TrendAnalysis";
import { RecentTransactions } from "@/components/RecentTransactions";
import { NetWorthProgression } from "@/components/NetWorthProgression";
import { TransactionDrawer } from "@/components/TransactionDrawer";
import { BudgetProgressCard } from "@/components/BudgetProgressCard";
import { WatchlistWidget } from "@/components/WatchlistWidget";

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount / 100); // Convert from cents
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user needs onboarding (no accounts yet)
  const existingAccounts = await getUserAccountsWithBalances(session.user.id);
  if (existingAccounts.length === 0) {
    redirect("/app/onboarding");
  }

  const [
    accountsWithBalances,
    monthStats,
    spendingByCategory,
    monthlyTrends,
    recentTransactions,
    categories,
    accounts,
    netWorthData,
    budgetStatus,
    watchlistCategories,
  ] = await Promise.all([
    Promise.resolve(existingAccounts), // Reuse the already fetched data
    getCurrentMonthStats(session.user.id),
    getSpendingByCategory(session.user.id),
    getMonthlyTrends(session.user.id, 6),
    getRecentTransactions(session.user.id, 5),
    getActiveCategories(session.user.id),
    getActiveFinanceAccounts(session.user.id),
    getNetWorthProgression(session.user.id, 6),
    getBudgetStatus(session.user.id),
    getWatchlistCategories(session.user.id),
  ]);

  const totalBalance = accountsWithBalances.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MoneyMate
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/app/transactions"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Transaction
              </Link>
              <Link
                href="/app/settings"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                )}
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {session.user.name}
                  </p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Message */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {session.user.name?.split(" ")[0]}!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here&apos;s your financial overview
            </p>
          </div>
          <Link
            href="/app/transactions"
            className="sm:hidden inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Transaction
          </Link>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalBalance={totalBalance}
          monthlyIncome={monthStats.income}
          monthlyExpenses={monthStats.expenses}
          savingsRate={monthStats.savingsRate}
          incomeTrend={monthStats.incomeTrend}
          expenseTrend={monthStats.expenseTrend}
          savingsRateTrend={monthStats.savingsRateTrend}
        />

        {/* Watchlist Widget - Only show when there are categories to watch */}
        {watchlistCategories.length > 0 && (
          <WatchlistWidget watchlist={watchlistCategories} />
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <SpendingBreakdown data={spendingByCategory} />

          {/* Monthly Trends */}
          <TrendAnalysis data={monthlyTrends} />
        </div>

        {/* Budget Overview - Full Width */}
        <BudgetProgressCard budgets={budgetStatus} />

        {/* Net Worth Progression - Full Width */}
        <NetWorthProgression data={netWorthData} />

        {/* Accounts & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Accounts
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Live balances
                </p>
              </div>
              <Link
                href="/app/settings"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                Manage →
              </Link>
            </div>

            {accountsWithBalances.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  No accounts yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add your first account to start tracking
                </p>
                <Link
                  href="/app/settings"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Account
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {accountsWithBalances.map((account) => (
                  <div
                    key={account.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                        {ACCOUNT_ICONS[account.type]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {account.type.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          account.currentBalance >= 0
                            ? "text-gray-900 dark:text-white"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(account.currentBalance)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <RecentTransactions
            transactions={recentTransactions}
            categories={categories}
            accounts={accounts}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/app/transactions"
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md group"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm">
              Ledger
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              All transactions
            </p>
          </Link>

          <Link
            href="/app/transactions?type=income"
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-md group"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 text-sm">
              Income
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Add earnings
            </p>
          </Link>

          <Link
            href="/app/transactions?type=expense"
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-all hover:shadow-md group"
          >
            <div className="text-2xl mb-2">💸</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 text-sm">
              Expense
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track spending
            </p>
          </Link>

          <Link
            href="/app/settings"
            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:shadow-md group"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 text-sm">
              Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Accounts & categories
            </p>
          </Link>
        </div>
      </main>

      {/* Mobile Floating Action Button with Drawer */}
      <TransactionDrawer
        accounts={accounts}
        incomeCategories={categories.filter((c) => c.type === "income")}
        expenseCategories={categories.filter((c) => c.type === "expense")}
      />
    </div>
  );
}
