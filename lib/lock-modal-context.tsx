"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface LockModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const LockModalContext = createContext<LockModalState | undefined>(undefined);

export function LockModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <LockModalContext.Provider
      value={{ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }}
    >
      {children}
    </LockModalContext.Provider>
  );
}

export function useLockModal() {
  const ctx = useContext(LockModalContext);
  if (!ctx) throw new Error("useLockModal must be used within LockModalProvider");
  return ctx;
}
