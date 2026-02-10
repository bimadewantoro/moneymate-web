"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface TransactionDrawerState {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (open: boolean) => void;
}

const TransactionDrawerContext = createContext<TransactionDrawerState | null>(
  null
);

export function TransactionDrawerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  return (
    <TransactionDrawerContext.Provider
      value={{ open, openDrawer, closeDrawer, setOpen }}
    >
      {children}
    </TransactionDrawerContext.Provider>
  );
}

export function useTransactionDrawer() {
  const ctx = useContext(TransactionDrawerContext);
  if (!ctx) {
    throw new Error(
      "useTransactionDrawer must be used within TransactionDrawerProvider"
    );
  }
  return ctx;
}
