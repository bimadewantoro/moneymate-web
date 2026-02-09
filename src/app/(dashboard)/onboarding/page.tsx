import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserFinanceAccounts } from "@/server/db/queries/accounts";
import { OnboardingClient } from "@/features/onboarding/components/OnboardingClient";
import { DEFAULT_ONBOARDING_CATEGORIES } from "@/features/onboarding/constants";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Check if user already has accounts (already onboarded)
  const accounts = await getUserFinanceAccounts(session.user.id);
  if (accounts.length > 0) {
    redirect("/dashboard");
  }

  return (
    <OnboardingClient
      defaultCategories={DEFAULT_ONBOARDING_CATEGORIES}
      userName={session.user.name || "there"}
    />
  );
}
