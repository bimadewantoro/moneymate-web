import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getUserAccountsWithBalances,
  getUserAccountsWithConvertedBalances,
  getActiveFinanceAccounts,
} from "@/server/db/queries/accounts";
import { getActiveCategories } from "@/server/db/queries/categories";
import { getRecentTransactions } from "@/server/db/queries/transactions";
import { getGoals } from "@/server/db/queries/goals";
import { getUserBaseCurrency } from "@/server/db/queries/users";
import {
  getCurrentMonthStats,
  getSpendingByCategory,
  getMonthlyTrends,
  getNetWorthProgression,
  getBudgetStatus,
  getWatchlistCategories,
} from "@/server/db/queries/analytics";
import { SpendingBreakdown } from "@/features/dashboard/components/SpendingBreakdown";
import { TrendAnalysis } from "@/features/dashboard/components/TrendAnalysis";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";
import { NetWorthProgression } from "@/features/dashboard/components/NetWorthProgression";
import { BudgetProgressCard } from "@/features/dashboard/components/BudgetProgressCard";
import { WatchlistWidget } from "@/features/dashboard/components/WatchlistWidget";
import { TotalBalanceCard } from "@/features/dashboard/components/TotalBalanceCard";
import { GoalCard } from "@/features/goals/components/GoalCard";
import { CreateGoalModal } from "@/features/goals/components/CreateGoalModal";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  MoreHorizontal,
  Plus,
  Target,
} from "lucide-react";

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

function formatCurrency(amount: number, currency: string) {
  return formatCurrencyUtil(amount / 100, currency);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch baseCurrency first (needed for onboarding redirect and converted balances)
  const baseCurrency = await getUserBaseCurrency(session.user.id);

  // Check if user needs onboarding (no accounts yet)
  const existingAccounts = await getUserAccountsWithBalances(session.user.id);
  if (existingAccounts.length === 0) {
    redirect("/onboarding");
  }

  const [
    convertedBalancesData,
    monthStats,
    spendingByCategory,
    monthlyTrends,
    recentTransactions,
    categories,
    accounts,
    netWorthData,
    budgetStatus,
    watchlistCategories,
    savingsGoals,
  ] = await Promise.all([
    getUserAccountsWithConvertedBalances(session.user.id, baseCurrency),
    getCurrentMonthStats(session.user.id),
    getSpendingByCategory(session.user.id),
    getMonthlyTrends(session.user.id, 6),
    getRecentTransactions(session.user.id, 5),
    getActiveCategories(session.user.id),
    getActiveFinanceAccounts(session.user.id),
    getNetWorthProgression(session.user.id, 6),
    getBudgetStatus(session.user.id),
    getWatchlistCategories(session.user.id),
    getGoals(session.user.id),
  ]);

  const accountsWithBalances = convertedBalancesData.accounts;
  const totalBalance = convertedBalancesData.convertedTotal;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back,</p>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {session.user.name?.split(" ")[0]} 👋
            </h1>
          </div>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-10 h-10 rounded-full ring-2 ring-slate-200"
            />
          )}
        </div>
      </header>

      {/* ═══ Desktop Header (inside content area) ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 text-sm">
            Here&apos;s your financial overview
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* ── Total Balance Card (Premium / Credit-card style) ── */}
        <TotalBalanceCard
          totalBalance={totalBalance}
          monthlyIncome={monthStats.income}
          monthlyExpenses={monthStats.expenses}
          accounts={accountsWithBalances}
          baseCurrency={baseCurrency}
        />

        {/* ── Quick Actions ── */}
        <div className="flex items-center justify-center gap-6">
          <Link
            href="/transactions?type=income"
            className="flex flex-col items-center gap-1.5"
          >
            <span className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-slate-500">Income</span>
          </Link>
          <Link
            href="/transactions?type=expense"
            className="flex flex-col items-center gap-1.5"
          >
            <span className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-slate-500">Expense</span>
          </Link>
          <Link
            href="/transactions?type=transfer"
            className="flex flex-col items-center gap-1.5"
          >
            <span className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-slate-500">
              Transfer
            </span>
          </Link>
          <Link
            href="/budget"
            className="flex flex-col items-center gap-1.5"
          >
            <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-slate-500">More</span>
          </Link>
        </div>

        {/* ── Watchlist ── */}
        {watchlistCategories.length > 0 && (
          <WatchlistWidget watchlist={watchlistCategories} baseCurrency={baseCurrency} />
        )}

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingBreakdown data={spendingByCategory} baseCurrency={baseCurrency} />
          <TrendAnalysis data={monthlyTrends} baseCurrency={baseCurrency} />
        </div>

        {/* ── Budget ── */}
        <BudgetProgressCard budgets={budgetStatus} baseCurrency={baseCurrency} />

        {/* ── Savings Goals ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Savings Goals
              </h2>
              <p className="text-sm text-slate-500">
                Track progress towards your targets
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}

              {/* New Goal trigger card */}
              <CreateGoalModal>
                <button className="min-h-[180px] flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500 group-hover:text-blue-700 transition-colors">
                      New Goal
                    </p>
                    <p className="text-xs text-slate-400">
                      Start saving for something
                    </p>
                  </div>
                </button>
              </CreateGoalModal>
            </div>
          </div>
        </div>

        {/* ── Net Worth ── */}
        <NetWorthProgression data={netWorthData} />

        {/* ── Accounts & Recent Transactions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Your Accounts
                </h2>
                <p className="text-sm text-slate-500">Live balances</p>
              </div>
              <Link
                href="/budget"
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Manage →
              </Link>
            </div>

            {accountsWithBalances.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  No accounts yet
                </h3>
                <p className="text-slate-500 mb-4">
                  Add your first account to start tracking
                </p>
                <Link
                  href="/budget"
                  className="inline-flex items-center px-4 py-2 brand-gradient text-white rounded-xl hover:shadow-md transition-shadow"
                >
                  Add Account
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {accountsWithBalances.map((account) => (
                  <div
                    key={account.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                        {ACCOUNT_ICONS[account.type]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {account.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {account.type.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        account.currentBalance >= 0
                          ? "text-slate-900"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(account.currentBalance, baseCurrency)}
                    </p>
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
            baseCurrency={baseCurrency}
          />
        </div>
      </main>
    </div>
  );
}
