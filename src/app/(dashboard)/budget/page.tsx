import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserFinanceAccounts } from "@/server/db/queries/accounts";
import { getUserCategories } from "@/server/db/queries/categories";
import { getUserBaseCurrency } from "@/server/db/queries/users";
import { AccountsSection } from "@/features/settings/components/AccountsSection";
import { CategoriesSection } from "@/features/settings/components/CategoriesSection";

export default async function BudgetPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const [accounts, categories, baseCurrency] = await Promise.all([
    getUserFinanceAccounts(session.user.id),
    getUserCategories(session.user.id),
    getUserBaseCurrency(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">Budget</h1>
        <p className="text-sm text-slate-500">Manage your accounts and categories</p>
      </header>

      {/* ═══ Desktop Header ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Budget
          </h1>
          <p className="text-slate-500 text-sm">
            Manage your accounts and categories
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Finance Accounts Section */}
        <AccountsSection 
          accounts={accounts.map(acc => ({
            ...acc,
            initialBalance: acc.initialBalance / 100,
          }))}
          baseCurrency={baseCurrency}
        />

        {/* Categories Section */}
        <CategoriesSection categories={categories} baseCurrency={baseCurrency} />
      </main>
    </div>
  );
}
