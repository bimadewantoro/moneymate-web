"use client";

import { useRouter } from "next/navigation";
import { OnboardingWizard, OnboardingData } from "@/features/onboarding/components";
import { completeOnboardingAction } from "@/features/onboarding/actions";
import { useSecurity } from "@/features/security/contexts/SecurityContext";

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
      baseCurrency: data.baseCurrency,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Enable PIN if user chose to set one
    if (data.pin) {
      enablePin(data.pin);
    }

    // Redirect to dashboard
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Welcome Header (shown above wizard on larger screens) */}
      <div className="hidden lg:block text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome to MoneyMate, {userName}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
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
