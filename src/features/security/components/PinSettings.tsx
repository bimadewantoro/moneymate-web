"use client";

import { useState } from "react";
import { useSecurity } from "@/features/security/contexts/SecurityContext";

export function PinSettings() {
  const { isPinEnabled, enablePin, disablePin, changePin } = useSecurity();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600"
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
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            PIN Security
          </h3>
          <p className="text-sm text-slate-500">
            Protect your app with a 6-digit PIN
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">
              PIN Lock
            </p>
            <p className="text-sm text-slate-500">
              {isPinEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          {isPinEnabled ? (
            <button
              onClick={() => setShowDisableModal(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={() => setShowSetupModal(true)}
              className="px-4 py-2 brand-gradient text-white rounded-lg hover:shadow-md transition-colors text-sm font-medium"
            >
              Enable
            </button>
          )}
        </div>

        {/* Change PIN (only visible when enabled) */}
        {isPinEnabled && (
          <button
            onClick={() => setShowChangeModal(true)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="text-left">
              <p className="font-medium text-slate-900">
                Change PIN
              </p>
              <p className="text-sm text-slate-500">
                Update your security PIN
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Info */}
        <p className="text-xs text-slate-400 mt-2">
          When enabled, the app will automatically lock after 5 minutes of
          inactivity.
        </p>
      </div>

      {/* Setup PIN Modal */}
      {showSetupModal && (
        <SetupPinModal
          onClose={() => setShowSetupModal(false)}
          onSetup={(pin) => {
            enablePin(pin);
            setShowSetupModal(false);
          }}
        />
      )}

      {/* Disable PIN Modal */}
      {showDisableModal && (
        <DisablePinModal
          onClose={() => setShowDisableModal(false)}
          onDisable={(pin) => {
            const success = disablePin(pin);
            if (success) {
              setShowDisableModal(false);
            }
            return success;
          }}
        />
      )}

      {/* Change PIN Modal */}
      {showChangeModal && (
        <ChangePinModal
          onClose={() => setShowChangeModal(false)}
          onChange={(currentPin, newPin) => {
            const success = changePin(currentPin, newPin);
            if (success) {
              setShowChangeModal(false);
            }
            return success;
          }}
        />
      )}
    </div>
  );
}

// Setup PIN Modal Component
function SetupPinModal({
  onClose,
  onSetup,
}: {
  onClose: () => void;
  onSetup: (pin: string) => void;
}) {
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    setStep("confirm");
    setError("");
  };

  const handleConfirmSubmit = () => {
    if (confirmPin !== pin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }
    onSetup(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 bg-white rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {step === "enter" ? "Set Up PIN" : "Confirm PIN"}
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          {step === "enter"
            ? "Enter a 6-digit PIN to secure your app"
            : "Re-enter your PIN to confirm"}
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={step === "enter" ? pin : confirmPin}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (step === "enter") {
              setPin(value);
            } else {
              setConfirmPin(value);
            }
            setError("");
          }}
          className="w-full text-center text-2xl tracking-widest py-4 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900 mb-4"
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={step === "enter" ? handlePinSubmit : handleConfirmSubmit}
            className="flex-1 py-3 px-4 brand-gradient text-white rounded-xl hover:shadow-md transition-colors font-medium"
          >
            {step === "enter" ? "Next" : "Set PIN"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Disable PIN Modal Component
function DisablePinModal({
  onClose,
  onDisable,
}: {
  onClose: () => void;
  onDisable: (pin: string) => boolean;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    const success = onDisable(pin);
    if (!success) {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 bg-white rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Disable PIN
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Enter your current PIN to disable lock
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="w-full text-center text-2xl tracking-widest py-4 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900 mb-4"
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Disable
          </button>
        </div>
      </div>
    </div>
  );
}

// Change PIN Modal Component
function ChangePinModal({
  onClose,
  onChange,
}: {
  onClose: () => void;
  onChange: (currentPin: string, newPin: string) => boolean;
}) {
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleCurrentSubmit = () => {
    if (currentPin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    setStep("new");
    setError("");
  };

  const handleNewSubmit = () => {
    if (newPin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }
    if (newPin === currentPin) {
      setError("New PIN must be different");
      return;
    }
    setStep("confirm");
    setError("");
  };

  const handleConfirmSubmit = () => {
    if (confirmPin !== newPin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }
    const success = onChange(currentPin, newPin);
    if (!success) {
      setError("Current PIN is incorrect");
      setStep("current");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    }
  };

  const getTitle = () => {
    switch (step) {
      case "current":
        return "Enter Current PIN";
      case "new":
        return "Enter New PIN";
      case "confirm":
        return "Confirm New PIN";
    }
  };

  const getCurrentValue = () => {
    switch (step) {
      case "current":
        return currentPin;
      case "new":
        return newPin;
      case "confirm":
        return confirmPin;
    }
  };

  const handleChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    switch (step) {
      case "current":
        setCurrentPin(cleanValue);
        break;
      case "new":
        setNewPin(cleanValue);
        break;
      case "confirm":
        setConfirmPin(cleanValue);
        break;
    }
    setError("");
  };

  const handleSubmit = () => {
    switch (step) {
      case "current":
        handleCurrentSubmit();
        break;
      case "new":
        handleNewSubmit();
        break;
      case "confirm":
        handleConfirmSubmit();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 bg-white rounded-2xl shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {getTitle()}
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Step {step === "current" ? 1 : step === "new" ? 2 : 3} of 3
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={getCurrentValue()}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full text-center text-2xl tracking-widest py-4 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-slate-900 mb-4"
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 brand-gradient text-white rounded-xl hover:shadow-md transition-colors font-medium"
          >
            {step === "confirm" ? "Change PIN" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
