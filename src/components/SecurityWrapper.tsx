"use client";

import { SecurityProvider } from "@/contexts/SecurityContext";
import { PinLockOverlay } from "@/components/PinLockOverlay";

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SecurityProvider>
      {children}
      <PinLockOverlay />
    </SecurityProvider>
  );
}
