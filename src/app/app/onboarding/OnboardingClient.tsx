"use client";

import { useRouter } from "next/navigation";
import { OnboardingWizard, OnboardingData } from "@/components/onboarding";
import { completeOnboardingAction } from "./actions";
import { useSecurity } from "@/contexts/SecurityContext";

interface OnboardingClientProps {
  defaultCategories: Array<{
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  }>;
  userName: string;
}

export function OnboardingClient({
  defaultCategories,
  userName,
}: OnboardingClientProps) {
  const router = useRouter();
  const { enablePin } = useSecurity();

  const handleComplete = async (data: OnboardingData) => {
    if (!data.account) {
      throw new Error("Account is required");
    }

    const result = await completeOnboardingAction({
      account: data.account,
      selectedCategories: data.selectedCategories,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    // Enable PIN if user chose to set one
    if (data.pin) {
      enablePin(data.pin);
    }

    // Redirect to dashboard
    router.push("/app");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Header (shown above wizard on larger screens) */}
      <div className="hidden lg:block text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to MoneyMate, {userName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Let&apos;s set up your account in a few quick steps
        </p>
      </div>

      <OnboardingWizard
        defaultCategories={defaultCategories}
        onComplete={handleComplete}
      />
    </div>
  );
}
