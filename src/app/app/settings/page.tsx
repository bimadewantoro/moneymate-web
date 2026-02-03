import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserFinanceAccounts, getUserCategories } from "@/lib/queries";
import { AccountsSection } from "./AccountsSection";
import { CategoriesSection } from "./CategoriesSection";
import { PinSettings } from "@/components/PinSettings";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [accounts, categories] = await Promise.all([
    getUserFinanceAccounts(session.user.id),
    getUserCategories(session.user.id),
  ]);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* PIN Security Section */}
          <PinSettings />

          {/* Finance Accounts Section */}
          <AccountsSection 
            accounts={accounts.map(acc => ({
              ...acc,
              initialBalance: acc.initialBalance / 100, // Convert from cents for display
            }))} 
          />

          {/* Categories Section */}
          <CategoriesSection categories={categories} />
        </div>
      </main>
    </div>
  );
}
