"use client";

import { useState } from "react";
import { Step1Account } from "./Step1Account";
import { Step2Categories } from "./Step2Categories";
import { Step3PinSetup } from "./Step3PinSetup";

export interface OnboardingData {
  account: {
    name: string;
    type: "bank" | "cash" | "e-wallet";
    initialBalance: number;
  } | null;
  selectedCategories: string[];
  pin: string | null;
}

interface OnboardingWizardProps {
  defaultCategories: Array<{
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  }>;
  onComplete: (data: OnboardingData) => Promise<void>;
}

export function OnboardingWizard({
  defaultCategories,
  onComplete,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    account: null,
    selectedCategories: defaultCategories.map((c) => c.name),
    pin: null,
  });

  const handleStep1Complete = (account: OnboardingData["account"]) => {
    setData((prev) => ({ ...prev, account }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (selectedCategories: string[]) => {
    setData((prev) => ({ ...prev, selectedCategories }));
    setCurrentStep(3);
  };

  const handleStep3Complete = async (pin: string | null) => {
    const finalData = { ...data, pin };
    setData(finalData);
    setIsSubmitting(true);
    try {
      await onComplete(finalData);
    } catch (error) {
      console.error("Onboarding error:", error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step === currentStep
                      ? "bg-indigo-600 text-white scale-110"
                      : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step < currentStep ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded transition-colors ${
                      step < currentStep
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {currentStep} of 3
            </h2>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {currentStep === 1 && (
            <Step1Account
              initialData={data.account}
              onComplete={handleStep1Complete}
            />
          )}
          {currentStep === 2 && (
            <Step2Categories
              defaultCategories={defaultCategories}
              initialSelected={data.selectedCategories}
              onComplete={handleStep2Complete}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <Step3PinSetup
              onComplete={handleStep3Complete}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          You can always change these settings later
        </p>
      </div>
    </div>
  );
}
