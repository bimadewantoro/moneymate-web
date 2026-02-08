"use server";

import { auth } from "@/auth";
import { createFinanceAccount, createCategory } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { DEFAULT_ONBOARDING_CATEGORIES } from "./constants";

interface OnboardingData {
  account: {
    name: string;
    type: "bank" | "cash" | "e-wallet";
    initialBalance: number;
  };
  selectedCategories: string[];
}

export async function completeOnboardingAction(data: OnboardingData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Create the first account
    await createFinanceAccount(userId, {
      name: data.account.name,
      type: data.account.type,
      initialBalance: Math.round(data.account.initialBalance * 100), // Convert to cents
      currency: "IDR",
    });

    // Create selected categories
    const categoriesToCreate = DEFAULT_ONBOARDING_CATEGORIES.filter((cat) =>
      data.selectedCategories.includes(cat.name)
    );

    await Promise.all(
      categoriesToCreate.map((cat) =>
        createCategory(userId, {
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
        })
      )
    );

    revalidatePath("/app");
    revalidatePath("/app/settings");
    revalidatePath("/app/transactions");

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Failed to complete setup. Please try again." };
  }
}
