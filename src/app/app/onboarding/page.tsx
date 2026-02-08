import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserFinanceAccounts } from "@/lib/queries";
import { OnboardingClient } from "./OnboardingClient";
import { DEFAULT_ONBOARDING_CATEGORIES } from "./constants";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if user already has accounts (already onboarded)
  const accounts = await getUserFinanceAccounts(session.user.id);
  if (accounts.length > 0) {
    redirect("/app");
  }

  return (
    <OnboardingClient
      defaultCategories={DEFAULT_ONBOARDING_CATEGORIES}
      userName={session.user.name || "there"}
    />
  );
}
