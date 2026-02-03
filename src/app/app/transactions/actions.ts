"use server";

import { auth } from "@/auth";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getActiveFinanceAccounts,
  getActiveCategories,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

// ============================================
// TRANSACTION SERVER ACTIONS
// ============================================

export async function createTransactionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const type = formData.get("type") as "income" | "expense" | "transfer";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const fromAccountId = formData.get("fromAccountId") as string | null;
  const toAccountId = formData.get("toAccountId") as string | null;
  const dateStr = formData.get("date") as string;

  // Validation
  if (!type || isNaN(amount) || amount <= 0) {
    return { error: "Invalid transaction data" };
  }

  // Type-specific validation
  if (type === "expense" && !fromAccountId) {
    return { error: "Expense requires a source account" };
  }
  if (type === "income" && !toAccountId) {
    return { error: "Income requires a destination account" };
  }
  if (type === "transfer" && (!fromAccountId || !toAccountId)) {
    return { error: "Transfer requires both source and destination accounts" };
  }
  if (type === "transfer" && fromAccountId === toAccountId) {
    return { error: "Cannot transfer to the same account" };
  }

  try {
    const transaction = await createTransaction(session.user.id, {
      type,
      amount: Math.round(amount * 100), // Convert to cents
      description: description || undefined,
      categoryId: categoryId || undefined,
      fromAccountId: fromAccountId || undefined,
      toAccountId: toAccountId || undefined,
      date: dateStr ? new Date(dateStr) : new Date(),
    });

    revalidatePath("/app");
    revalidatePath("/app/transactions");
    return { success: true, transaction };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return { error: "Failed to create transaction" };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const type = formData.get("type") as "income" | "expense" | "transfer";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const fromAccountId = formData.get("fromAccountId") as string | null;
  const toAccountId = formData.get("toAccountId") as string | null;
  const dateStr = formData.get("date") as string;

  // Validation
  if (!type || isNaN(amount) || amount <= 0) {
    return { error: "Invalid transaction data" };
  }

  try {
    const transaction = await updateTransaction(transactionId, session.user.id, {
      type,
      amount: Math.round(amount * 100),
      description: description || undefined,
      categoryId: categoryId || undefined,
      fromAccountId: fromAccountId || undefined,
      toAccountId: toAccountId || undefined,
      date: dateStr ? new Date(dateStr) : undefined,
    });

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    revalidatePath("/app");
    revalidatePath("/app/transactions");
    return { success: true, transaction };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { error: "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const transaction = await deleteTransaction(transactionId, session.user.id);

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    revalidatePath("/app");
    revalidatePath("/app/transactions");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { error: "Failed to delete transaction" };
  }
}

// Helper action to get form data (accounts and categories)
export async function getTransactionFormData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const [accounts, allCategories] = await Promise.all([
      getActiveFinanceAccounts(session.user.id),
      getActiveCategories(session.user.id),
    ]);

    return {
      success: true,
      accounts,
      incomeCategories: allCategories.filter((c) => c.type === "income"),
      expenseCategories: allCategories.filter((c) => c.type === "expense"),
    };
  } catch (error) {
    console.error("Failed to get form data:", error);
    return { error: "Failed to load form data" };
  }
}
