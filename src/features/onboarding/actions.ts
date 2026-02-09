"use server";

import { auth } from "@/auth";
import { createFinanceAccount } from "@/server/db/mutations/accounts";
import { createCategory } from "@/server/db/mutations/categories";
import { revalidatePath } from "next/cache";
import { type Result, okVoid, err } from "@/types";
import { DEFAULT_ONBOARDING_CATEGORIES } from "./constants";

interface OnboardingData {
  account: {
    name: string;
    type: "bank" | "cash" | "e-wallet";
    initialBalance: number;
  };
  selectedCategories: string[];
}

export async function completeOnboardingAction(
  data: OnboardingData
): Promise<Result<void>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err("Unauthorized");
  }

  const userId = session.user.id;

  try {
    await createFinanceAccount(userId, {
      name: data.account.name,
      type: data.account.type,
      initialBalance: Math.round(data.account.initialBalance * 100),
      currency: "IDR",
    });

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

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/transactions");

    return okVoid();
  } catch (error) {
    console.error("Onboarding error:", error);
    return err("Failed to complete setup. Please try again.");
  }
}
