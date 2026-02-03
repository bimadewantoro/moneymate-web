"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useSecurity } from "@/contexts/SecurityContext";

export function PinLockOverlay() {
  const { isLocked, unlock, isPinEnabled } = useSecurity();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Track the lock state to reset PIN when re-locking
  const [lastLockState, setLastLockState] = useState(isLocked);
  
  // Reset PIN when becoming locked (transition from unlocked to locked)
  if (isLocked && !lastLockState) {
    setLastLockState(true);
    setPin(["", "", "", "", "", ""]);
    setError("");
  } else if (!isLocked && lastLockState) {
    setLastLockState(false);
  }

  // Focus first input when overlay appears
  useEffect(() => {
    if (isLocked && isPinEnabled) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isLocked, isPinEnabled]);

  if (!isLocked || !isPinEnabled) {
    return null;
  }

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check PIN if all digits entered
    if (value && index === 5) {
      const fullPin = newPin.join("");
      if (fullPin.length === 6) {
        const success = unlock(fullPin);
        if (!success) {
          setError("Incorrect PIN");
          setIsShaking(true);
          setTimeout(() => {
            setIsShaking(false);
            setPin(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }, 500);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-600 dark:text-indigo-400"
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
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          MoneyMate Locked
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Enter your 6-digit PIN to unlock
        </p>

        {/* PIN Input */}
        <div
          className={`flex justify-center gap-2 sm:gap-3 mb-6 ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              autoComplete="off"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-red-500 text-sm mb-4 animate-fadeIn">
            {error}
          </p>
        )}

        {/* Hint */}
        <p className="text-center text-gray-400 dark:text-gray-500 text-xs">
          Auto-locks after 5 minutes of inactivity
        </p>
      </div>

      {/* Add shake animation styles */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
