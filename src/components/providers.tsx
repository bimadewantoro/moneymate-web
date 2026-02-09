"use client";

import { SecurityProvider } from "@/features/security/contexts/SecurityContext";
import { PinLockOverlay } from "@/features/security/components/PinLockOverlay";

/**
 * Top-level providers wrapper.
 * Add all client-side Context providers here to keep the Root Layout clean.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SecurityProvider>
      {children}
      <PinLockOverlay />
    </SecurityProvider>
  );
}
