import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center gap-8 px-8 py-16 text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            MoneyMate
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your personal finance companion
          </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-gray-400 max-w-lg">
          Track your expenses, manage your budget, and take control of your financial future.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {session ? (
            <Link
              href="/app"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Track Expenses
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your spending in real-time
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Budget Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set and achieve your financial goals
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get detailed financial analytics
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
