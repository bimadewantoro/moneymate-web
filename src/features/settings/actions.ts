"use server";

import { auth } from "@/auth";
import {
  createFinanceAccount,
  updateFinanceAccount,
  deleteFinanceAccount,
} from "@/server/db/mutations/accounts";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories,
} from "@/server/db/mutations/categories";
import { revalidatePath } from "next/cache";
import { type Result, ok, okVoid, err } from "@/types";
import type { FinanceAccount, Category } from "@/server/db/schema";

// ============================================
// FINANCE ACCOUNTS ACTIONS
// ============================================

export async function createAccountAction(
  formData: FormData
): Promise<Result<FinanceAccount>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as
    | "bank"
    | "cash"
    | "e-wallet"
    | "investment"
    | "other";
  const initialBalance =
    parseFloat(formData.get("initialBalance") as string) || 0;
  const currency = (formData.get("currency") as string) || "IDR";

  if (!name || !type) {
    return err("Name and type are required");
  }

  try {
    const account = await createFinanceAccount(session.user.id, {
      name,
      type,
      initialBalance: Math.round(initialBalance * 100),
      currency,
    });

    revalidatePath("/budget");
    return ok(account);
  } catch (error) {
    console.error("Failed to create account:", error);
    return err("Failed to create account");
  }
}

export async function updateAccountAction(
  accountId: string,
  data: Partial<{
    name: string;
    type: "bank" | "cash" | "e-wallet" | "investment" | "other";
    initialBalance: number;
    currency: string;
    isActive: boolean;
  }>
): Promise<Result<FinanceAccount>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const updateData = { ...data };
    if (typeof updateData.initialBalance === "number") {
      updateData.initialBalance = Math.round(updateData.initialBalance * 100);
    }

    const account = await updateFinanceAccount(
      accountId,
      session.user.id,
      updateData
    );

    if (!account) {
      return err("Account not found");
    }

    revalidatePath("/budget");
    return ok(account);
  } catch (error) {
    console.error("Failed to update account:", error);
    return err("Failed to update account");
  }
}

export async function deleteAccountAction(
  accountId: string
): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const account = await deleteFinanceAccount(accountId, session.user.id);

    if (!account) {
      return err("Account not found");
    }

    revalidatePath("/budget");
    return okVoid();
  } catch (error) {
    console.error("Failed to delete account:", error);
    return err("Failed to delete account");
  }
}

// ============================================
// CATEGORIES ACTIONS
// ============================================

export async function createCategoryAction(
  formData: FormData
): Promise<Result<Category>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const color = (formData.get("color") as string) || "#6366f1";
  const icon = formData.get("icon") as string | undefined;
  const monthlyBudgetStr = formData.get("monthlyBudget") as string;
  const monthlyBudget = monthlyBudgetStr
    ? Math.round(parseFloat(monthlyBudgetStr) * 100)
    : undefined;

  if (!name || !type) {
    return err("Name and type are required");
  }

  try {
    const category = await createCategory(session.user.id, {
      name,
      type,
      color,
      icon,
      monthlyBudget,
    });

    revalidatePath("/budget");
    revalidatePath("/dashboard");
    return ok(category);
  } catch (error) {
    console.error("Failed to create category:", error);
    return err("Failed to create category");
  }
}

export async function updateCategoryAction(
  categoryId: string,
  data: Partial<{
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
    monthlyBudget: number | null;
    isActive: boolean;
  }>
): Promise<Result<Category>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const category = await updateCategory(categoryId, session.user.id, data);

    if (!category) {
      return err("Category not found");
    }

    revalidatePath("/budget");
    revalidatePath("/dashboard");
    return ok(category);
  } catch (error) {
    console.error("Failed to update category:", error);
    return err("Failed to update category");
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    const category = await deleteCategory(categoryId, session.user.id);

    if (!category) {
      return err("Category not found");
    }

    revalidatePath("/budget");
    return okVoid();
  } catch (error) {
    console.error("Failed to delete category:", error);
    return err("Failed to delete category");
  }
}

export async function initializeDefaultCategoriesAction(): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  try {
    await createDefaultCategories(session.user.id);
    revalidatePath("/budget");
    revalidatePath("/dashboard");
    return okVoid();
  } catch (error) {
    console.error("Failed to initialize default categories:", error);
    return err("Failed to initialize default categories");
  }
}
