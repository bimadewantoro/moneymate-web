"use server";

import { auth } from "@/auth";
import { createTransaction } from "@/server/db/mutations/transactions";
import { updateTransaction } from "@/server/db/mutations/transactions";
import { deleteTransaction } from "@/server/db/mutations/transactions";
import { getActiveFinanceAccounts } from "@/server/db/queries/accounts";
import { getActiveCategories } from "@/server/db/queries/categories";
import { revalidatePath } from "next/cache";
import { type Result, ok, okVoid, err } from "@/types";
import type { Transaction } from "@/server/db/schema";

// ============================================
// TRANSACTION SERVER ACTIONS
// ============================================

export async function createTransactionAction(
  formData: FormData
): Promise<Result<Transaction>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const type = formData.get("type") as "income" | "expense" | "transfer";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const fromAccountId = formData.get("fromAccountId") as string | null;
  const toAccountId = formData.get("toAccountId") as string | null;
  const dateStr = formData.get("date") as string;

  if (!type || isNaN(amount) || amount <= 0) {
    return err("Invalid transaction data");
  }

  if (type === "expense" && !fromAccountId) {
    return err("Expense requires a source account");
  }
  if (type === "income" && !toAccountId) {
    return err("Income requires a destination account");
  }
  if (type === "transfer" && (!fromAccountId || !toAccountId)) {
    return err("Transfer requires both source and destination accounts");
  }
  if (type === "transfer" && fromAccountId === toAccountId) {
    return err("Cannot transfer to the same account");
  }

  try {
    const transaction = await createTransaction(session.user.id, {
      type,
      amount: Math.round(amount * 100),
      description: description || undefined,
      categoryId: categoryId || undefined,
      fromAccountId: fromAccountId || undefined,
      toAccountId: toAccountId || undefined,
      date: dateStr ? new Date(dateStr) : new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return ok(transaction);
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return err("Failed to create transaction");
  }
}

export async function updateTransactionAction(
  transactionId: string,
  formData: FormData
): Promise<Result<Transaction>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const type = formData.get("type") as "income" | "expense" | "transfer";
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string | null;
  const fromAccountId = formData.get("fromAccountId") as string | null;
  const toAccountId = formData.get("toAccountId") as string | null;
  const dateStr = formData.get("date") as string;

  if (!type || isNaN(amount) || amount <= 0) {
    return err("Invalid transaction data");
  }

  try {
    const transaction = await updateTransaction(
      transactionId,
      session.user.id,
      {
        type,
        amount: Math.round(amount * 100),
        description: description || undefined,
        categoryId: categoryId || undefined,
        fromAccountId: fromAccountId || undefined,
        toAccountId: toAccountId || undefined,
        date: dateStr ? new Date(dateStr) : undefined,
      }
    );

    if (!transaction) {
      return err("Transaction not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return ok(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return err("Failed to update transaction");
  }
}

export async function deleteTransactionAction(
  transactionId: string
): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const transaction = await deleteTransaction(
      transactionId,
      session.user.id
    );

    if (!transaction) {
      return err("Transaction not found");
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return okVoid();
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return err("Failed to delete transaction");
  }
}

export async function getTransactionFormData() {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const [accounts, allCategories] = await Promise.all([
      getActiveFinanceAccounts(session.user.id),
      getActiveCategories(session.user.id),
    ]);

    return ok({
      accounts,
      incomeCategories: allCategories.filter((c) => c.type === "income"),
      expenseCategories: allCategories.filter((c) => c.type === "expense"),
    });
  } catch (error) {
    console.error("Failed to get form data:", error);
    return err("Failed to load form data");
  }
}
