"use client";

import { SecurityProvider } from "@/features/security/contexts/SecurityContext";
import { PinLockOverlay } from "@/features/security/components/PinLockOverlay";

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SecurityProvider>
      {children}
      <PinLockOverlay />
    </SecurityProvider>
  );
}
