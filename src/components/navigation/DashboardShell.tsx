"use client";

import { TransactionDrawerProvider } from "@/features/transactions/contexts/TransactionDrawerContext";
import { TransactionDrawer } from "@/features/transactions/components/TransactionDrawer";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}

export function DashboardShell({
  children,
  accounts,
  incomeCategories,
  expenseCategories,
}: DashboardShellProps) {
  return (
    <TransactionDrawerProvider>
      {children}
      <TransactionDrawer
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
    </TransactionDrawerProvider>
  );
}
