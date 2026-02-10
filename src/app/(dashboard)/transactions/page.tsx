import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserTransactions } from "@/server/db/queries/transactions";
import {
  getActiveFinanceAccounts,
} from "@/server/db/queries/accounts";
import { getActiveCategories } from "@/server/db/queries/categories";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

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
    redirect("/signin");
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
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Transactions</h1>
        {filterTitle ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Filtered: {filterTitle}</span>
            <Link href="/transactions" className="text-blue-600 hover:underline font-medium">Clear</Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Track and manage all your transactions</p>
        )}
      </header>

      {/* ═══ Desktop Header ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          {filterTitle ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Filtered by: {filterTitle}</span>
              <Link
                href="/transactions"
                className="text-blue-600 hover:underline font-medium"
              >
                Clear
              </Link>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              Track and manage all your transactions
            </p>
          )}
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Add Transaction Form */}
      <TransactionForm
        accounts={accounts}
        incomeCategories={categories.filter((c) => c.type === "income")}
        expenseCategories={categories.filter((c) => c.type === "expense")}
      />

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Transaction History
          </h2>
          <p className="text-sm text-slate-500">
            {displayTransactions.length} transaction{displayTransactions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">🏦</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No accounts yet
            </h3>
            <p className="text-slate-500 mb-4">
              Set up your accounts first to start tracking transactions
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center px-5 py-2.5 brand-gradient text-white rounded-xl hover:shadow-md transition-shadow font-medium"
            >
              Go to Settings
            </Link>
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No transactions yet
            </h3>
            <p className="text-slate-500">
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
            initialAccountFilter={params.account}
          />
        )}
      </div>
      </main>
    </div>
  );
}
