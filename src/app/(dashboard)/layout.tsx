import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Sidebar } from "@/components/navigation/Sidebar";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { getActiveFinanceAccounts } from "@/server/db/queries/accounts";
import { getActiveCategories } from "@/server/db/queries/categories";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch accounts & categories for the transaction drawer
  const [accounts, categories] = await Promise.all([
    getActiveFinanceAccounts(session.user.id),
    getActiveCategories(session.user.id),
  ]);

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <DashboardShell
      accounts={accounts}
      incomeCategories={incomeCategories}
      expenseCategories={expenseCategories}
    >
      <div className="min-h-screen bg-slate-50 flex">
        {/* Desktop Sidebar */}
        <Sidebar
          userName={session.user.name}
          userImage={session.user.image}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>

        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </DashboardShell>
  );
}
