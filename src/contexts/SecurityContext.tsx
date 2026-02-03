"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";

interface SecurityContextType {
  isLocked: boolean;
  isPinEnabled: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  enablePin: (pin: string) => void;
  disablePin: (currentPin: string) => boolean;
  changePin: (currentPin: string, newPin: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

const PIN_ENABLED_KEY = "pin_enabled";
const PIN_HASH_KEY = "pin_hash";
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple hash function for PIN (in production, use a proper crypto library)
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Store for managing lock state that persists across renders
const lockState = {
  isLocked: false,
  initialized: false,
  listeners: new Set<() => void>(),
};

// Initialize lock state from localStorage (runs once on module load)
if (typeof window !== "undefined") {
  const pinEnabled = localStorage.getItem(PIN_ENABLED_KEY) === "true";
  lockState.isLocked = pinEnabled;
  lockState.initialized = true;
}

function subscribeLockState(callback: () => void) {
  lockState.listeners.add(callback);
  return () => lockState.listeners.delete(callback);
}

function getLockStateSnapshot() {
  return lockState.isLocked;
}

function setLockState(locked: boolean) {
  lockState.isLocked = locked;
  lockState.listeners.forEach((listener) => listener());
}

// Custom hook for localStorage sync
function useLocalStorageValue(key: string): string | null {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) callback();
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [key]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const pinEnabledValue = useLocalStorageValue(PIN_ENABLED_KEY);
  const isPinEnabled = pinEnabledValue === "true";
  
  // Use external store for lock state to avoid setState in effects
  const isLocked = useSyncExternalStore(
    subscribeLockState,
    getLockStateSnapshot,
    () => false // Server snapshot
  );
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (isPinEnabled && !isLocked) {
      inactivityTimerRef.current = setTimeout(() => {
        setLockState(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [isPinEnabled, isLocked]);

  // Set up activity listeners for auto-lock
  useEffect(() => {
    if (!isPinEnabled || isLocked) {
      return;
    }

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isPinEnabled, isLocked, resetInactivityTimer]);

  const unlock = useCallback((pin: string): boolean => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (storedHash && hashPin(pin) === storedHash) {
      setLockState(false);
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    if (isPinEnabled) {
      setLockState(true);
    }
  }, [isPinEnabled]);

  const enablePin = useCallback((pin: string) => {
    localStorage.setItem(PIN_ENABLED_KEY, "true");
    localStorage.setItem(PIN_HASH_KEY, hashPin(pin));
    // Dispatch storage event to trigger sync
    window.dispatchEvent(new StorageEvent("storage", { key: PIN_ENABLED_KEY }));
    setLockState(false); // Don't lock immediately after setting
  }, []);

  const disablePin = useCallback((currentPin: string): boolean => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (storedHash && hashPin(currentPin) === storedHash) {
      localStorage.removeItem(PIN_ENABLED_KEY);
      localStorage.removeItem(PIN_HASH_KEY);
      // Dispatch storage event to trigger sync
      window.dispatchEvent(new StorageEvent("storage", { key: PIN_ENABLED_KEY }));
      setLockState(false);
      return true;
    }
    return false;
  }, []);

  const changePin = useCallback(
    (currentPin: string, newPin: string): boolean => {
      const storedHash = localStorage.getItem(PIN_HASH_KEY);
      if (storedHash && hashPin(currentPin) === storedHash) {
        localStorage.setItem(PIN_HASH_KEY, hashPin(newPin));
        return true;
      }
      return false;
    },
    []
  );

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isPinEnabled,
        unlock,
        lock,
        enablePin,
        disablePin,
        changePin,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
}
