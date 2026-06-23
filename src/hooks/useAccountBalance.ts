import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

export type AccountBalance = {
  workspaceId: string;
  balanceCents: number;
  currency: "USD";
  updatedAt?: string;
};

const listeners = new Set<() => void>();
let cachedBalance: AccountBalance | null = null;

function centsFromUsd(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function formatMoney(balanceCents: number, currency: AccountBalance["currency"] = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balanceCents / 100);
}

export function normalizeAccountBalance(account: any): AccountBalance {
  const billing = account?.billingAccount;
  const availableUsd = billing?.availableUsd ?? account?.creditsBalance ?? 0;
  return {
    workspaceId: account?.workspace?.id ?? account?.user?.workspaceId ?? "unknown",
    balanceCents: centsFromUsd(availableUsd),
    currency: "USD",
    updatedAt: billing?.updatedAt,
  };
}

export function invalidateAccountBalance() {
  cachedBalance = null;
  listeners.forEach((listener) => listener());
}

export function useAccountBalance(initialAccount?: any) {
  const [balance, setBalance] = useState<AccountBalance | null>(() => {
    if (initialAccount) return normalizeAccountBalance(initialAccount);
    return cachedBalance;
  });
  const [loading, setLoading] = useState(!balance);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const account = await api.me();
      const nextBalance = normalizeAccountBalance(account);
      cachedBalance = nextBalance;
      setBalance(nextBalance);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAccount) {
      const nextBalance = normalizeAccountBalance(initialAccount);
      cachedBalance = nextBalance;
      setBalance(nextBalance);
      setLoading(false);
      return;
    }
    void refresh();
  }, [initialAccount, refresh]);

  useEffect(() => {
    listeners.add(refresh);
    return () => {
      listeners.delete(refresh);
    };
  }, [refresh]);

  return {
    balance,
    loading,
    refresh,
    formatted: balance ? formatMoney(balance.balanceCents, balance.currency) : "",
  };
}
