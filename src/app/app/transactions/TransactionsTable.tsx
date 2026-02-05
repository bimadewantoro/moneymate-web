"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { deleteTransactionAction } from "./actions";
import { EditTransactionModal } from "./EditTransactionModal";
import { TransactionFilters, FilterState, defaultFilters } from "./TransactionFilters";

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  categoryId: string | null;
  type: "income" | "expense" | "transfer";
  fromAccountId: string | null;
  toAccountId: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  initialTypeFilter?: "income" | "expense" | "transfer";
  initialCategoryFilter?: string;
  initialAccountFilter?: string;
}

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

const columnHelper = createColumnHelper<Transaction>();

export function TransactionsTable({
  transactions,
  accounts,
  categories,
  initialTypeFilter,
  initialCategoryFilter,
  initialAccountFilter,
}: TransactionsTableProps) {
  // Initialize filters from URL params
  const initialFilters: FilterState = {
    ...defaultFilters,
    transactionType: initialTypeFilter || "all",
    selectedCategories: initialCategoryFilter ? [initialCategoryFilter] : [],
    selectedAccounts: initialAccountFilter ? [initialAccountFilter] : [],
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Derive sorting state from filters
  const sorting: SortingState = useMemo(() => {
    switch (filters.sortBy) {
      case "date-asc":
        return [{ id: "date", desc: false }];
      case "amount-desc":
        return [{ id: "amount", desc: true }];
      case "amount-asc":
        return [{ id: "amount", desc: false }];
      case "date-desc":
      default:
        return [{ id: "date", desc: true }];
    }
  }, [filters.sortBy]);

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Apply all filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const txDate = new Date(tx.date);
        if (filters.dateRange.start && txDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && txDate > filters.dateRange.end) {
          return false;
        }
      }

      // Transaction type filter
      if (filters.transactionType !== "all" && tx.type !== filters.transactionType) {
        return false;
      }

      // Category filter (only for non-transfers)
      if (filters.selectedCategories.length > 0 && tx.type !== "transfer") {
        if (!tx.categoryId || !filters.selectedCategories.includes(tx.categoryId)) {
          return false;
        }
      }

      // Account filter - for transfers, check both source and destination
      if (filters.selectedAccounts.length > 0) {
        const matchesAccount = 
          (tx.fromAccountId && filters.selectedAccounts.includes(tx.fromAccountId)) ||
          (tx.toAccountId && filters.selectedAccounts.includes(tx.toAccountId));
        if (!matchesAccount) {
          return false;
        }
      }

      // Uncategorized filter
      if (filters.uncategorizedOnly && tx.type !== "transfer") {
        if (tx.categoryId !== null) {
          return false;
        }
      }

      // Search filter - search in description
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const descriptionMatch = tx.description?.toLowerCase().includes(searchLower);
        if (!descriptionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    
    setDeletingId(id);
    try {
      const result = await deleteTransactionAction(id);
      if (!result.success) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-gray-600 dark:text-gray-400">
            {formatDate(info.getValue())}
          </span>
        ),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          const styles = {
            income: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            expense: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            transfer: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          };
          const icons = { income: "💰", expense: "💸", transfer: "🔄" };
          return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
              {icons[type]} {type}
            </span>
          );
        },
        filterFn: "equals",
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => {
          const value = info.getValue();
          const row = info.row.original;
          const category = row.categoryId ? categoryMap.get(row.categoryId) : null;
          
          return (
            <div>
              <p className="text-gray-900 dark:text-white font-medium">
                {value || (row.type === "transfer" ? "Transfer" : "No description")}
              </p>
              {category && (
                <span
                  className="inline-flex items-center gap-1 text-xs mt-1"
                  style={{ color: category.color }}
                >
                  {category.icon || "📁"} {category.name}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "accounts",
        header: "Account(s)",
        cell: (info) => {
          const row = info.row.original;
          const fromAccount = row.fromAccountId ? accountMap.get(row.fromAccountId) : null;
          const toAccount = row.toAccountId ? accountMap.get(row.toAccountId) : null;

          if (row.type === "transfer") {
            return (
              <div className="flex items-center gap-2 text-sm">
                {fromAccount && (
                  <span className="text-gray-700 dark:text-gray-300">
                    {ACCOUNT_ICONS[fromAccount.type]} {fromAccount.name}
                  </span>
                )}
                <span className="text-gray-400">→</span>
                {toAccount && (
                  <span className="text-gray-700 dark:text-gray-300">
                    {ACCOUNT_ICONS[toAccount.type]} {toAccount.name}
                  </span>
                )}
              </div>
            );
          }

          const account = row.type === "income" ? toAccount : fromAccount;
          return account ? (
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {ACCOUNT_ICONS[account.type]} {account.name}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right">Amount</div>,
        cell: (info) => {
          const type = info.row.original.type;
          const amount = info.getValue();
          const colorClass = {
            income: "text-green-600 dark:text-green-400",
            expense: "text-red-600 dark:text-red-400",
            transfer: "text-blue-600 dark:text-blue-400",
          };
          const prefix = { income: "+", expense: "-", transfer: "" };

          return (
            <div className={`text-right font-medium ${colorClass[type]}`}>
              {prefix[type]}{formatCurrency(amount)}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditingTransaction(info.row.original)}
              className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              title="Edit transaction"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(info.row.original.id)}
              disabled={deletingId === info.row.original.id}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Delete transaction"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ),
      }),
      // Hidden column for category filtering
      columnHelper.accessor("categoryId", {
        header: "",
        cell: () => null,
        enableHiding: true,
      }),
    ],
    [accountMap, categoryMap, deletingId, setEditingTransaction]
  );

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    state: {
      sorting,
      columnVisibility: {
        categoryId: false, // Hide the categoryId column
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <TransactionFilters
          accounts={accounts}
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={filteredTransactions.length}
        />
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No transactions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your filters to see more results
          </p>
          <button
            onClick={() => setFilters(defaultFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredTransactions.length
            )}{" "}
            of {filteredTransactions.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          accounts={accounts}
          categories={categories}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
