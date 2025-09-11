"use client";

import { useAccount, useBalance as useWagmiBalance } from "wagmi";

export function useBalance() {
  const { address, isConnected } = useAccount();
  const { data, isFetching, refetch, error } = useWagmiBalance({
    address,
    query: { enabled: !!address && isConnected },
  });

  return {
    address,
    isConnected,
    balance: data?.formatted ?? "0",
    symbol: data?.symbol ?? "",
    isLoading: isFetching,
    error,
    refetch,
  };
}

