"use server";

import { auth } from "@/auth";
import {
  createFinanceAccount,
  updateFinanceAccount,
  deleteFinanceAccount,
  createCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories,
  getUserCategories,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

// ============================================
// FINANCE ACCOUNTS ACTIONS
// ============================================

export async function createAccountAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as "bank" | "cash" | "e-wallet" | "investment" | "other";
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;
  const currency = (formData.get("currency") as string) || "IDR";

  if (!name || !type) {
    return { error: "Name and type are required" };
  }

  try {
    const account = await createFinanceAccount(session.user.id, {
      name,
      type,
      initialBalance: Math.round(initialBalance * 100), // Convert to cents
      currency,
    });

    revalidatePath("/app/settings");
    return { success: true, account };
  } catch (error) {
    console.error("Failed to create account:", error);
    return { error: "Failed to create account" };
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
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Convert initialBalance to cents if provided
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
      return { error: "Account not found" };
    }

    revalidatePath("/app/settings");
    return { success: true, account };
  } catch (error) {
    console.error("Failed to update account:", error);
    return { error: "Failed to update account" };
  }
}

export async function deleteAccountAction(accountId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const account = await deleteFinanceAccount(accountId, session.user.id);

    if (!account) {
      return { error: "Account not found" };
    }

    revalidatePath("/app/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { error: "Failed to delete account" };
  }
}

// ============================================
// CATEGORIES ACTIONS
// ============================================

export async function createCategoryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const color = (formData.get("color") as string) || "#6366f1";
  const icon = formData.get("icon") as string | undefined;
  const monthlyBudgetStr = formData.get("monthlyBudget") as string;
  const monthlyBudget = monthlyBudgetStr ? Math.round(parseFloat(monthlyBudgetStr) * 100) : undefined;

  if (!name || !type) {
    return { error: "Name and type are required" };
  }

  try {
    const category = await createCategory(session.user.id, {
      name,
      type,
      color,
      icon,
      monthlyBudget,
    });

    revalidatePath("/app/settings");
    revalidatePath("/app");
    return { success: true, category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { error: "Failed to create category" };
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
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const category = await updateCategory(categoryId, session.user.id, data);

    if (!category) {
      return { error: "Category not found" };
    }

    revalidatePath("/app/settings");
    revalidatePath("/app");
    return { success: true, category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const category = await deleteCategory(categoryId, session.user.id);

    if (!category) {
      return { error: "Category not found" };
    }

    revalidatePath("/app/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { error: "Failed to delete category" };
  }
}

export async function initializeDefaultCategoriesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if user already has categories
    const existingCategories = await getUserCategories(session.user.id);
    if (existingCategories.length > 0) {
      return { error: "Categories already exist" };
    }

    const categories = await createDefaultCategories(session.user.id);

    revalidatePath("/app/settings");
    return { success: true, categories };
  } catch (error) {
    console.error("Failed to initialize categories:", error);
    return { error: "Failed to initialize categories" };
  }
}
