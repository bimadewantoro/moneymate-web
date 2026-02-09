"use client";

import { useState } from "react";

interface Step3PinSetupProps {
  onComplete: (pin: string | null) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

type PinStep = "choice" | "enter" | "confirm";

export function Step3PinSetup({ onComplete, onBack, isSubmitting }: Step3PinSetupProps) {
  const [pinStep, setPinStep] = useState<PinStep>("choice");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSkip = () => {
    onComplete(null);
  };

  const handleSetupPin = () => {
    setPinStep("enter");
  };

  const handlePinEntered = () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    setError("");
    setPinStep("confirm");
  };

  const handleConfirmPin = () => {
    if (confirmPin !== pin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }
    onComplete(pin);
  };

  const handlePinChange = (value: string, isConfirm: boolean = false) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    if (isConfirm) {
      setConfirmPin(cleaned);
    } else {
      setPin(cleaned);
    }
    setError("");
  };

  const handleBackFromPin = () => {
    if (pinStep === "confirm") {
      setPinStep("enter");
      setConfirmPin("");
    } else if (pinStep === "enter") {
      setPinStep("choice");
      setPin("");
    } else {
      onBack();
    }
  };

  // Numeric keypad for PIN entry
  const renderKeypad = (currentValue: string, isConfirm: boolean = false) => {
    const handleKeyPress = (key: string) => {
      if (key === "delete") {
        const newValue = currentValue.slice(0, -1);
        handlePinChange(newValue, isConfirm);
      } else if (currentValue.length < 6) {
        handlePinChange(currentValue + key, isConfirm);
      }
    };

    return (
      <div className="space-y-4">
        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                currentValue.length > i
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {currentValue.length > i && (
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"].map(
            (key) => (
              <button
                key={key || "empty"}
                type="button"
                onClick={() => key && handleKeyPress(key)}
                disabled={!key || isSubmitting}
                className={`h-14 rounded-xl font-semibold text-xl transition-all ${
                  key === "delete"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    : key
                    ? "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500"
                    : "invisible"
                }`}
              >
                {key === "delete" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                ) : (
                  key
                )}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-8 text-center border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {pinStep === "choice" && "Secure Your App"}
          {pinStep === "enter" && "Create Your PIN"}
          {pinStep === "confirm" && "Confirm Your PIN"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {pinStep === "choice" &&
            "Add a 6-digit PIN for extra security. The app will lock after 5 minutes of inactivity."}
          {pinStep === "enter" && "Enter a 6-digit PIN to protect your financial data"}
          {pinStep === "confirm" && "Re-enter your PIN to confirm"}
        </p>
      </div>

      {/* Body */}
      <div className="p-6">
        {pinStep === "choice" && (
          <div className="space-y-4">
            {/* Security Features */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                PIN Security Features:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Auto-lock after 5 minutes of inactivity
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Stored locally on your device
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Can be changed or disabled anytime in Settings
                </li>
              </ul>
            </div>

            {/* Choice Buttons */}
            <button
              type="button"
              onClick={handleSetupPin}
              className="w-full py-4 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Set Up PIN
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-4 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Setting up...
                </span>
              ) : (
                "Skip for Now"
              )}
            </button>
          </div>
        )}

        {pinStep === "enter" && (
          <div>
            {renderKeypad(pin)}
            {error && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}
          </div>
        )}

        {pinStep === "confirm" && (
          <div>
            {renderKeypad(confirmPin, true)}
            {error && (
              <p className="text-red-500 text-sm text-center mt-4">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
        <button
          type="button"
          onClick={handleBackFromPin}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        {(pinStep === "enter" || pinStep === "confirm") && (
          <button
            type="button"
            onClick={pinStep === "enter" ? handlePinEntered : handleConfirmPin}
            disabled={
              isSubmitting ||
              (pinStep === "enter" ? pin.length !== 6 : confirmPin.length !== 6)
            }
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Finishing...
              </span>
            ) : pinStep === "enter" ? (
              <>
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            ) : (
              <>
                Finish Setup
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
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
